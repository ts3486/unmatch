// Generate 3 individual App Store screenshot HTML files (Japanese) and capture them with headless Chrome.
// Mirrors generate.js exactly (layout, sizing, colors) with translated copy + JP font.
// Usage: node generate_ja.js (then render each *_ja.html with headless Chrome)

const fs = require('fs');
const path = require('path');

const WIDTH = 1242;
const HEIGHT = 2688;

const dir = path.join(__dirname);
const logoSmallB64 = fs.readFileSync(path.join(dir, 'logo_small.b64'), 'utf8').trim();

const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT + 100}px;
    font-family: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #2d1050;
  }
  .ss {
    width: ${WIDTH}px;
    height: ${HEIGHT + 100}px;
    background: linear-gradient(160deg, #0B1220 0%, #121C2E 40%, #1a1040 70%, #2d1050 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .sparkle {
    position: absolute;
    bottom: 200px;
    right: 80px;
    width: 60px;
    height: 60px;
    opacity: 0.6;
  }
  .sparkle svg { width: 100%; height: 100%; }
  .headline-area {
    padding-top: 0;
    padding-bottom: 30px;
    text-align: center;
    z-index: 2;
    flex-shrink: 0;
  }
  .headline {
    font-size: 72px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.3;
    letter-spacing: -0.5px;
    max-width: 980px;
    margin: 0 auto;
    padding: 0 40px;
  }
  .subheadline {
    font-size: 40px;
    font-weight: 400;
    color: #A7B3C7;
    line-height: 1.6;
    margin-top: 28px;
    max-width: 880px;
    margin-left: auto;
    margin-right: auto;
  }
  .phone-frame {
    width: 780px;
    height: 1600px;
    background: #000;
    border-radius: 100px;
    border: 6px solid #333;
    position: relative;
    overflow: hidden;
    margin-top: 20px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.05);
    z-index: 2;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .dynamic-island {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 240px;
    height: 70px;
    background: #000;
    border-radius: 40px;
    z-index: 10;
  }
  .status-bar {
    height: 110px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 60px 10px;
    color: #fff;
    font-size: 32px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .status-time { font-weight: 700; }
  .status-icons { display: flex; gap: 12px; align-items: center; }
  .status-icons svg { width: 32px; height: 32px; }
  .screen-content {
    flex: 1;
    padding: 20px 44px;
    display: flex;
    flex-direction: column;
    background: #0B1220;
    overflow: hidden;
  }
  .tab-bar {
    height: 140px;
    background: #0B1220;
    border-top: 2px solid #223049;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 30px 30px;
    flex-shrink: 0;
  }
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .tab-item svg { width: 44px; height: 44px; }
  .tab-label {
    font-size: 20px;
    font-weight: 500;
    color: #A7B3C7;
  }
  .tab-item.active .tab-label { color: #4C8DFF; }
  .home-indicator {
    width: 260px;
    height: 8px;
    background: rgba(255,255,255,0.3);
    border-radius: 4px;
    margin: 0 auto 16px;
    flex-shrink: 0;
  }
  .glow-blue {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(76,141,255,0.12) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .glow-purple {
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const statusBarHTML = `
<div class="status-bar">
  <span class="status-time">9:41</span>
  <div class="status-icons">
    <svg viewBox="0 0 24 24" fill="white"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
    <svg viewBox="0 0 24 24" fill="white"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
  </div>
</div>`;

const sparkleHTML = `
<div class="sparkle">
  <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
</div>`;

function tabBarHTML(activeIndex) {
  const tabs = [
    { label: 'ホーム', icon: '<path d="M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4m0-12C9.79 6 8 7.79 8 10s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4"/>' },
    { label: '記録', icon: '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>' },
    { label: '学ぶ', icon: '<path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>' },
    { label: '設定', icon: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' },
  ];
  return `<div class="tab-bar">${tabs.map((t, i) => `
    <div class="tab-item${i === activeIndex ? ' active' : ''}">
      <svg viewBox="0 0 24 24" fill="${i === activeIndex ? '#4C8DFF' : '#A7B3C7'}">${t.icon}</svg>
      <span class="tab-label">${t.label}</span>
    </div>`).join('')}
  </div>
  <div class="home-indicator"></div>`;
}

const logoSVG = `<img src="data:image/png;base64,${logoSmallB64}" width="52" height="52" style="object-fit:contain;" />`;

// ========== Screenshot 1: Home / Breathing ==========
const ss1 = `
<div class="ss">
  <div class="glow-blue" style="top:300px;right:-200px;"></div>
  <div class="glow-purple" style="bottom:200px;left:-150px;"></div>
  <div class="headline-area">
    <div class="headline">衝動が来たら<br>深呼吸をしよう</div>
    <div class="subheadline">60秒のガイド付きリセットで<br>心を落ち着けて、やり過ごそう。</div>
  </div>
  <div class="phone-frame">
    <div class="dynamic-island"></div>
    ${statusBarHTML}
    <div class="screen-content">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-top:8px;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${logoSVG}
          <span style="font-size:36px;font-weight:700;color:#E6EDF7;">Unmatch</span>
        </div>
        <div style="background:#1A3D2E;border:2px solid #47C28B;border-radius:32px;padding:10px 24px;display:flex;align-items:center;gap:10px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#47C28B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          <span style="color:#47C28B;font-size:24px;font-weight:600;">本日完了</span>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">
        <div style="font-size:38px;font-weight:600;color:#7AA7FF;text-align:center;line-height:1.5;padding:0 20px;min-height:120px;display:flex;align-items:center;">誰かに認めてもらう必要はない。</div>
        <div style="width:380px;height:380px;border-radius:50%;border:4px solid #47C28B;display:flex;align-items:center;justify-content:center;">
          <div style="width:340px;height:340px;border-radius:50%;background:radial-gradient(circle at 40% 40%, rgba(71,194,139,0.35), rgba(71,194,139,0.12) 70%, transparent);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;font-weight:700;color:#fff;">5</span>
          </div>
        </div>
        <div style="font-size:42px;font-weight:700;color:#47C28B;letter-spacing:2px;">吐く</div>
        <div style="text-align:center;margin-top:8px;">
          <div style="font-size:22px;font-weight:600;color:#A7B3C7;letter-spacing:3px;">セッション</div>
          <div style="font-size:52px;font-weight:600;color:#E6EDF7;margin-top:4px;">0:41</div>
        </div>
        <div style="display:flex;align-items:center;gap:24px;margin-top:20px;">
          <div style="text-align:center;"><div style="font-size:24px;font-weight:500;color:#A7B3C7;">吸う</div><div style="font-size:20px;color:#223049;margin-top:2px;">4s</div></div>
          <div style="width:40px;height:2px;background:#223049;"></div>
          <div style="text-align:center;"><div style="font-size:24px;font-weight:500;color:#A7B3C7;">止める</div><div style="font-size:20px;color:#223049;margin-top:2px;">2s</div></div>
          <div style="width:40px;height:2px;background:#223049;"></div>
          <div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:#E6EDF7;">吐く</div><div style="font-size:20px;color:#A7B3C7;margin-top:2px;">6s</div></div>
        </div>
      </div>
      <div style="border-top:2px solid #223049;padding:24px 0 8px;">
        <div style="background:#4C8DFF;border-radius:28px;padding:28px 0;text-align:center;"><span style="color:#fff;font-size:30px;font-weight:600;">デイリーチェックイン</span></div>
      </div>
    </div>
    ${tabBarHTML(0)}
  </div>
  ${sparkleHTML}
</div>`;

// ========== Screenshot 2: Check-in ==========
function checkmarkSVG(color) {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="${color}" style="margin-right:8px;flex-shrink:0;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
}

function pillChip(text, selected) {
  return `<div style="display:inline-flex;align-items:center;border:2px solid ${selected ? "#4C8DFF" : "#223049"};border-radius:22px;padding:13px 24px;background:${selected ? "#0F1D3A" : "#0B1220"};">${selected ? checkmarkSVG("#E6EDF7") : ""}<span style="font-size:20px;color:${selected ? "#E6EDF7" : "#A7B3C7"};font-weight:${selected ? "700" : "400"};white-space:nowrap;">${text}</span></div>`;
}

const ss2 = `
<div class="ss">
  <div class="glow-blue" style="top:500px;left:-200px;"></div>
  <div class="glow-purple" style="bottom:300px;right:-200px;"></div>
  <div class="headline-area">
    <div class="headline">毎日、自分と<br>向き合う時間を</div>
    <div class="subheadline">気分・衝動・成功を記録 —<br>すべて非公開・オフラインで。</div>
  </div>
  <div class="phone-frame">
    <div class="dynamic-island"></div>
    ${statusBarHTML}
    <div class="screen-content">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#182338;border-radius:30px;padding:10px 22px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#E6EDF7"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          <span style="font-size:20px;color:#E6EDF7;font-weight:500;">戻る</span>
        </div>
        <div style="flex:1;text-align:center;margin-right:130px;"><span style="font-size:20px;color:#E6EDF7;font-weight:600;">デイリーチェックイン</span></div>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <div style="font-size:36px;font-weight:700;color:#E6EDF7;margin-bottom:8px;">デイリーチェックイン</div>
        <div style="font-size:19px;color:#A7B3C7;line-height:1.5;margin-bottom:14px;">1日の終わりに、気分や衝動、パターンを振り返りましょう。マッチングアプリとの関わり方を理解し、時間の経過とともに進捗を追うのに役立ちます。</div>

        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:2px 26px;margin-bottom:12px;">
          <div style="padding:12px 0;">
            <div style="font-size:22px;font-weight:600;color:#E6EDF7;">気分</div>
            <div style="font-size:17px;color:#A7B3C7;margin-top:2px;margin-bottom:10px;">今の気分はどうですか?</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              ${pillChip("低い", false)}
              ${pillChip("まあまあ", true)}
              ${pillChip("最高", false)}
            </div>
          </div>
          <div style="height:2px;background:#223049;"></div>
          <div style="padding:12px 0;">
            <div style="font-size:22px;font-weight:600;color:#E6EDF7;margin-bottom:10px;">疲労感</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              ${pillChip("元気", false)}
              ${pillChip("疲れた", true)}
              ${pillChip("限界", false)}
            </div>
          </div>
          <div style="height:2px;background:#223049;"></div>
          <div style="padding:12px 0;">
            <div style="font-size:22px;font-weight:600;color:#E6EDF7;margin-bottom:10px;">衝動の強さ</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              ${pillChip("落ち着いている", false)}
              ${pillChip("強い", true)}
              ${pillChip("抑えられない", false)}
            </div>
          </div>
        </div>

        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:2px 26px;margin-bottom:12px;">
          <div style="padding:12px 0;">
            <div style="font-size:22px;font-weight:600;color:#E6EDF7;margin-bottom:10px;">夜遅くにマッチングアプリを開きましたか?</div>
            <div style="display:flex;gap:12px;">
              ${pillChip("はい", false)}
              ${pillChip("いいえ", false)}
            </div>
          </div>
          <div style="height:2px;background:#223049;"></div>
          <div style="padding:12px 0;">
            <div style="font-size:22px;font-weight:600;color:#E6EDF7;margin-bottom:10px;">今日、デートにお金を使いましたか?</div>
            <div style="display:flex;gap:12px;">
              ${pillChip("はい", false)}
              ${pillChip("いいえ", false)}
            </div>
          </div>
        </div>

        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:16px 26px;">
          <div style="font-size:22px;font-weight:600;color:#E6EDF7;margin-bottom:10px;">個人的なメモ(任意)</div>
          <div style="background:#0B1220;border:2px solid #223049;border-radius:16px;padding:16px;color:#A7B3C7;font-size:18px;line-height:1.55;min-height:64px;">今日はどんな一日でしたか？目標や気づいたことなど、自由に書いてみましょう。</div>
        </div>
      </div>

      <div style="border-top:2px solid #223049;padding-top:22px;margin-top:16px;">
        <div style="background:#4C8DFF;border-radius:28px;padding:26px 0;text-align:center;"><span style="color:#fff;font-size:30px;font-weight:700;">振り返りを保存</span></div>
        <div style="text-align:center;margin-top:18px;"><span style="color:#A7B3C7;font-size:24px;">また後で</span></div>
      </div>
    </div>
    <div class="home-indicator"></div>
  </div>
  ${sparkleHTML}
</div>`;

// ========== Screenshot 3: Progress ==========
const ss3 = `
<div class="ss">
  <div class="glow-blue" style="top:400px;right:-250px;"></div>
  <div class="glow-purple" style="bottom:100px;left:-200px;"></div>
  <div class="headline-area">
    <div class="headline">継続の記録を<br>積み重ねよう</div>
    <div class="subheadline">連続記録・統計・自己ベストで<br>成長を実感しよう。</div>
  </div>
  <div class="phone-frame">
    <div class="dynamic-island"></div>
    ${statusBarHTML}
    <div class="screen-content">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding-top:20px;gap:28px;overflow:hidden;">
        <!-- Streak Ring -->
        <div style="position:relative;width:380px;height:380px;display:flex;align-items:center;justify-content:center;">
          <svg style="position:absolute;width:380px;height:380px;" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#223049" stroke-width="10"/>
            <circle cx="100" cy="100" r="85" fill="none" stroke="url(#sg)" stroke-width="10" stroke-dasharray="534" stroke-dashoffset="445" stroke-linecap="round" transform="rotate(-90 100 100)"/>
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4C8DFF"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs>
          </svg>
          <div style="text-align:center;z-index:1;">
            <div style="font-size:22px;font-weight:600;color:#A7B3C7;letter-spacing:3px;">チェックイン</div>
            <div style="font-size:100px;font-weight:800;color:#E6EDF7;line-height:1;">5日</div>
            <div style="font-size:20px;font-weight:700;color:#A7B3C7;letter-spacing:2px;margin-top:4px;">着実に成長中</div>
          </div>
        </div>

        <!-- Personal Best -->
        <div style="background:#1A3D2E;border:2px solid #47C28B;border-radius:24px;padding:24px 32px;display:flex;align-items:center;gap:20px;width:100%;">
          <div style="width:60px;height:60px;background:rgba(71,194,139,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#47C28B"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
          </div>
          <div><div style="font-size:22px;font-weight:700;color:#47C28B;letter-spacing:2px;">自己ベスト更新</div><div style="font-size:26px;color:#E6EDF7;margin-top:4px;">5日連続チェックイン</div></div>
        </div>

        <!-- Share -->
        <div style="border:2px solid #7AA7FF;border-radius:28px;padding:22px 60px;text-align:center;"><span style="color:#7AA7FF;font-size:28px;font-weight:600;">記録をシェア</span></div>

        <!-- Week comparison -->
        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:32px;width:100%;">
          <div style="display:flex;justify-content:space-between;">
            <div style="flex:1;text-align:center;"><div style="font-size:22px;color:#A7B3C7;margin-bottom:8px;">チェックイン日数</div><div style="font-size:44px;font-weight:700;color:#E6EDF7;">5</div><div style="font-size:20px;font-weight:600;color:#47C28B;margin-top:4px;">先週比 +2</div></div>
            <div style="width:2px;background:#223049;"></div>
            <div style="flex:1;text-align:center;"><div style="font-size:22px;color:#A7B3C7;margin-bottom:8px;">リセット成功</div><div style="font-size:44px;font-weight:700;color:#E6EDF7;">3</div><div style="font-size:20px;font-weight:600;color:#47C28B;margin-top:4px;">先週比 +1</div></div>
          </div>
        </div>

        <!-- Stats -->
        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:32px;width:100%;">
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">最長連続記録</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">5日</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">チェックイン日数</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">5 / 7</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">衝動リセット成功</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">3 / 4</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;"><span style="font-size:26px;color:#A7B3C7;">支出の衝動を回避</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">2</span></div>
        </div>
      </div>
    </div>
    ${tabBarHTML(1)}
  </div>
  ${sparkleHTML}
</div>`;

// Write individual HTML files
const screenshots = [
  { name: '1_home_breathing_ja', html: ss1 },
  { name: '2_daily_checkin_ja', html: ss2 },
  { name: '3_progress_ja', html: ss3 },
];

screenshots.forEach(({ name, html }) => {
  const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${sharedStyles}</style></head><body>${html}</body></html>`;
  fs.writeFileSync(path.join(dir, `${name}.html`), fullHTML);
});

console.log('Japanese HTML files written. Now capturing with Chrome...');
console.log('Output directory:', dir);
