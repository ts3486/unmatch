// Generate 4 individual App Store screenshot HTML files and capture them with headless Chrome.
// Usage: node generate.js (then run the Chrome commands printed)

const fs = require('fs');
const path = require('path');

const WIDTH = 1242;
const HEIGHT = 2688;

const dir = path.join(__dirname);
const logoSmallB64 = fs.readFileSync(path.join(dir, 'logo_small.b64'), 'utf8').trim();
const logoLargeB64 = fs.readFileSync(path.join(dir, 'logo_large.b64'), 'utf8').trim();

const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT + 100}px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
    font-size: 76px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.12;
    letter-spacing: -1px;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 40px;
  }
  .subheadline {
    font-size: 44px;
    font-weight: 400;
    color: #A7B3C7;
    line-height: 1.4;
    margin-top: 28px;
    max-width: 850px;
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
    { label: 'Home', icon: '<path d="M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4m0-12C9.79 6 8 7.79 8 10s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4"/>' },
    { label: 'Progress', icon: '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>' },
    { label: 'Learn', icon: '<path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>' },
    { label: 'Settings', icon: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' },
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
    <div class="headline">Take a Breath<br>When the Urge Hits</div>
    <div class="subheadline">A guided 60-second reset to<br>center yourself and let it pass.</div>
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
          <span style="color:#47C28B;font-size:24px;font-weight:600;">Today done</span>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">
        <div style="font-size:40px;font-weight:600;color:#7AA7FF;text-align:center;line-height:1.4;padding:0 20px;min-height:120px;display:flex;align-items:center;">You don't need their validation.</div>
        <div style="width:380px;height:380px;border-radius:50%;border:4px solid #47C28B;display:flex;align-items:center;justify-content:center;">
          <div style="width:340px;height:340px;border-radius:50%;background:radial-gradient(circle at 40% 40%, rgba(71,194,139,0.35), rgba(71,194,139,0.12) 70%, transparent);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:72px;font-weight:700;color:#fff;">5</span>
          </div>
        </div>
        <div style="font-size:42px;font-weight:700;color:#47C28B;letter-spacing:2px;">Exhale</div>
        <div style="text-align:center;margin-top:8px;">
          <div style="font-size:22px;font-weight:600;color:#A7B3C7;text-transform:uppercase;letter-spacing:3px;">Session</div>
          <div style="font-size:52px;font-weight:600;color:#E6EDF7;margin-top:4px;">0:41</div>
        </div>
        <div style="display:flex;align-items:center;gap:24px;margin-top:20px;">
          <div style="text-align:center;"><div style="font-size:24px;font-weight:500;color:#A7B3C7;">Inhale</div><div style="font-size:20px;color:#223049;margin-top:2px;">4s</div></div>
          <div style="width:40px;height:2px;background:#223049;"></div>
          <div style="text-align:center;"><div style="font-size:24px;font-weight:500;color:#A7B3C7;">Hold</div><div style="font-size:20px;color:#223049;margin-top:2px;">2s</div></div>
          <div style="width:40px;height:2px;background:#223049;"></div>
          <div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:#E6EDF7;">Exhale</div><div style="font-size:20px;color:#A7B3C7;margin-top:2px;">6s</div></div>
        </div>
      </div>
      <div style="border-top:2px solid #223049;padding:24px 0 8px;">
        <div style="background:#4C8DFF;border-radius:28px;padding:28px 0;text-align:center;"><span style="color:#fff;font-size:30px;font-weight:600;">Daily check-in</span></div>
      </div>
    </div>
    ${tabBarHTML(0)}
  </div>
  ${sparkleHTML}
</div>`;

// ========== Screenshot 2: Check-in ==========
const ss2 = `
<div class="ss">
  <div class="glow-blue" style="top:500px;left:-200px;"></div>
  <div class="glow-purple" style="bottom:300px;right:-200px;"></div>
  <div class="headline-area">
    <div class="headline">Check In With<br>Yourself Daily</div>
    <div class="subheadline">Track your mood, urges,<br>and wins — all private and offline.</div>
  </div>
  <div class="phone-frame">
    <div class="dynamic-island"></div>
    ${statusBarHTML}
    <div class="screen-content">
      <div style="padding-top:20px;flex:1;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#4C8DFF"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </div>
        <div style="font-size:48px;font-weight:700;color:#E6EDF7;margin-bottom:8px;">Daily check-in</div>
        <div style="font-size:28px;color:#A7B3C7;margin-bottom:36px;">How are you feeling today?</div>

        <div style="margin-bottom:36px;">
          <div style="font-size:28px;font-weight:600;color:#E6EDF7;margin-bottom:16px;">Mood</div>
          <div style="display:flex;gap:14px;">
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Low</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Meh</span></div>
            <div style="flex:1;border:2px solid #4C8DFF;border-radius:20px;padding:16px 8px;text-align:center;background:rgba(76,141,255,0.15);"><span style="font-size:22px;color:#4C8DFF;font-weight:600;">Okay</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Good</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Great</span></div>
          </div>
        </div>

        <div style="margin-bottom:36px;">
          <div style="font-size:28px;font-weight:600;color:#E6EDF7;margin-bottom:16px;">Fatigue level</div>
          <div style="display:flex;gap:14px;">
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Fine</span></div>
            <div style="flex:1;border:2px solid #4C8DFF;border-radius:20px;padding:16px 8px;text-align:center;background:rgba(76,141,255,0.15);"><span style="font-size:22px;color:#4C8DFF;font-weight:600;">Mild</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Tired</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:20px;color:#A7B3C7;">Drained</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:20px;color:#A7B3C7;">Wrecked</span></div>
          </div>
        </div>

        <div style="margin-bottom:36px;">
          <div style="font-size:28px;font-weight:600;color:#E6EDF7;margin-bottom:16px;">Urge level</div>
          <div style="display:flex;gap:14px;">
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Calm</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Low</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:20px;color:#A7B3C7;">Medium</span></div>
            <div style="flex:1;border:2px solid #4C8DFF;border-radius:20px;padding:16px 8px;text-align:center;background:rgba(76,141,255,0.15);"><span style="font-size:22px;color:#4C8DFF;font-weight:600;">Strong</span></div>
            <div style="flex:1;border:2px solid #223049;border-radius:20px;padding:16px 8px;text-align:center;background:#121C2E;"><span style="font-size:22px;color:#A7B3C7;">Max</span></div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:28px 0;border-bottom:2px solid #223049;">
          <div style="font-size:28px;color:#E6EDF7;max-width:480px;">Opened a dating app late at night?</div>
          <div style="width:80px;height:44px;border-radius:22px;background:#223049;position:relative;"><div style="width:36px;height:36px;border-radius:50%;background:#fff;position:absolute;top:4px;left:4px;"></div></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:28px 0;border-bottom:2px solid #223049;">
          <div style="font-size:28px;color:#E6EDF7;max-width:480px;">Spent money on dating apps today?</div>
          <div style="width:80px;height:44px;border-radius:22px;background:#223049;position:relative;"><div style="width:36px;height:36px;border-radius:50%;background:#fff;position:absolute;top:4px;left:4px;"></div></div>
        </div>

        <div style="margin-top:36px;">
          <div style="font-size:28px;font-weight:600;color:#E6EDF7;margin-bottom:12px;">Personal note (optional)</div>
          <div style="background:#121C2E;border:2px solid #223049;border-radius:20px;padding:24px;color:#A7B3C7;font-size:26px;min-height:100px;">Feeling better about not checking...</div>
        </div>

        <div style="background:#4C8DFF;border-radius:28px;padding:28px 0;text-align:center;width:100%;margin-top:32px;"><span style="color:#fff;font-size:30px;font-weight:600;">Save check-in</span></div>
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
    <div class="headline">Keep Track of<br>Your Streak</div>
    <div class="subheadline">See your progress grow with<br>streaks, stats, and personal bests.</div>
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
            <div style="font-size:22px;font-weight:600;color:#A7B3C7;text-transform:uppercase;letter-spacing:3px;">Check-ins</div>
            <div style="font-size:100px;font-weight:800;color:#E6EDF7;line-height:1;">5d</div>
            <div style="font-size:22px;font-weight:700;color:#A7B3C7;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">Gaining Strength</div>
          </div>
        </div>

        <!-- Personal Best -->
        <div style="background:#1A3D2E;border:2px solid #47C28B;border-radius:24px;padding:24px 32px;display:flex;align-items:center;gap:20px;width:100%;">
          <div style="width:60px;height:60px;background:rgba(71,194,139,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#47C28B"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
          </div>
          <div><div style="font-size:22px;font-weight:700;color:#47C28B;text-transform:uppercase;letter-spacing:2px;">New Personal Best</div><div style="font-size:26px;color:#E6EDF7;margin-top:4px;">5 day check-in streak</div></div>
        </div>

        <!-- Share -->
        <div style="border:2px solid #7AA7FF;border-radius:28px;padding:22px 60px;text-align:center;"><span style="color:#7AA7FF;font-size:28px;font-weight:600;">Share your streak</span></div>

        <!-- Week comparison -->
        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:32px;width:100%;">
          <div style="display:flex;justify-content:space-between;">
            <div style="flex:1;text-align:center;"><div style="font-size:22px;color:#A7B3C7;margin-bottom:8px;">Check-in days</div><div style="font-size:44px;font-weight:700;color:#E6EDF7;">5</div><div style="font-size:22px;font-weight:600;color:#47C28B;margin-top:4px;">+2 vs last week</div></div>
            <div style="width:2px;background:#223049;"></div>
            <div style="flex:1;text-align:center;"><div style="font-size:22px;color:#A7B3C7;margin-bottom:8px;">Resets succeeded</div><div style="font-size:44px;font-weight:700;color:#E6EDF7;">3</div><div style="font-size:22px;font-weight:600;color:#47C28B;margin-top:4px;">+1 vs last week</div></div>
          </div>
        </div>

        <!-- Stats -->
        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:32px;width:100%;">
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">Best check-in streak</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">5 days</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">Check-in days</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">5 / 7</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;border-bottom:2px solid #223049;"><span style="font-size:26px;color:#A7B3C7;">Urge resets succeeded</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">3 / 4</span></div>
          <div style="display:flex;justify-content:space-between;padding:20px 0;"><span style="font-size:26px;color:#A7B3C7;">Spend urges avoided</span><span style="font-size:26px;font-weight:700;color:#E6EDF7;">2</span></div>
        </div>
      </div>
    </div>
    ${tabBarHTML(1)}
  </div>
  ${sparkleHTML}
</div>`;

// ========== Screenshot 4: Paywall ==========
const ss4 = `
<div class="ss">
  <div class="glow-blue" style="top:600px;left:-200px;"></div>
  <div class="glow-purple" style="bottom:400px;right:-200px;"></div>
  <div class="headline-area">
    <div class="headline">Less Than a<br>Single Boost</div>
    <div class="subheadline">Everything you need to break<br>the dating app cycle.</div>
  </div>
  <div class="phone-frame">
    <div class="dynamic-island"></div>
    ${statusBarHTML}
    <div class="screen-content">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding-top:40px;gap:32px;">
        <div style="text-align:center;">
          <img src="data:image/png;base64,${logoLargeB64}" width="100" height="100" style="margin-bottom:16px;object-fit:contain;" />
          <div style="font-size:48px;font-weight:700;color:#E6EDF7;">Stop mindless swiping</div>
          <div style="font-size:28px;color:#A7B3C7;max-width:580px;line-height:1.5;margin-top:8px;">Everything you need to be intentional about dating apps</div>
        </div>
        <div style="background:rgba(242,193,78,0.15);border:2px solid #F2C14E;border-radius:40px;padding:12px 32px;"><span style="color:#F2C14E;font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Cheaper than one Tinder boost</span></div>
        <div style="background:#121C2E;border:2px solid #223049;border-radius:24px;padding:36px;width:100%;text-align:center;">
          <div style="font-size:52px;font-weight:800;color:#E6EDF7;">$4.99/month</div>
          <div style="font-size:24px;color:#A7B3C7;margin-top:8px;line-height:1.5;">A single boost costs $5.99...<br>Unmatch costs less — and works all month</div>
        </div>
        <div style="width:100%;display:flex;flex-direction:column;gap:24px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:64px;height:64px;background:#0F1D3A;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#4C8DFF"><circle cx="12" cy="12" r="3"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
            </div>
            <span style="font-size:28px;color:#E6EDF7;line-height:1.4;">60-second panic meditation — anytime, offline</span>
          </div>
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:64px;height:64px;background:#0F1D3A;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#4C8DFF"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>
            </div>
            <span style="font-size:28px;color:#E6EDF7;line-height:1.4;">Spend delay cards — think before you boost</span>
          </div>
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:64px;height:64px;background:#0F1D3A;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#4C8DFF"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
            </div>
            <span style="font-size:28px;color:#E6EDF7;line-height:1.4;">Progress tracking — streaks, rank & insights</span>
          </div>
        </div>
        <div style="background:#4C8DFF;border-radius:28px;padding:28px 0;text-align:center;width:100%;margin-top:8px;"><span style="color:#fff;font-size:30px;font-weight:700;">Try 7 Days for Free</span></div>
        <span style="color:#A7B3C7;font-size:24px;text-decoration:underline;">Restore purchase</span>
        <div style="display:flex;align-items:center;gap:12px;margin-top:4px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#A7B3C7"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>
          <span style="font-size:22px;color:#A7B3C7;">Private & on-device · No account required</span>
        </div>
      </div>
    </div>
    <div class="home-indicator"></div>
  </div>
  ${sparkleHTML}
</div>`;

// Write individual HTML files
const screenshots = [
  { name: '1_home_breathing', html: ss1 },
  { name: '2_daily_checkin', html: ss2 },
  { name: '3_progress', html: ss3 },
  { name: '4_paywall', html: ss4 },
];

screenshots.forEach(({ name, html }) => {
  const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${sharedStyles}</style></head><body>${html}</body></html>`;
  fs.writeFileSync(path.join(dir, `${name}.html`), fullHTML);
});

console.log('HTML files written. Now capturing with Chrome...');
console.log('Output directory:', dir);
