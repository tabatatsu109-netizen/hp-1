// ホームページ共通ロジック — JSONBin 読み込み & レンダリング

const FIREBASE_URL = `${HP_CONFIG.firebaseUrl}/clubs/${HP_CONFIG.clubId}.json`;
let HP_DATA = { players: [], matches: [], schedules: [], posts: [], opponents: [] };

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  applyClubName();
  showSkeleton();
  try {
    await loadData();
    renderPage();
  } catch (e) {
    console.warn('データ取得失敗:', e);
    renderPage(); // 空データでもレイアウトは表示
  }
});

// ===== テーマカラー適用 =====
function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty('--c-primary', HP_CONFIG.primaryColor || '#1a5c2a');
  r.setProperty('--c-accent',  HP_CONFIG.accentColor  || '#c9a227');
}

function applyClubName() {
  document.querySelectorAll('[data-club-name]').forEach(el => {
    el.textContent = HP_CONFIG.clubName;
  });
  document.querySelectorAll('[data-club-full]').forEach(el => {
    el.textContent = HP_CONFIG.clubNameFull;
  });
  // タイトルタグをクラブ名で上書き（テンプレートのハードコードを無効化）
  if (HP_CONFIG.clubName) {
    document.title = document.title.replace(/^.*?(?= — | 公式)/, HP_CONFIG.clubNameFull || HP_CONFIG.clubName);
  }
}

// ===== Firebase 読み込み =====
async function loadData() {
  const res = await fetch(FIREBASE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const r = await res.json() || {};
  HP_DATA.players   = r.players   || [];
  HP_DATA.matches   = r.matches   || [];
  HP_DATA.schedules = r.schedules || [];
  HP_DATA.posts     = r.posts     || [];
  HP_DATA.opponents = r.opponents || [];
}

// ===== ページ判定してレンダリング振り分け =====
function renderPage() {
  hideSkeleton();
  const page = document.body.dataset.page || 'top';
  if (page === 'top')     renderTop();
  if (page === 'news')    renderNewsPage();
  if (page === 'matches') renderMatchesPage();
  if (page === 'players') renderPlayersPage();
}

// ===== ユーティリティ =====
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  const days = ['日','月','火','水','木','金','土'];
  return `${d.getMonth()+1}/${d.getDate()}（${days[d.getDay()]}）`;
}
function fmtDateLong(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  const days = ['日','月','火','水','木','金','土'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`;
}
function daysUntil(s) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(s + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}
function resultBadge(m) {
  const r = m.result;
  if (r?.myScore === undefined) return '';
  const my = Number(r.myScore), opp = Number(r.oppScore);
  if (my > opp)  return '<span class="result-badge win">W</span>';
  if (my < opp)  return '<span class="result-badge lose">L</span>';
  return '<span class="result-badge draw">D</span>';
}
function findOpponent(name) {
  return HP_DATA.opponents.find(o => o.name === name || o.shortName === name);
}
function emblemHtml(name, size = 40) {
  const opp = findOpponent(name);
  if (opp?.emblem) {
    return `<img src="${opp.emblem}" width="${size}" height="${size}" style="border-radius:50%;object-fit:cover" alt="${name}" onerror="this.replaceWith(initials('${(name||'?')[0]}', ${size}))">`;
  }
  return initialsHtml((name || '?')[0], size);
}
function initialsHtml(letter, size) {
  return `<span class="emblem-initial" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.4)}px">${letter}</span>`;
}

// ===== スケルトン =====
function showSkeleton() {
  document.querySelectorAll('.skeleton-wrap').forEach(el => el.classList.remove('loaded'));
}
function hideSkeleton() {
  document.querySelectorAll('.skeleton-wrap').forEach(el => el.classList.add('loaded'));
}

// ============================================================
// ===== TOP ページ レンダリング =====
// ============================================================
function renderTop() {
  renderHero();
  renderNextMatch();
  renderNewsSection();
  renderMatchSection();
  renderPlayersPreview();
  renderJoinCta();
}

