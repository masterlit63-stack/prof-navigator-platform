# ПрофНавигатор TMA — Справочник для Claude

## Структура папки tg-app/

```
tg-app/
├── index.html        # Точка входа: HTML всех 8 экранов
├── css/
│   └── app.css       # Все стили: переменные темы, экраны, компоненты
└── js/
    ├── data.js       # Данные: вопросы, профессии, архетипы, функции расчёта
    └── app.js        # Логика: навигация, квиз, рисование радара, шаринг
```

---

## Какой файл за что отвечает

### `index.html`
- Подключает Telegram Web App SDK
- Содержит HTML-разметку всех 8 экранов
- Каждый экран — `<div id="screen-[name]" class="screen ...">...</div>`
- Подключает скрипты: сначала `data.js`, затем `app.js`

### `css/app.css`
- CSS-переменные темы (`:root { --bg, --text, --btn-color, ... }`)
- JS обновляет переменные через `applyTelegramTheme()` из `tg.themeParams`
- Класс `.is-active` — экран виден (translateX 0)
- Класс `.is-behind` — экран слева за сценой (translateX -28%)
- Без классов — экран справа (translateX 100%)

### `js/data.js`
- `DIMENSIONS` — 6 измерений навыков (analytics, creativity, tech, social, nature, organization)
- `RADAR_ORDER` — порядок осей в радарном графике
- `QUIZ_QUESTIONS` — 15 вопросов, каждый по 4 варианта с `dim` (измерение)
- `QUIZ_PROGRESS` — нелинейный прогресс-бар [15, 25, ... 100]
- `ARCHETYPES` — 6 архетипов с описаниями, иконками, планами
- `PROFESSIONS` — 20 профессий с баллами по измерениям, зарплатой, вузами, планами
- `getArchetype(scores)` — возвращает ключ архетипа по баллам
- `cosineSimilarity(userScores, profScores)` — сходство для подбора профессий
- `getTopProfessions(scores, n)` — топ N подходящих профессий

### `js/app.js`
- `init()` — инициализация SDK, темы, кнопок
- `showScreen(name, addToHistory)` — переход на экран (слайд вправо)
- `goBack()` — назад по истории (слайд влево)
- `startQuiz()` — сброс и начало квиза
- `renderQuestion()` — отрисовка текущего вопроса
- `computeResult()` — нормализация баллов, архетип, профессии
- `drawRadar(scores, color)` — SVG радарный график
- `renderProfessions()` — список топ-3 профессий
- `openProfession(prof)` — детальная карточка
- `renderPlan()` — план действий по вкладкам
- `renderShare()` — экран поделиться
- `storageSet/storageGet` — CloudStorage (Telegram) + localStorage fallback

---

## Навигация между экранами

```
welcome → quiz → loading → archetype → professions → profession → plan → share
                                ↑                         ↓
                             (история: back → welcome)   (back → professions)
```

Кнопка BackButton:
- Скрыта на: welcome, quiz, loading, share
- Показана на: archetype, professions, profession, plan

---

## Где менять данные

| Что изменить | Где |
|---|---|
| Текст вопроса или варианты ответа | `data.js` → `QUIZ_QUESTIONS` |
| Добавить / изменить профессию | `data.js` → `PROFESSIONS` |
| Описание архетипа | `data.js` → `ARCHETYPES` |
| Цвета, отступы | `css/app.css` → `:root` переменные |
| Логика навигации | `js/app.js` → `showScreen` / `goBack` |
| Тексты на Welcome | `index.html` → `#screen-welcome` |

---

## Telegram API — что используется

| API | Где вызывается | Для чего |
|---|---|---|
| `tg.expand()` | `init()` | Раскрыть на весь экран |
| `tg.enableClosingConfirmation()` | `init()` | Подтверждение при закрытии |
| `tg.themeParams` | `applyTelegramTheme()` | Цвета системной темы |
| `tg.BackButton` | `updateBackButton()` | Нативная кнопка «Назад» |
| `tg.MainButton` | `setMainButton()` | Нижняя кнопка действия |
| `tg.HapticFeedback` | `haptic()` / `hapticNotify()` | Вибрация на ответ / результат |
| `tg.CloudStorage` | `storageSet/Get()` | Сохранение результата |

---

## Браузерный режим (без Telegram)

Приложение работает в обычном браузере для разработки:
- Вместо `MainButton` — кнопка `#main-btn` (fixed внизу экрана)
- Вместо `CloudStorage` — `localStorage`
- Без `HapticFeedback` (тихо игнорируется)
- Тема по умолчанию: светлая (CSS переменные в `:root`)
