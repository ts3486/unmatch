# React Native → Swift/SwiftUI Migration Guide

This document captures the full migration process used to rewrite the Unmatch app from Expo/React Native/TypeScript to pure Swift/SwiftUI. Use it as a playbook for repeating the process on similar projects.

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Branch Strategy](#branch-strategy)
3. [What to Keep vs Delete](#what-to-keep-vs-delete)
4. [Technology Mapping](#technology-mapping)
5. [Migration Phases](#migration-phases)
6. [Xcode Project Setup (xcodegen)](#xcode-project-setup-xcodegen)
7. [Common Bugs & Obstacles](#common-bugs--obstacles)
8. [Testing Strategy](#testing-strategy)
9. [Build & Run Commands](#build--run-commands)

---

## Pre-Migration Checklist

Before starting:

- [ ] All RN code is committed and pushed to `main`
- [ ] Create a feature branch (`feature/swift-ui-migration`)
- [ ] Read and catalog every source file — types, business logic, DB schema, seed data, tests
- [ ] Document all domain rules that must be preserved exactly (locked constants, enums, schema column names)
- [ ] Identify the exact SQLite schema (table names, column names, types) — this must match exactly
- [ ] Install `xcodegen` (`brew install xcodegen`) for generating the Xcode project from YAML

## Branch Strategy

```
main                    ← Original RN app (safe, untouched)
feature/swift-ui-migration ← All Swift work happens here
```

**Never delete the RN code on `main`.** The Swift rewrite lives entirely on the feature branch. Switch back anytime with `git checkout main`.

## What to Keep vs Delete

### Keep
```
.git/                    # Version history
assets/images/           # Copy into Assets.xcassets
data/seed/*.json         # Bundle as Xcode resources
CLAUDE.md                # Update for Swift stack
SPEC.md                  # Domain spec unchanged
docs/                    # Documentation
e2e/                     # Maestro tests still work against native app
```

### Delete
```
app/                     # expo-router screens
src/                     # All TypeScript source
modules/                 # Native modules
__tests__/               # Jest tests (port to XCTest)
__mocks__/               # Jest mocks
ios/                     # Expo-generated Xcode project
android/                 # Android build
node_modules/            # npm dependencies
package.json, pnpm-lock.yaml, tsconfig.json
jest.config.ts, metro.config.js, app.json, eas.json
biome.json, expo-env.d.ts, .expo/
```

## Technology Mapping

| RN/Expo Concept | Swift/SwiftUI Equivalent |
|----------------|--------------------------|
| TypeScript types | Swift enums (String raw values) + Codable structs |
| expo-router | NavigationStack + TabView |
| react-native-paper | SwiftUI native components |
| React Context + hooks | ObservableObject + @EnvironmentObject |
| expo-sqlite | GRDB.swift (SPM) |
| date-fns / date-fns-tz | Foundation Calendar / DateFormatter |
| RevenueCat RN SDK | RevenueCat purchases-ios (SPM) |
| expo-notifications | UNUserNotificationCenter |
| expo-sharing + view-shot | UIActivityViewController + ImageRenderer |
| expo-haptics | UIImpactFeedbackGenerator |
| Jest | XCTest |
| useState/useEffect | @State / @Published / .onAppear / .task |
| useCallback | Regular Swift methods |
| useRef (timer) | @State var timer: Timer? |
| Animated (RN) | SwiftUI .animation / withAnimation |
| StyleSheet | ViewModifier / direct modifiers |
| AsyncStorage | Not needed (GRDB handles persistence) |
| Platform.OS checks | Not needed (iOS only) |

### Type Porting Rules

| TypeScript | Swift |
|-----------|-------|
| `string` union types (`'swipe' \| 'check'`) | `enum UrgeKind: String, Codable { case swipe, check, spend }` |
| `interface Foo { ... }` | `struct Foo: Codable { ... }` |
| `number \| null` | `Int?` |
| `boolean` stored as 0/1 in SQLite | `Int?` (keep as Int for DB compat) or `Bool` with manual mapping |
| `Record<string, string>` | `[String: String]` |
| Keyword conflicts (`none`) | Backtick escape: `` case `none` `` |

## Migration Phases

### Phase 1: Scaffold + Domain + Theme
**Goal:** Xcode project compiles, pure logic tests pass.

1. Delete all RN files
2. Create directory structure (see below)
3. Install xcodegen, create project.yml
4. Add SPM packages: GRDB.swift, RevenueCat
5. Port: Types.swift, Config.swift, ProgressRules.swift, DateUtilities.swift, AppTheme.swift
6. Port pure logic tests: ProgressRulesTests, ConfigTests, DateUtilitiesTests

**Key insight:** Start with types and pure functions. They have zero dependencies and let you validate the domain logic immediately.

### Phase 2: Data Layer
**Goal:** GRDB database + repositories + seed loading.

1. DatabaseManager (GRDB pool, WAL mode, migrations)
2. All repository files (direct ports of TS repos)
3. Seed models (Codable structs matching JSON shape)
4. SeedLoader (bundle JSON decode + content table seed)

**Critical:** The DB column `resist_count_total` maps to domain field `meditation_count_total`. Preserve the legacy column name in SQL but use the clean name in Swift structs.

### Phase 3: Services
Analytics, Notifications, Subscription (RevenueCat), DataExport, DataImport, Share.

### Phase 4: App Shell + Navigation
@main entry point, AppState (ObservableObject), ContentView gate, MainTabView, stub views for each tab.

### Phases 5-9: UI Screens
Onboarding, Home, Panic (state machine), Progress, Learn, Settings — all can be parallelized.

### Phase 10: Polish
Wire up RevenueCat init, foreground sync, AppState enhancements, CLAUDE.md update.

## Xcode Project Setup (xcodegen)

### Install
```bash
brew install xcodegen
```

### project.yml Template
```yaml
name: Unmatch
options:
  bundleIdPrefix: com.your.prefix
  deploymentTarget:
    iOS: "16.0"

packages:
  GRDB:
    url: https://github.com/groue/GRDB.swift
    from: "6.29.0"
  RevenueCat:
    url: https://github.com/RevenueCat/purchases-ios-spm
    from: "5.0.0"

targets:
  YourApp:
    type: application
    platform: iOS
    sources:
      - path: YourApp          # Include EVERYTHING — Swift + resources
    settings:
      base:
        GENERATE_INFOPLIST_FILE: YES
        SWIFT_VERSION: "5.9"
        # Disable code signing for simulator builds
        CODE_SIGN_IDENTITY: ""
        CODE_SIGNING_REQUIRED: "NO"
        CODE_SIGNING_ALLOWED: "NO"
    dependencies:
      - package: GRDB
      - package: RevenueCat
        product: RevenueCat

  YourAppTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - path: YourAppTests
    resources:
      - path: YourApp/Resources/catalog.json
        buildPhase: resources
      - path: YourApp/Resources/starter_7d.json
        buildPhase: resources
    dependencies:
      - target: YourApp
```

### Generate & Build
```bash
xcodegen generate
xcodebuild -project YourApp.xcodeproj -scheme YourApp \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
```

## Common Bugs & Obstacles

### 1. Bundle Resources Not Found at Runtime (CRASH)

**Symptom:** `fatalError("Failed to load catalog.json from bundle")` — app crashes on launch.

**Root cause:** xcodegen was configured with `excludes: ["Resources/**"]` in the `sources` section, and a separate `resources` section. The JSON files were excluded from sources but not properly added as resources.

**Fix:** Don't exclude the Resources folder. Let xcodegen auto-detect file types:
```yaml
sources:
  - path: YourApp    # No excludes — xcodegen handles .json as resources automatically
```

xcodegen recognizes `.json`, `.xcassets`, etc. as resources and puts them in the "Copy Bundle Resources" build phase automatically. **Do not manually exclude and re-include them.**

**Verification:** After building, check the bundle:
```bash
ls ~/Library/Developer/Xcode/DerivedData/YourApp-*/Build/Products/Debug-iphonesimulator/YourApp.app/catalog.json
```

### 2. Missing AppIcon Asset Catalog

**Symptom:** `error: None of the input catalogs contained a matching stickers icon set, app icon set, or icon stack named "AppIcon"`

**Fix:** Create the AppIcon.appiconset directory with a Contents.json:
```bash
mkdir -p YourApp/Resources/Assets.xcassets/AppIcon.appiconset
```
```json
{
  "images": [{"idiom": "universal", "platform": "ios", "size": "1024x1024"}],
  "info": {"author": "xcode", "version": 1}
}
```

Also create `Assets.xcassets/Contents.json`:
```json
{"info": {"author": "xcode", "version": 1}}
```

### 3. `onChange(of:)` iOS 17 API on iOS 16 Target

**Symptom:** `'onChange(of:initial:_:)' is only available in iOS 17.0 or newer`

**Root cause:** The two-parameter `onChange(of:) { oldValue, newValue in }` syntax is iOS 17+.

**Fix:** Use the single-parameter iOS 16 version:
```swift
// iOS 17+ (WRONG for iOS 16 target)
.onChange(of: value) { _, newValue in ... }

// iOS 16+ (CORRECT)
.onChange(of: value) { newValue in ... }
```

### 4. @MainActor Method Called from GRDB Write Closure

**Symptom:** `call to main actor-isolated instance method in a synchronous nonisolated context`

**Root cause:** GRDB's `dbPool.write { db in }` closure runs on a background thread. If your ViewModel is `@MainActor`, its methods can't be called from that closure.

**Fix:** Mark the DB-only helper as `nonisolated`:
```swift
@MainActor
final class MyViewModel: ObservableObject {
    // Called from dbPool.write — must be nonisolated
    private nonisolated func updateProgress(db: Database, ...) throws -> Int {
        // Pure DB operations only, no @Published property access
    }

    func logOutcome() {
        Task {
            let result = try await dbPool.write { db in
                try self.updateProgress(db: db, ...)  // OK: nonisolated
            }
            self.somePublishedProperty = result  // OK: back on MainActor
        }
    }
}
```

### 5. Test Bundle Can't Find JSON Resources

**Symptom:** XCTest crashes with `Unexpectedly found nil while unwrapping an Optional value` when loading JSON in setUp.

**Root cause:** `Bundle(for: type(of: self))` returns the test bundle, but resources may be in a different bundle depending on how xcodegen configured them.

**Fix:** Search all bundles with a fallback, and use `XCTSkip` instead of force-unwrap:
```swift
private func findResource(_ name: String, ext: String) -> URL? {
    if let url = Bundle(for: type(of: self)).url(forResource: name, withExtension: ext) { return url }
    if let url = Bundle.main.url(forResource: name, withExtension: ext) { return url }
    for bundle in Bundle.allBundles {
        if let url = bundle.url(forResource: name, withExtension: ext) { return url }
    }
    return nil
}

override func setUpWithError() throws {
    guard let url = findResource("catalog", ext: "json") else {
        throw XCTSkip("catalog.json not found in any bundle")
    }
    // ...
}
```

Also ensure the test target has the resources listed in project.yml:
```yaml
UnmatchTests:
  resources:
    - path: YourApp/Resources/catalog.json
      buildPhase: resources
```

### 6. UserProfile.plan_selected Type Mismatch

**Symptom:** The TS version has `plan_selected: string` but the Swift port has `plan_selected: Int`.

**Root cause:** Agent ported it as Int because the DB column is TEXT but the value looked numeric.

**Lesson:** Always verify type mappings against both the TypeScript types AND the actual SQLite schema. When in doubt, match the TypeScript type exactly (use String).

### 7. Simulator Device Not Found

**Symptom:** `Unable to find a device matching the provided destination specifier`

**Fix:** List available simulators first:
```bash
xcrun simctl list devices available | grep iPhone
```
Then use the exact name from the output.

### 8. GRDB `DatabaseValue` for Optional Parameters

**Root cause:** GRDB's `arguments:` array doesn't accept bare `nil` — you need `DatabaseValue.null`.

**Pattern:**
```swift
// For optional String
myOptionalString.map { DatabaseValue(value: $0) } ?? DatabaseValue.null

// For optional enum
myOptionalEnum.map { DatabaseValue(value: $0.rawValue) } ?? DatabaseValue.null

// For optional Int
myOptionalInt.map { DatabaseValue(value: $0) } ?? DatabaseValue.null
```

### 9. SwiftUI ProgressView Name Collision

**Symptom:** Your custom `ProgressView` conflicts with SwiftUI's built-in `ProgressView`.

**Fix:** Name your view something else, e.g., `ProgressContainerView`.

### 10. Codable Structs with `let` Properties Can't Be Mutated

**Root cause:** If your TS code mutates objects after creation (e.g., setting `id` and `created_at` after insert), the Swift struct with `let` properties won't allow that.

**Fix:** Either use `var` for mutable properties, or construct a new struct with the final values:
```swift
// Instead of mutating, return a new struct
return UserProfile(id: generatedId, created_at: now, ...)
```

## Testing Strategy

| TS Test Type | Swift Equivalent | Notes |
|-------------|-----------------|-------|
| Jest `describe/it` | XCTest `class/func test*` | One test class per describe block |
| `expect(x).toBe(y)` | `XCTAssertEqual(x, y)` | |
| `expect(x).toBeNull()` | `XCTAssertNil(x)` | |
| `expect(x).not.toBeNull()` | `XCTAssertNotNil(x)` | |
| `expect(x).toBeGreaterThan(y)` | `XCTAssertGreaterThan(x, y)` | |
| `expect(() => f()).toThrow()` | `XCTAssertThrowsError(try f())` | |
| `jest.fn()` mock | Protocol + test double class | No built-in mocking |
| `beforeEach` | `override func setUp()` | |
| `beforeAll` | `override class func setUp()` | |

## Build & Run Commands

```bash
# Generate Xcode project from project.yml
xcodegen generate

# Build
xcodebuild -project Unmatch.xcodeproj -scheme Unmatch \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build

# Run tests
xcodebuild -project Unmatch.xcodeproj -scheme UnmatchTests \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test

# Install and launch on simulator
xcrun simctl boot "iPhone 17 Pro"
open -a Simulator
xcrun simctl install "iPhone 17 Pro" \
  ~/Library/Developer/Xcode/DerivedData/Unmatch-*/Build/Products/Debug-iphonesimulator/Unmatch.app
xcrun simctl launch "iPhone 17 Pro" com.h25ksmwn99.unmatch

# Or just open in Xcode and Cmd+R
open Unmatch.xcodeproj
```

## Directory Structure Reference

```
project.yml                      # xcodegen config
Unmatch.xcodeproj/               # Generated (don't edit manually)
Unmatch/
  App/
    UnmatchApp.swift             # @main entry point
    AppState.swift               # ObservableObject (global state)
    ContentView.swift            # Onboarding vs tabs gate
  Domain/
    Types.swift                  # All enums + structs
    ProgressRules.swift          # Pure business logic
    Config.swift                 # LOCKED constants
  Data/
    Database/
      DatabaseManager.swift      # GRDB pool + migrations
    Repositories/
      UserRepository.swift
      UrgeRepository.swift
      CheckinRepository.swift
      ProgressRepository.swift
      ContentRepository.swift
      SubscriptionRepository.swift
    Seed/
      SeedLoader.swift           # JSON decode + DB seed
      CatalogModels.swift        # Codable for catalog.json
      StarterCourseModels.swift  # Codable for starter_7d.json
  Services/
    AnalyticsService.swift
    NotificationService.swift
    SubscriptionService.swift
    DataExportService.swift
    DataImportService.swift
    ShareService.swift
  Theme/
    AppTheme.swift               # Color palette
  Utilities/
    DateUtilities.swift
  Views/
    Onboarding/                  # 4-step flow
    Paywall/                     # IAP screen
    Tabs/
      MainTabView.swift          # 5-tab container
      Home/                      # Home tab views
      Panic/                     # Reset flow (state machine)
      Progress/                  # Calendar + stats
      Learn/                     # 7-day course
      Settings/                  # Preferences + data management
    DayDetail/                   # Day drill-down
    Checkin/                     # Rating chips + overlay
    Components/                  # Reusable (BreathingCircle, Confetti, Logo)
  Resources/
    Assets.xcassets/             # App icon + images
    catalog.json                 # Seed data (bundled)
    starter_7d.json              # Seed data (bundled)
UnmatchTests/
  Domain/                        # Pure logic tests
  Repositories/                  # DB tests
  Services/                      # Service tests
  Seed/                          # Seed integrity tests
  Utilities/                     # Date util tests
  Wording/                       # Forbidden wording scan
```
