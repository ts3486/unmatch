# Plan: Data Protection — Subscription Restore + Export/Import

## Context

Users who delete the app or switch devices currently lose all local data (streaks, check-ins, urge events, progress) and their purchase status. The purchase flow is stubbed (800ms `setTimeout`, no real StoreKit) and the restore button shows a placeholder. Export only shows a truncated JSON preview dialog with no way to save or share.

This plan adds two features:

1. **RevenueCat integration** — real IAP with auto-restore on every app launch
2. **JSON export/import** — shareable backup file + importable via document picker

---

## Current State

| Component | Status | File |
|-----------|--------|------|
| Subscription DB table | Done | `src/data/database.ts` — `subscription_state` (singleton row) |
| Subscription repository | Done (stub) | `src/data/repositories/subscription-repository.ts` — `recordLifetimePurchase()`, `recordMonthlySubscription()`, `getIsPremium()` |
| AppStateContext premium | Done (stub) | `src/contexts/AppStateContext.tsx` — `isPremium`, `unlockPremium()`, `refreshPremiumStatus()` |
| Paywall UI | Done (stub) | `app/paywall.tsx` — two products, purchase is `setTimeout`, restore is placeholder |
| Tab gate | Done | `app/(tabs)/_layout.tsx` — redirects to `/paywall` if `!isPremium` |
| IAP SDK | Not installed | No `react-native-purchases` in `package.json` |
| Export | Partial | `app/settings/privacy.tsx` — `gatherAllData()` shows JSON preview dialog, excludes notes/spend_amount, no file download |
| Import | Missing | No import functionality |
| Analytics events | Defined | `paywall_viewed`, `purchase_completed`, `subscription_started`, `data_exported`, `data_deleted` |

---

## Feature 1: RevenueCat Integration

### Goal

Replace the stub purchase flow with real IAP via RevenueCat. Auto-restore subscription on every app launch so users never lose premium after reinstall or device switch.

### Design Decisions

- **No separate SubscriptionContext** — integrate into existing `AppStateContext` which already holds `isPremium` and `unlockPremium`. Avoids extra context nesting.
- **Local DB is cache, RevenueCat is source of truth** — on every launch, call `getCustomerInfo()` silently, sync to `subscription_state` table, then set `isPremium`. If offline, fall back to local DB.
- **Placeholder API keys** — use `TODO_REPLACE_...` strings. Configure RevenueCat dashboard and replace before release.
- **Product IDs stay as-is** — `unmatch_monthly_499` and `unmatch_lifetime_2999` already defined in paywall.

### New Files

#### `src/services/subscription-service.ts`

RevenueCat SDK wrapper. All RevenueCat calls go through this service — screens and contexts never call the SDK directly.

```typescript
initPurchases(): Promise<void>
// Calls Purchases.configure({ apiKey }) based on Platform.OS
// Called once at app startup

getOfferings(): Promise<PurchasesOffering | null>
// Fetch current offerings for paywall display
// Falls back to null if offline

purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo>
// Wraps Purchases.purchasePackage()
// Throws on cancellation (PURCHASE_CANCELLED_ERROR)

restorePurchases(): Promise<CustomerInfo>
// Wraps Purchases.restorePurchases()

getCustomerInfo(): Promise<CustomerInfo>
// Used on app launch for silent restore

isPremiumFromCustomerInfo(info: CustomerInfo): boolean
// Checks if 'premium' entitlement is active

syncSubscriptionToDb(db: SQLiteDatabase, info: CustomerInfo): Promise<void>
// Maps CustomerInfo → subscription_state row
// Calls upsertSubscription() to persist locally
```

#### `__mocks__/react-native-purchases.ts`

Jest mock for the SDK so all existing and new tests pass.

#### `__tests__/services/subscription-service.test.ts`

Unit tests for:
- `isPremiumFromCustomerInfo` with active/expired/no entitlement
- `syncSubscriptionToDb` maps CustomerInfo fields correctly to SubscriptionState
- Lifetime vs monthly detection

### Modified Files

#### `package.json`

```diff
+ "react-native-purchases": "^8.0.0"
```

#### `app.json`

Add `react-native-purchases` to `plugins` array.

#### `src/constants/config.ts`

