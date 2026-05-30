// ПрофНавигатор TMA — Главная логика приложения
// Данные (вопросы, профессии, архетипы) — в data.js

// ── Telegram Web App SDK ──────────────────────────────────────────────────
const tg = window.Telegram?.WebApp;
const isTelegram = !!tg;

// ── Состояние приложения ──────────────────────────────────────────────────
const state = {
  currentScreen: null,
  screenHistory: [],
  quiz: {
    currentQ: 0,
    scores: { analytics: 0, creativity: 0, tech: 0, social: 0, nature: 0, organization: 0 }
  },
  result: {
    archetype: null,
    normalizedScores: null,
    topProfessions: [],
    selectedProfession: null,
    activePlanTab: 'study'
  }
};

// ── Инициализация ─────────────────────────────────────────────────────────
function init() {
  if (isTelegram) {
    tg.expand();
    tg.enableClosingConfirmation();
    applyTelegramTheme();
    tg.onEvent('themeChanged', applyTelegramTheme);
    tg.BackButton.onClick(handleBack);
    tg.MainButton.onClick(handleMainButtonClick);
  } else {
    // Резервная кнопка для браузерного превью
    const mainBtn = document.getElementById('main-btn');
    mainBtn.style.display = 'block';
    mainBtn.addEventListener('click', handleMainButtonClick);

    // Кнопка Назад для браузера
    document.getElementById('back-btn').addEventListener('click', handleBack);
  }

  showScreen('welcome', false);
}

// ── Тема Telegram ─────────────────────────────────────────────────────────
function applyTelegramTheme() {
  if (!isTelegram) return;
  const t = tg.themeParams;
  const r = document.documentElement;
  if (t.bg_color)           r.style.setProperty('--bg', t.bg_color);
  if (t.secondary_bg_color) r.style.setProperty('--secondary-bg', t.secondary_bg_color);
  if (t.text_color)         r.style.setProperty('--text', t.text_color);
  if (t.hint_color)         r.style.setProperty('--hint', t.hint_color);
  if (t.link_color)         r.style.setProperty('--link', t.link_color);
  if (t.button_color)       r.style.setProperty('--btn-color', t.button_color);
  if (t.button_text_color)  r.style.setProperty('--btn-text', t.button_text_color);
}

// ── Навигация ─────────────────────────────────────────────────────────────
function showScreen(name, addToHistory = true) {
  const next = document.getElementById('screen-' + name);
  if (!next) return;

  const current = document.querySelector('.screen.is-active');

  if (addToHistory && state.currentScreen && state.currentScreen !== name) {
    state.screenHistory.push(state.currentScreen);
  }

  if (current) {
    current.classList.add('is-behind');
    current.classList.remove('is-active');
    setTimeout(() => current.classList.remove('is-behind'), 300);
  }

  next.classList.remove('is-behind');
  next.classList.add('is-active');
  next.scrollTop = 0;
  state.currentScreen = name;

  updateBackButton();
  updateMainButton(name);
  onScreenEnter(name);
}

function goBack() {
  const prev = state.screenHistory.pop();
  if (!prev) return;

  const current = document.getElementById('screen-' + state.currentScreen);
  const target = document.getElementById('screen-' + prev);

  if (current) {
    current.classList.remove('is-active');
    // Анимация вправо: убираем is-active — экран уходит на translateX(100%)
    setTimeout(() => current.classList.remove('is-behind'), 300);
  }

  if (target) {
    // Убираем is-behind и ставим is-active — экран возвращается с -28% → 0%
    target.classList.remove('is-behind');
    target.classList.add('is-active');
    target.scrollTop = 0;
  }

  state.currentScreen = prev;
  updateBackButton();
  updateMainButton(prev);
  onScreenEnter(prev);
}

function handleBack() {
  haptic('light');
  goBack();
}

function onScreenEnter(name) {
  switch (name) {
    case 'professions': renderProfessions(); break;
    case 'plan':        renderPlan();        break;
    case 'share':       renderShare();       break;
  }
}

// ── Кнопка назад ──────────────────────────────────────────────────────────
function updateBackButton() {
  const hideBackOn = ['welcome', 'quiz', 'loading', 'share'];
  const showBack = state.screenHistory.length > 0 && !hideBackOn.includes(state.currentScreen);

  if (isTelegram) {
    showBack ? tg.BackButton.show() : tg.BackButton.hide();
  } else {
    const btn = document.getElementById('back-btn');
    btn.style.display = showBack ? 'flex' : 'none';
    document.body.classList.toggle('has-back', showBack);
  }
}