// ---- HERO ----
function renderHero() {
  const el = document.getElementById('hero-title');
  if (el) el.innerHTML = HP_CONFIG.heroTitle || HP_CONFIG.clubName;
  const sub = document.getElementById('hero-sub');
  if (sub) sub.textContent = HP_CONFIG.heroSub || HP_CONFIG.clubNameFull;
  const logoEl = document.getElementById('hero-logo');
  if (logoEl) {
    logoEl.innerHTML = HP_CONFIG.logoUrl
      ? `<img src="${HP_CONFIG.logoUrl}" alt="${HP_CONFIG.clubName}">`
      : `<span class="hero-logo-initial">${HP_CONFIG.clubName[0]}</span>`;
  }
}

// ---- NEXT MATCH ----
function renderNextMatch() {
  const el = document.getElementById('next-match');
  if (!el) return;
  const today = todayStr();
  const next = HP_DATA.schedules
    .filter(s => (s.type === '試合' || s.type === '大会') && s.date >= today)
    .sort((a, b) => a.date < b.date ? -1 : 1)[0];

  if (!next) {
    el.innerHTML = '<p class="no-data">試合予定はありません</p>';
    return;
  }
  const d = daysUntil(next.date);
  const dLabel = d === 0 ? '本日開催！' : d === 1 ? '明日開催' : `あと ${d} 日`;
  el.innerHTML = `
    <div class="next-match-card">
      <div class="next-match-countdown">${dLabel}</div>
      <div class="next-match-body">
        <div class="next-match-date">${fmtDateLong(next.date)}${next.time ? ' ' + next.time + ' KO' : ''}</div>
        <div class="next-match-vs">
          <div class="next-match-team home">
            <div class="next-match-emblem">${HP_CONFIG.logoUrl ? `<img src="${HP_CONFIG.logoUrl}" alt="">` : `<span class="emblem-initial" style="width:48px;height:48px;font-size:20px">${HP_CONFIG.clubName[0]}</span>`}</div>
            <div class="next-match-name">${HP_CONFIG.clubName}</div>
          </div>
          <div class="next-match-sep">VS</div>
          <div class="next-match-team away">
            <div class="next-match-emblem">${emblemHtml(next.opponent, 48)}</div>
            <div class="next-match-name">${next.opponent || '---'}</div>
          </div>
        </div>
        <div class="next-match-meta">
          ${next.venue ? `<span>📍 ${next.venue}</span>` : ''}
          ${next.competition ? `<span>🏆 ${next.competition}</span>` : ''}
          ${next.category ? `<span class="cat-tag">${next.category}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ---- NEWS ----
function renderNewsSection() {
  const el = document.getElementById('news-list');
  if (!el) return;
  const items = HP_DATA.posts
    .filter(p => p.published !== false)
    .sort((a, b) => a.date < b.date ? 1 : -1)
    .slice(0, 5);

  if (items.length === 0) {
    el.innerHTML = '<p class="no-data">ニュースはありません</p>';
    return;
  }
  el.innerHTML = items.map(p => `
    <div class="news-item">
      <span class="news-date">${p.date ? p.date.replace(/-/g, '/') : ''}</span>
      <span class="news-cat cat-${sanitizeCat(p.category)}">${p.category || 'お知らせ'}</span>
      <span class="news-title">${p.title || ''}</span>
      <span class="news-arrow">›</span>
    </div>
  `).join('');
}
function sanitizeCat(c) {
  return (c || '').replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥]/g, '').slice(0, 12);
}

// ---- MATCH RESULTS ----
function renderMatchSection() {
  const el = document.getElementById('match-result-list');
  if (!el) return;

  const cats = HP_CONFIG.categories.length > 0
    ? HP_CONFIG.categories
    : [...new Set(HP_DATA.matches.map(m => m.category).filter(Boolean))].slice(0, 3);

  // タブ生成
  const tabWrap = document.getElementById('match-tabs');
  if (tabWrap && cats.length > 1) {
    tabWrap.innerHTML = cats.map((c, i) =>
      `<button class="match-tab ${i===0?'active':''}" data-cat="${c}" onclick="switchMatchTab('${c}', this)">${c}</button>`
    ).join('');
  }

  renderMatchList(cats[0] || null, el);
}