```typescript
export const REVENUECAT_API_KEY_IOS = 'TODO_REPLACE_WITH_IOS_KEY';
export const REVENUECAT_API_KEY_ANDROID = 'TODO_REPLACE_WITH_ANDROID_KEY';
export const RC_ENTITLEMENT_ID = 'premium';
```

#### `src/contexts/AppStateContext.tsx`

Changes to the existing provider:

1. **On mount**: after `initPurchases()`, call `getCustomerInfo()` silently → `syncSubscriptionToDb()` → `refreshPremium()`. If offline, `getCustomerInfo()` fails silently and `refreshPremium()` reads from local DB cache.
2. **Listener**: register `Purchases.addCustomerInfoUpdateListener` so renewals, expirations, and refunds update state in real-time. Cleanup in `useEffect` return.
3. **Replace `unlockPremium`**: instead of writing directly to DB, call `purchasePackage()` from subscription service. The customer info listener handles syncing to DB and refreshing state.
4. **Add `restorePurchases` action**: calls service `restorePurchases()`, listener handles the rest.
5. **Add `offerings` state** (optional): loaded from `getOfferings()` so paywall can show dynamic pricing.

```typescript
// New actions added to AppStateActions interface:
restorePurchases: () => Promise<void>;

// Updated unlockPremium signature stays the same externally,
// but implementation calls RevenueCat instead of repository directly.
```

#### `app/paywall.tsx`

1. Replace `handlePurchase` stub (`setTimeout`) with real `purchasePackage()` call
2. Replace `handleRestore` placeholder with real `restorePurchases()` call
3. Optionally show localized pricing from offerings (fall back to hardcoded if offline)
4. Handle errors: user cancellation (dismiss silently), payment failure (show message)
5. Keep existing analytics events

#### `jest.config.ts`

Add `react-native-purchases` to `moduleNameMapper` pointing to mock.

### Auto-Restore Flow (every app launch)

```
App opens
  → DatabaseProvider: initDatabase() + seedContentIfEmpty()
  → AppStateProvider mounts:
      → initPurchases() — configure RevenueCat SDK
      → getCustomerInfo() — silent, no UI
        ├─ success: syncSubscriptionToDb() → refreshPremium() → isPremium = true/false
        └─ failure (offline): refreshPremium() reads local DB cache
      → register CustomerInfo listener for real-time updates
      → load profile, progress (existing flow unchanged)
```

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Expired monthly | Listener fires → sync sets `is_premium=false` → tab layout redirects to paywall |
| Reinstall after deletion | `getCustomerInfo()` on launch finds receipt → premium restored automatically |
| Offline launch | Falls back to local DB cache — if user was premium, they stay premium |
| Grace period (billing retry) | RevenueCat keeps entitlement active during grace — no action needed |
| User cancels purchase dialog | Catch `PURCHASE_CANCELLED_ERROR`, dismiss silently |
| Refund | RevenueCat revokes entitlement → listener fires → DB syncs to expired |

---

## Feature 2: JSON Data Export/Import

### Goal

Let users export all their data as a shareable JSON file and import it on a new device or after reinstall. This is the safety net for data loss.

### Design Decisions

- **Export includes ALL user data** — notes, spend amounts, everything. This is the user's personal backup, not analytics. Differs from the current `gatherAllData()` which excludes sensitive fields.
- **Versioned format** — `version: 1` field allows future schema changes. Import validates this.
- **Atomic import** — entire import runs in a SQLite transaction. If any INSERT fails, everything rolls back.
- **`content` table excluded from export** — it's seed data, re-seeded on fresh install.
- **Subscription state included** — so premium cache survives import (though RevenueCat auto-restore handles this separately).

### Export Format

```json
{
  "version": 1,
  "exported_at": "2026-02-28T12:00:00.000Z",
  "app_version": "1.0.0",
  "tables": {
    "user_profile": [{ "id": "...", "locale": "en", ... }],
    "daily_checkins": [{ "id": "...", "date_local": "2026-02-27", "note": "felt ok", "spent_amount": 9.99, ... }],
    "urge_events": [{ "id": "...", "started_at": "2026-02-27T03:00:00Z", "spend_amount": 4.99, ... }],
    "progress": [{ "date_local": "2026-02-27", "streak_current": 5, ... }],
    "content_progress": [{ "content_id": "day_1", "completed_at": "..." }],
    "subscription_state": [{ "id": "singleton", "status": "lifetime", ... }]
  }
}
```