// ── MainButton ────────────────────────────────────────────────────────────
function setMainButton(text) {
  if (isTelegram) {
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.enable();
  } else {
    const btn = document.getElementById('main-btn');
    btn.textContent = text;
    btn.style.display = 'block';
  }
}

function hideMainButton() {
  if (isTelegram) {
    tg.MainButton.hide();
  } else {
    document.getElementById('main-btn').style.display = 'none';
  }
}

function updateMainButton(screen) {
  switch (screen) {
    case 'welcome':     setMainButton('Начать тест →');           break;
    case 'archetype':   setMainButton('Мои профессии →');         break;
    case 'profession':  setMainButton('Мой план действий →');     break;
    case 'plan':        setMainButton('Поделиться результатом →'); break;
    default:            hideMainButton();                          break;
  }
}

function handleMainButtonClick() {
  haptic('light');
  switch (state.currentScreen) {
    case 'welcome':    startQuiz();                   break;
    case 'archetype':  showScreen('professions');     break;
    case 'profession': showScreen('plan');            break;
    case 'plan':       showScreen('share');           break;
  }
}

// ── HapticFeedback ────────────────────────────────────────────────────────
function haptic(type = 'light') {
  if (isTelegram) tg.HapticFeedback.impactOccurred(type);
}

function hapticNotify(type = 'success') {
  if (isTelegram) tg.HapticFeedback.notificationOccurred(type);
}

// ── Квиз ─────────────────────────────────────────────────────────────────
function startQuiz() {
  state.quiz.currentQ = 0;
  state.quiz.scores = { analytics: 0, creativity: 0, tech: 0, social: 0, nature: 0, organization: 0 };
  state.screenHistory = [];
  showScreen('quiz', false);
  renderQuestion();
}

function renderQuestion() {
  const q = QUIZ_QUESTIONS[state.quiz.currentQ];
  const num = state.quiz.currentQ + 1;
  const progress = QUIZ_PROGRESS[state.quiz.currentQ];

  document.getElementById('quiz-progress-fill').style.width = progress + '%';
  document.getElementById('quiz-progress-label').textContent = `${num} / ${QUIZ_QUESTIONS.length}`;
  document.getElementById('quiz-question').textContent = q.text;
  document.getElementById('quiz-hint').textContent = q.hint;

  const container = document.getElementById('quiz-options');
  container.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.style.cssText = 'opacity:0;transform:translateY(14px)';
    btn.innerHTML = `<span class="option-emoji">${opt.emoji}</span><span class="option-text">${opt.text}</span>`;
    btn.addEventListener('click', () => selectAnswer(opt.dim, btn));
    container.appendChild(btn);

    // Плавное появление с задержкой
    setTimeout(() => {
      btn.style.transition = 'opacity 220ms, transform 220ms, border-color 150ms, background 150ms, transform 100ms';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 60 + i * 55);
  });
}