function switchMatchTab(cat, btn) {
  document.querySelectorAll('.match-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('match-result-list');
  if (el) renderMatchList(cat, el);
}

function renderMatchList(cat, el) {
  let items = HP_DATA.matches
    .filter(m => m.result?.myScore !== undefined && m.result?.publish !== false)
    .sort((a, b) => a.date < b.date ? 1 : -1);
  if (cat) items = items.filter(m => m.category === cat);
  items = items.slice(0, 5);

  if (items.length === 0) {
    el.innerHTML = `<p class="no-data">試合結果はありません</p>`;
    return;
  }

  const subNote = cat ? `<div class="match-subnote">最近の結果 / ${cat}</div>` : '';
  el.innerHTML = subNote + items.map(m => {
    const r = m.result;
    return `
      <div class="match-row">
        <span class="match-row-date">${fmtDate(m.date)}</span>
        <span class="match-row-home">${HP_CONFIG.clubName}</span>
        <span class="match-row-score">
          <span class="score-box">${r.myScore ?? '-'}</span>
          <span class="score-sep">-</span>
          <span class="score-box">${r.oppScore ?? '-'}</span>
        </span>
        <span class="match-row-away">${m.opponent || '---'}</span>
        ${resultBadge(m)}
      </div>
    `;
  }).join('');
}

// ---- PLAYERS PREVIEW ----
function renderPlayersPreview() {
  const el = document.getElementById('players-preview');
  if (!el) return;
  const players = HP_DATA.players
    .filter(p => p.photo && !['代表','コーチ','スタッフ'].includes(p.mainGroup))
    .slice(0, 8);

  if (players.length === 0) {
    el.innerHTML = '<p class="no-data" style="color:#aaa">選手情報はありません</p>';
    return;
  }
  el.innerHTML = players.map(p => playerCard(p)).join('');
}

function playerCard(p) {
  const posColor = {'GK':'#f5a623','DF':'#4a90d9','MF':'#7ed321','FW':'#e74c3c'}[p.mainGroup] || '#888';
  return `
    <div class="player-card">
      ${p.number ? `<div class="player-num">${p.number}</div>` : ''}
      <div class="player-photo">
        ${p.photo
          ? `<img src="${p.photo}" alt="${p.name}" loading="lazy">`
          : `<div class="player-photo-placeholder">${(p.name||'?')[0]}</div>`}
        ${p.mainGroup ? `<span class="player-pos" style="background:${posColor}">${p.mainGroup}</span>` : ''}
      </div>
      <div class="player-info">
        <div class="player-name">${p.name || ''}</div>
        ${p.nameRoman ? `<div class="player-roman">${p.nameRoman}</div>` : ''}
      </div>
    </div>
  `;
}

// ---- JOIN CTA ----
function renderJoinCta() {
  const btns = document.querySelectorAll('.btn-join');
  btns.forEach(btn => {
    btn.textContent = HP_CONFIG.joinLabel || '体験申込はこちら';
    if (HP_CONFIG.joinUrl) btn.href = HP_CONFIG.joinUrl;
  });
}

// ============================================================
// ===== 選手紹介ページ =====
// ============================================================
function renderPlayersPage() {
  renderCategoryTabs();
  renderAllPlayers('全員');
}

function renderCategoryTabs() {
  const wrap = document.getElementById('player-cat-tabs');
  if (!wrap) return;
  const cats = ['全員', ...HP_CONFIG.categories, 'スタッフ'];
  wrap.innerHTML = cats.map((c, i) =>
    `<button class="player-tab ${i===0?'active':''}" onclick="switchPlayerTab('${c}', this)">${c}</button>`
  ).join('');
}

function switchPlayerTab(cat, btn) {
  document.querySelectorAll('.player-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllPlayers(cat);
}

function renderAllPlayers(cat) {
  const el = document.getElementById('players-grid');
  if (!el) return;

  let list = [...HP_DATA.players];

  if (cat === 'スタッフ') {
    list = list.filter(p => ['代表','コーチ','スタッフ'].includes(p.mainGroup));
  } else if (cat !== '全員') {
    const catU = catToU(cat);
    list = list.filter(p => {
      if (['代表','コーチ','スタッフ'].includes(p.mainGroup)) return false;
      if (!catU) return true;
      return gradeInCat(p.grade, catU);
    });
  }

  list.sort((a, b) => Number(a.number||999) - Number(b.number||999));

  if (list.length === 0) {
    el.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px">選手情報はありません</p>';
    return;
  }
  el.innerHTML = list.map(p => playerCard(p)).join('');
}

function catToU(cat) {
  const m = cat.match(/U(\d+)/i);
  return m ? parseInt(m[1]) : null;
}
function gradeInCat(grade, u) {
  const gradeToAge = {
    '小1':7,'小2':8,'小3':9,'小4':10,'小5':11,'小6':12,
    '中1':13,'中2':14,'中3':15,'高1':16,'高2':17,'高3':18
  };
  const age = gradeToAge[grade];
  if (!age) return false;
  return age <= u && age > u - 2;
}

// ============================================================
// ===== ニュースページ =====
// ============================================================
function renderNewsPage() {
  const el = document.getElementById('news-full-list');
  if (!el) return;
  const items = HP_DATA.posts
    .filter(p => p.published !== false)
    .sort((a, b) => a.date < b.date ? 1 : -1);

  if (items.length === 0) {
    el.innerHTML = '<p class="no-data">ニュースはありません</p>';
    return;
  }
  el.innerHTML = items.map(p => `
    <div class="news-item news-item-lg">
      <span class="news-date">${p.date ? p.date.replace(/-/g, '/') : ''}</span>
      <span class="news-cat cat-${sanitizeCat(p.category)}">${p.category || 'お知らせ'}</span>
      <div class="news-title">${p.title || ''}</div>
      ${p.body ? `<div class="news-body-preview">${p.body.slice(0, 80)}${p.body.length > 80 ? '…' : ''}</div>` : ''}
    </div>
  `).join('');
}

// ============================================================
// ===== 試合結果・予定ページ =====
// ============================================================
function renderMatchesPage() {
  renderScheduleSection();
  renderResultsSection();
}

function renderScheduleSection() {
  const el = document.getElementById('schedule-list');
  if (!el) return;
  const today = todayStr();
  const items = HP_DATA.schedules
    .filter(s => s.date >= today)
    .sort((a, b) => a.date < b.date ? -1 : 1)
    .slice(0, 10);

  if (items.length === 0) {
    el.innerHTML = '<p class="no-data">試合予定はありません</p>';
    return;
  }
  el.innerHTML = items.map(s => `
    <div class="schedule-row">
      <span class="schedule-date">${fmtDate(s.date)}${s.time ? ' ' + s.time : ''}</span>
      <span class="schedule-type type-${s.type||''}">${s.type||''}</span>
      <span class="schedule-title">${s.opponent ? 'vs ' + s.opponent : s.title || ''}</span>
      ${s.venue ? `<span class="schedule-venue">📍 ${s.venue}</span>` : ''}
      ${s.category ? `<span class="cat-tag">${s.category}</span>` : ''}
    </div>
  `).join('');
}

function renderResultsSection() {
  const el = document.getElementById('results-list');
  if (!el) return;
  const items = HP_DATA.matches
    .filter(m => m.result?.myScore !== undefined && m.result?.publish !== false)
    .sort((a, b) => a.date < b.date ? 1 : -1)
    .slice(0, 20);

  if (items.length === 0) {
    el.innerHTML = '<p class="no-data">試合結果はありません</p>';
    return;
  }
  el.innerHTML = items.map(m => {
    const r = m.result;
    return `
      <div class="match-row">
        <span class="match-row-date">${fmtDate(m.date)}</span>
        <span class="match-row-home">${HP_CONFIG.clubName}</span>
        <span class="match-row-score">
          <span class="score-box">${r.myScore ?? '-'}</span>
          <span class="score-sep">-</span>
          <span class="score-box">${r.oppScore ?? '-'}</span>
        </span>
        <span class="match-row-away">${m.opponent || '---'}</span>
        ${resultBadge(m)}
        ${m.category ? `<span class="cat-tag">${m.category}</span>` : ''}
      </div>
    `;
  }).join('');
}