### New Files

#### `src/services/data-export.ts`

```typescript
interface ExportEnvelope {
  version: 1;
  exported_at: string;
  app_version: string;
  tables: {
    user_profile: UserProfile[];
    daily_checkins: DailyCheckin[];
    urge_events: UrgeEvent[];
    progress: Progress[];
    content_progress: ContentProgress[];
    subscription_state: SubscriptionState[];
  };
}

gatherExportData(db: SQLiteDatabase): Promise<ExportEnvelope>
// Queries ALL columns from all user tables (not content — seed data)
// Includes note and spend_amount (personal backup)

exportToFile(db: SQLiteDatabase): Promise<string>
// Calls gatherExportData → JSON.stringify → writes to temp file via expo-file-system
// Returns file URI for sharing
```

#### `src/services/data-import.ts`

```typescript
interface ImportValidationResult {
  valid: boolean;
  error?: string;
  version?: number;
  tableCounts?: Record<string, number>;  // for confirmation dialog
}

validateImportData(jsonString: string): ImportValidationResult
// Parses JSON, checks version=1, validates tables structure
// Returns counts per table for confirmation UI

importData(db: SQLiteDatabase, envelope: ExportEnvelope): Promise<void>
// Wraps in SQLite transaction for atomicity
// 1. DELETE all user data (same tables as existing deleteAllData)
// 2. INSERT all rows from envelope.tables
// Rolls back on any failure
```

#### `src/hooks/useDataExport.ts`

```typescript
useDataExport(): {
  isExporting: boolean;
  exportData: () => Promise<void>;
}
// Gets db from useDatabaseContext()
// exportData: calls exportToFile(db) → Sharing.shareAsync(uri)
// Tracks 'data_exported' analytics event
```

#### `src/hooks/useDataImport.ts`

```typescript
useDataImport(): {
  isImporting: boolean;
  importResult: ImportValidationResult | null;
  pickAndValidate: () => Promise<void>;
  confirmImport: () => Promise<void>;
  cancelImport: () => void;
}
// pickAndValidate: DocumentPicker.getDocumentAsync → read file → validateImportData
// confirmImport: importData(db, envelope) → refresh all app state
// cancelImport: clears importResult
```

#### `__tests__/services/data-export.test.ts`

- Envelope has `version: 1`
- All tables present with correct keys
- note and spend_amount fields ARE included
- Empty database produces valid envelope with empty arrays

#### `__tests__/services/data-import.test.ts`

- Valid JSON accepted
- Invalid version rejected
- Missing tables rejected
- Malformed JSON rejected
- Correct table counts returned for confirmation dialog

### Modified Files

#### `package.json`

```diff
+ "expo-document-picker": "~13.0.0"
+ "expo-file-system": "~19.0.0"
```

Note: `expo-sharing` is already installed.

#### `app/settings/privacy.tsx`

1. **Replace export handler**: instead of `gatherAllData()` + preview dialog, use `useDataExport().exportData()` which opens the native share sheet with a JSON file
2. **Add "Import data" row**: new button below export, uses `useDataImport()`
3. **Add import confirmation dialog**: after file picked and validated, show dialog with table counts ("This will replace your data: 15 urge events, 7 check-ins..."). Overwrite confirmation required.
4. **Update info card text**: remove note about "Note fields and spending amounts are excluded" → replace with "Export includes all your data for safekeeping."
5. **Remove old JSON preview dialog**: no longer needed
6. **Keep delete flow unchanged**

Updated UI layout:

```
┌─────────────────────────────────────────────┐
│ Your data                                    │
├─────────────────────────────────────────────┤
│ Export data                         [Export] │
│ Save a backup of all your records.           │
│─────────────────────────────────────────────│
│ Import data                         [Import]│
│ Restore from a previously exported file.     │
│─────────────────────────────────────────────│
│ Delete all data                     [Delete]│
│ Permanently removes all local records.       │
└─────────────────────────────────────────────┘
```

### Import Flow (user perspective)