function selectAnswer(dim, btnEl) {
  // Блокируем повторный клик
  document.querySelectorAll('.quiz-option').forEach(b => {
    b.style.pointerEvents = 'none';
  });

  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  haptic('light');

  state.quiz.scores[dim] = (state.quiz.scores[dim] || 0) + 1;

  setTimeout(() => {
    state.quiz.currentQ++;
    if (state.quiz.currentQ >= QUIZ_QUESTIONS.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  }, 360);
}

function finishQuiz() {
  showScreen('loading', true);
  runLoadingSequence();
}

// ── Загрузочный экран ─────────────────────────────────────────────────────
function runLoadingSequence() {
  const steps = document.querySelectorAll('.loading-step');

  [400, 950, 1600].forEach((delay, i) => {
    setTimeout(() => steps[i]?.classList.add('visible'), delay);
  });

  setTimeout(() => {
    computeResult();
    showArchetypeScreen();
  }, 2600);
}

// ── Вычисление результата ─────────────────────────────────────────────────
function computeResult() {
  const raw = state.quiz.scores;
  const total = QUIZ_QUESTIONS.length;

  // Нормализуем в шкалу 0–10
  const normalized = {};
  Object.keys(DIMENSIONS).forEach(d => {
    normalized[d] = Math.round(((raw[d] || 0) / total) * 10);
  });

  state.result.normalizedScores = normalized;
  state.result.archetype = getArchetype(normalized);
  state.result.topProfessions = getTopProfessions(normalized, 3);

  // Сохраняем результат
  storageSet('pn_result', JSON.stringify({
    archetype: state.result.archetype,
    scores: normalized,
    topProfIds: state.result.topProfessions.map(p => p.id),
    ts: Date.now()
  }));
}

// ── Экран архетипа ────────────────────────────────────────────────────────
function showArchetypeScreen() {
  const key = state.result.archetype;
  const arch = ARCHETYPES[key];

  document.getElementById('arch-emoji').textContent = arch.emoji;
  document.getElementById('arch-name').textContent = arch.name;
  document.getElementById('arch-name').style.color = arch.color;
  document.getElementById('arch-tagline').textContent = arch.tagline;
  document.getElementById('arch-rarity').textContent = `Встречается у ${arch.rarity}% подростков`;

  // Описание с параграфами
  document.getElementById('arch-desc').innerHTML = arch.description
    .split('\n\n')
    .map(p => `<p>${p}</p>`)
    .join('');

  drawRadar(state.result.normalizedScores, arch.color);

  hapticNotify('success');

  // Сбрасываем историю: из архетипа можно только назад на welcome
  state.screenHistory = ['welcome'];
  showScreen('archetype', false);
}

// ── Радарный график SVG ───────────────────────────────────────────────────
function drawRadar(scores, fillColor) {
  const cx = 130, cy = 118, maxR = 78, labelR = 100;
  const dims = RADAR_ORDER; // clockwise from top

  function toXY(angleDeg, r) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: +(cx + r * Math.cos(rad)).toFixed(2),
      y: +(cy + r * Math.sin(rad)).toFixed(2)
    };
  }

  // Фоновая сетка (3 кольца)
  let grid = '';
  [0.33, 0.66, 1].forEach((ratio, ri) => {
    const pts = dims.map((_, i) => {
      const p = toXY(i * 60, maxR * ratio);
      return `${p.x},${p.y}`;
    }).join(' ');
    const op = ri === 2 ? 0.22 : 0.1;
    grid += `<polygon points="${pts}" fill="none" stroke="currentColor" stroke-width="1" opacity="${op}"/>`;
  });

  // Оси
  let axes = '';
  dims.forEach((_, i) => {
    const p = toXY(i * 60, maxR);
    axes += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="currentColor" stroke-width="1" opacity="0.14"/>`;
  });

  // Полигон данных
  const dataPoints = dims.map((d, i) => {
    const r = ((scores[d] || 0) / 10) * maxR;
    return toXY(i * 60, r);
  });
  const poly = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Точки
  const dots = dataPoints.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${fillColor}"/>`
  ).join('');

  // Метки
  let labels = '';
  dims.forEach((d, i) => {
    const dim = DIMENSIONS[d];
    const angle = i * 60;
    const lp = toXY(angle, labelR);

    let anchor = 'middle';
    if (angle > 30 && angle < 150)  anchor = 'start';
    if (angle > 210 && angle < 330) anchor = 'end';

    let dy = 0;
    if (angle === 0)   dy = -4;
    if (angle === 180) dy = 13;

    labels += `<text x="${lp.x}" y="${lp.y + dy}" text-anchor="${anchor}"
      fill="currentColor" font-size="11.5" opacity="0.72"
      font-family="-apple-system,BlinkMacSystemFont,sans-serif">${dim.icon} ${dim.name}</text>`;
  });

  document.getElementById('radar-svg').innerHTML = `
    <svg viewBox="0 0 260 236" width="260" height="236" style="overflow:visible">
      <g color="var(--hint)">${grid}${axes}</g>
      <polygon points="${poly}" fill="${fillColor}" fill-opacity="0.18"
        stroke="${fillColor}" stroke-width="2" stroke-linejoin="round"/>
      ${dots}
      <g>${labels}</g>
    </svg>`;
}

// ── Экран профессий ───────────────────────────────────────────────────────
function renderProfessions() {
  const container = document.getElementById('professions-list');
  container.innerHTML = '';

  state.result.topProfessions.forEach(prof => {
    const card = document.createElement('div');
    card.className = 'profession-card';
    card.innerHTML = `
      <div class="profession-icon">${prof.icon}</div>
      <div class="profession-info">
        <div class="profession-name">${prof.name}</div>
        <div class="profession-desc-short">${prof.description.split('.')[0]}</div>
      </div>
      <div class="match-badge">
        <div class="match-percent">${prof.matchPercent}%</div>
        <div class="match-label">совпадение</div>
      </div>
      <div class="card-arrow">›</div>`;
    card.addEventListener('click', () => openProfession(prof));
    container.appendChild(card);
  });
}

