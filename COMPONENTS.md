# Каталог UI-компонентов — ПрофНавигатор

Справочник готовых блоков. Копируй отсюда в HTML — дизайн останется единым на всех страницах.

---

## Цвета (CSS-переменные)

```css
/* Фоны */
--bg-main: #070e1b;
--bg-card: #0d1726;
--bg-card-hover: #111f35;

/* Акценты */
--accent-orange: #f97316;
--accent-amber: #fbbf24;
--accent-blue: #0ea5e9;
--accent-green: #10b981;

/* Текст */
--text-main: #f1f5f9;
--text-muted: #94a3b8;

/* Граница */
--border: rgba(255,255,255,0.07);
```

---

## Кнопки

### CTA (основная, с пульсацией)
```html
<a href="https://t.me/bronzelit" class="btn-cta">Получить разбор бесплатно</a>
```
```css
.btn-cta {
  display: inline-block;
  background: linear-gradient(135deg, #f97316, #fbbf24);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
}
```

### Призрак (вторичная)
```html
<a href="#" class="btn-ghost">Узнать подробнее</a>
```
```css
.btn-ghost {
  display: inline-block;
  border: 1px solid rgba(255,255,255,0.2);
  color: #f1f5f9;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  transition: border-color 0.2s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.5); }
```

---

## Карточки

### Стеклянная карточка (glass morphism)
```html
<div class="card">
  <h3>Заголовок карточки</h3>
  <p>Текст карточки.</p>
</div>
```
```css
.card {
  background: rgba(13,23,38,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: transform 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.15);
}
```

### Карточка боли (с иконкой)
```html
<div class="card card-pain">
  <div class="card-icon"><!-- inline SVG --></div>
  <h3>Боль пользователя</h3>
  <p>Описание боли одним-двумя предложениями.</p>
</div>
```

### Карточка шага (нумерованная)
```html
<div class="card card-step">
  <div class="step-number">1</div>
  <h3>Проходишь квиз</h3>
  <p>10 вопросов о себе: интересы, сильные стороны, как тебе комфортнее работать.</p>
</div>
```
```css
.step-number {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #f97316, #fbbf24);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.1rem; color: #fff;
  margin-bottom: 1rem;
}
```

---

## Бейджи и теги

### Бейдж-тег (оранжевый)
```html
<span class="badge">Бесплатно · Результат за 7 минут</span>
```
```css
.badge {
  display: inline-block;
  background: rgba(249,115,22,0.15);
  border: 1px solid rgba(249,115,22,0.3);
  color: #f97316;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  letter-spacing: 0.03em;
}
```

---

## Анимации

### Появление при скролле
```css
.fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: none;
}
```
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
```

### Фоновые орбы (декоративные свечения)
```html
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
```
```css
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.3;
  z-index: 0;
}
.orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(249,115,22,0.2), transparent);
  top: -200px; right: -200px;
}
.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(14,165,233,0.2), transparent);
  bottom: -100px; left: -100px;
}
```

---

## Прогресс-бар (для отчёта)

```html
<div class="progress-item">
  <div class="progress-label">
    <span>Аналитика</span>
    <span class="progress-value">84%</span>
  </div>
  <div class="progress-track">
    <div class="progress-fill" style="width: 84%; background: linear-gradient(90deg, #f97316, #fbbf24)"></div>
  </div>
</div>
```
```css
.progress-item { margin-bottom: 1rem; }
.progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; color: #f1f5f9; }
.progress-value { color: #f97316; font-weight: 600; }
.progress-track { background: rgba(255,255,255,0.08); border-radius: 8px; height: 8px; }
.progress-fill { height: 100%; border-radius: 8px; transition: width 1s ease; }
```

---

## Типографика

```css
h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; color: #f1f5f9; }
h2 { font-size: clamp(1.5rem, 3.5vw, 2.5rem); font-weight: 700; line-height: 1.2; color: #f1f5f9; }
h3 { font-size: 1.15rem; font-weight: 600; color: #f1f5f9; }
.subtitle { font-size: clamp(1rem, 2vw, 1.15rem); color: #94a3b8; line-height: 1.7; }
```

### Акцентный текст (оранжевый градиент)
```html
<span class="text-accent">настоящий маршрут</span>
```
```css
.text-accent {
  background: linear-gradient(135deg, #f97316, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Адаптивная сетка карточек

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}
@media (max-width: 680px) { .cards-grid { grid-template-columns: 1fr; } }
@media (max-width: 420px) { .cards-grid { gap: 0.75rem; } }
```

---

## Навигация (хедер)

```html
<header>
  <div class="logo">ПрофНавигатор</div>
  <a href="https://t.me/bronzelit" class="btn-cta btn-sm">Пройти бесплатно →</a>
</header>
```
```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.logo { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
.btn-sm { font-size: 0.9rem; padding: 0.6rem 1.4rem; }
```

---

## Футер

```html
<footer>
  <p>© 2026 · Павел Ежов · ПрофНавигатор</p>
  <div class="footer-links">
    <a href="https://t.me/bronzelit">@bronzelit</a>
    <a href="mailto:masterlit63@gmail.com">masterlit63@gmail.com</a>
  </div>
</footer>
```
```css
footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  color: #94a3b8;
  font-size: 0.9rem;
}
footer a { color: #94a3b8; text-decoration: none; }
footer a:hover { color: #f1f5f9; }
.footer-links { display: flex; gap: 1.5rem; justify-content: center; margin-top: 0.5rem; }
```

---

## Статус файла

Обновляется при добавлении нового компонента на любую страницу.