1. Tap "Import" → document picker opens
2. Select a `.json` file → app validates format
3. Confirmation dialog: "This will replace all current data with: 1 profile, 15 urge events, 7 check-ins, 12 progress records. Continue?"
4. User confirms → atomic import (transaction) → all app state refreshed
5. Success alert: "Data restored successfully."

---

## Reused Existing Code

| Existing Code | Reused By |
|---------------|-----------|
| `expo-sharing` (already installed) | `useDataExport` — `Sharing.shareAsync()` |
| `subscription-repository.ts` `upsertSubscription()` | `syncSubscriptionToDb()` calls it |
| `deleteAllData()` pattern in `privacy.tsx` | Import uses same DELETE sequence before INSERT |
| Domain types in `src/domain/types.ts` | Export envelope and import validation |
| `analytics.track({ name: 'data_exported' })` | Already defined, wired in export hook |
| `getLocalDateString()` in `src/utils/date.ts` | Export timestamp |

---

## Implementation Order

### Phase 1: RevenueCat (subscription protection)

| Step | Action | File(s) |
|------|--------|---------|
| 1 | Install SDK | `package.json`, `app.json` |
| 2 | Add config constants | `src/constants/config.ts` |
| 3 | Create Jest mock | `__mocks__/react-native-purchases.ts` |
| 4 | Create subscription service (TDD) | `src/services/subscription-service.ts` |
| 5 | Write service tests | `__tests__/services/subscription-service.test.ts` |
| 6 | Modify AppStateContext | `src/contexts/AppStateContext.tsx` |
| 7 | Wire paywall | `app/paywall.tsx` |
| 8 | Update Jest config | `jest.config.ts` |

### Phase 2: Data export/import

| Step | Action | File(s) |
|------|--------|---------|
| 1 | Install dependencies | `package.json` |
| 2 | Create export service (TDD) | `src/services/data-export.ts` |
| 3 | Write export tests | `__tests__/services/data-export.test.ts` |
| 4 | Create import service (TDD) | `src/services/data-import.ts` |
| 5 | Write import tests | `__tests__/services/data-import.test.ts` |
| 6 | Create export hook | `src/hooks/useDataExport.ts` |
| 7 | Create import hook | `src/hooks/useDataImport.ts` |
| 8 | Update privacy screen | `app/settings/privacy.tsx` |

### Phase 3: Verification

- [ ] `pnpm run preflight` passes (typecheck + lint + test)
- [ ] `npx expo export --platform ios` bundles without errors
- [ ] `npx expo prebuild --clean` (required for `react-native-purchases` native module)

---

## Verification Checklist

### Subscription
- [ ] App launch silently calls `getCustomerInfo()` and syncs to local DB
- [ ] Paywall purchase calls RevenueCat SDK (not `setTimeout` stub)
- [ ] Paywall restore calls `restorePurchases()` (not placeholder message)
- [ ] Offline launch falls back to local DB — premium users stay premium
- [ ] `isPremiumFromCustomerInfo` tested with active/expired/no entitlement

### Export/Import
- [ ] Export opens native share sheet with JSON file
- [ ] Export includes ALL fields (notes, spend amounts)
- [ ] Export envelope has `version: 1` and all 6 table keys
- [ ] Import opens document picker, validates file format
- [ ] Import shows confirmation dialog with table counts
- [ ] Import is atomic (rolls back on failure)
- [ ] Import refreshes all app state after completion
- [ ] Import rejects invalid version, missing tables, malformed JSON

### Ship Checklist (from CLAUDE.md)
- [ ] Airplane mode: purchase check degrades gracefully, falls back to local DB
- [ ] Export/delete works end-to-end
- [ ] Forbidden wording scan passes on new strings
- [ ] Analytics: no `note` or `spend_amount` in any event payload

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `react-native-purchases` requires native modules | Must run `npx expo prebuild --clean` after install. Do this early. |
| RevenueCat API key management | Use placeholder strings, replace before release. Consider `app.config.ts` with env vars for CI. |
| `expo-document-picker` type filtering on Android | Also validate file content after selection, don't rely solely on MIME filter. |
| Import data integrity | Wrap entire import in SQLite transaction — rolls back on any failure. |
| Export file size for heavy users | `expo-sharing` handles large files. No pagination needed for V1. |