// ── Детальная карточка профессии ──────────────────────────────────────────
function openProfession(prof) {
  haptic('light');
  state.result.selectedProfession = prof;

  document.getElementById('detail-emoji').textContent = prof.icon;
  document.getElementById('detail-name').textContent = prof.name;
  document.getElementById('detail-match').textContent = `${prof.matchPercent}% совпадение`;
  document.getElementById('detail-desc').textContent = prof.description;
  document.getElementById('detail-skills').innerHTML =
    prof.skills.map(s => `<span class="skill-pill">${s}</span>`).join('');
  document.getElementById('detail-salary').textContent = prof.salary;
  document.getElementById('detail-exams').textContent = prof.exams.join(', ');
  document.getElementById('detail-universities').textContent = prof.universities.join(', ');

  showScreen('profession');
}

// ── Экран плана ───────────────────────────────────────────────────────────
function renderPlan() {
  const prof = state.result.selectedProfession;
  if (!prof) return;

  document.getElementById('plan-prof-name').textContent = `для профессии «${prof.name}»`;

  ['study', 'projects', 'content', 'nextStep'].forEach(tab => {
    const container = document.getElementById(`plan-tab-${tab}`);
    if (!container) return;
    container.innerHTML = '';
    (prof.plan[tab] || []).forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'plan-item';
      el.innerHTML = `<div class="plan-item-num">${i + 1}</div><div class="plan-item-text">${item}</div>`;
      container.appendChild(el);
    });
  });

  switchPlanTab(state.result.activePlanTab);
}

function switchPlanTab(tab) {
  state.result.activePlanTab = tab;
  document.querySelectorAll('.plan-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.plan-content').forEach(c =>
    c.classList.toggle('active', c.dataset.tab === tab)
  );
}

// ── Экран шаринга ─────────────────────────────────────────────────────────
function renderShare() {
  const arch = ARCHETYPES[state.result.archetype];
  const topProf = state.result.topProfessions[0];

  document.getElementById('share-hero-emoji').textContent = arch.emoji;
  document.getElementById('share-title').textContent = `Ты — ${arch.name}`;
  document.getElementById('share-card-emoji').textContent = arch.emoji;
  document.getElementById('share-card-archetype').textContent = arch.name;
  document.getElementById('share-card-prof').textContent =
    topProf ? `Топ профессия: ${topProf.name}` : '';
  document.getElementById('share-card-match').textContent =
    topProf ? `Совпадение ${topProf.matchPercent}%` : '';
}

function shareResult() {
  haptic('medium');
  const arch = ARCHETYPES[state.result.archetype];
  const topProf = state.result.topProfessions[0];

  const text = [
    `🧭 ПрофНавигатор`,
    ``,
    `Мой архетип: ${arch.emoji} ${arch.name}`,
    `«${arch.tagline}»`,
    ``,
    topProf ? `Топ профессия: ${topProf.name} (совпадение ${topProf.matchPercent}%)` : '',
    ``,
    `Пройди тест бесплатно!`
  ].filter(l => l !== undefined).join('\n');

  if (navigator.share) {
    navigator.share({ title: 'ПрофНавигатор', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Текст скопирован!'));
  } else {
    showToast('Скопируй текст и отправь в Telegram');
  }
}

function restartQuiz() {
  haptic('light');
  state.screenHistory = [];
  state.result = {
    archetype: null, normalizedScores: null,
    topProfessions: [], selectedProfession: null, activePlanTab: 'study'
  };
  document.querySelectorAll('.loading-step').forEach(s => s.classList.remove('visible'));
  startQuiz();
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  // Небольшая пауза чтобы transition сработал
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

// ── Хранилище (CloudStorage + localStorage fallback) ──────────────────────
function storageSet(key, value) {
  if (isTelegram && tg.CloudStorage) {
    tg.CloudStorage.setItem(key, value);
  } else {
    try { localStorage.setItem(key, value); } catch {}
  }
}

function storageGet(key) {
  if (isTelegram && tg.CloudStorage) {
    return new Promise(resolve =>
      tg.CloudStorage.getItem(key, (err, val) => resolve(val || null))
    );
  }
  try { return Promise.resolve(localStorage.getItem(key)); } catch {}
  return Promise.resolve(null);
}

// ── Старт приложения ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();

  // Вкладки плана
  document.querySelectorAll('.plan-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic('light');
      switchPlanTab(btn.dataset.tab);
    });
  });

  // Кнопки шаринга
  document.getElementById('btn-share').addEventListener('click', shareResult);
  document.getElementById('btn-restart').addEventListener('click', restartQuiz);
});
