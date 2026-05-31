# Архитектура — Ешива «ХаБаД Ткоа»

> Целевая продакшен-архитектура. Сопровождает `CONTEXT.md`: там — что за проект и
> какие решения приняты, здесь — как это устроено технически (монорепо, БД, API,
> админка, авторизация, шрифты/локализация).

## Стек (зафиксировано)

- **Фронт (сайт):** Next.js (App Router) + Tailwind
- **Фронт (админка):** Next.js + MUI
- **Бэк:** Express (общий API для сайта и админки)
- **БД:** MySQL
- **Монорепо:** pnpm workspaces (+ опц. Turborepo)
- **Палитра:** только `electric` (light/dark)
- **Шрифты:** Manrope (RU/EN) + Alef (HE)

---

## 1. Топология монорепо

```
yeshiva-tkoa/
├─ apps/
│  ├─ web/        # Next.js + Tailwind — публичный сайт (читает API)
│  ├─ admin/      # Next.js + MUI — админка (CRUD через защищённый API)
│  └─ api/        # Express + MySQL — единый бэкенд
├─ packages/
│  ├─ types/      # общие TS-типы (контракты API делятся между всеми приложениями)
│  ├─ ui/         # (опц.) общие компоненты/иконки/Logo
│  └─ config/     # eslint, tsconfig, prettier
├─ pnpm-workspace.yaml
└─ turbo.json     # (опц.)
```

Поток данных:

```
[admin] --CRUD--> [api/Express] <--MySQL-->  БД
                       ^
[web] ----GET (публичный) ----┘
```

`packages/types` — единый источник правды по формам сущностей; импортируется и в
Express (валидация/ответы), и в Next (типизация фетча).

**Связи в модели (нормализация).** В центре — **люди** (`people`). Человек
характеризуется:
- **должностью** (`position_id` → `positions`) — Рош Ешива, Шлиах, Мадрих и т.п.;
- **предметами**, которые ведёт (Тора) — M:N через `person_subjects`;
- (для учеников) **курсами**, которые проходит — M:N через `student_courses`.

`subjects.lead_person_id` → `people`; `schedule_slots` → `subjects` и `people` по
FK. Должность и предмет — **разные оси**: Шлиах/мадрих это должность, а не предмет,
поэтому в `subjects` им не место. Система тегов (`teachers.tags`) **упразднена** —
её роль делят `positions` (кто человек) и `subjects` (что преподаёт).

---

## 2. Модель данных (MySQL)

Все таблицы — InnoDB, `utf8mb4`. Контент мультиязычный (ru/he/en): текстовые поля
храним в JSON-объекте `{ ru, he, en }` либо в отдельной таблице переводов
(см. §2.9). Ниже — вариант с JSON-полями (проще для старта).

Соглашения: `id` BIGINT PK AUTO_INCREMENT; `created_at`/`updated_at` TIMESTAMP;
`sort_order` INT для ручной сортировки; `is_published` BOOLEAN для черновиков.

**FK и `ON DELETE` (явно для каждой связи):**
- Стыковочные таблицы M:N (`person_subjects`, `student_courses`) — `ON DELETE
  CASCADE` (запись связи не имеет смысла без обеих сторон).
- Ссылка-владелец, где потеря родителя осиротит запись расписания
  (`schedule_slots.subject_id`, `schedule_slots.person_id`) — `ON DELETE RESTRICT`:
  нельзя удалить предмет/человека, пока он стоит в расписании.
- Необязательная ссылка, без которой запись остаётся осмысленной
  (`subjects.lead_person_id`, `students.teacher_id`) — `ON DELETE SET NULL`.
- `donors.campaign_id` — `ON DELETE CASCADE` (доноры принадлежат кампании).

**Индексы.** Помимо PK закладываем индексы под фактические выборки: по FK
(`position_id`, `lead_person_id`, `subject_id`, `person_id`, `campaign_id`,
`student_id`, `course_id`), а также по `is_published` и `sort_order` там, где идёт
фильтрация черновиков и ручная сортировка списков.

**Производные значения не храним как поля.** Счётчики, которые можно получить
агрегатом (`campaign.donors_count`), вычисляются запросом `COUNT(...)` либо
поддерживаются на стороне платёжного вебхука — отдельная колонка-копия удалена,
чтобы не расходиться с фактическими данными.

### 2.1 people — люди / команда (`TEAM`)
Все члены команды: и преподаватели, и шлиахим, и мадрихим. Кого человек
представляет — определяет **должность**, что он преподаёт (если преподаёт) —
связь с предметами.

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | BIGINT PK | |
| name | JSON | `{ru,he,en}` |
| position_id | BIGINT FK → positions.id | должность (обязательно) |
| bio | JSON | биография |
| photo_url | VARCHAR(512) | заменяет `ImgPlaceholder` |
| sort_order | INT | |
| is_published | BOOL | |

> Поле `tags` отсутствует. На карточке команды показываются **должность**
> (из `positions`) и **предметы** (из `person_subjects`, §2.3a) — если человек
> их ведёт. Шлиах/мадрих без предметов покажут только должность.

### 2.1a positions — должности (справочник)
Редактируемый лукап. Даёт фильтрацию «все шлиахим / все мадрихим» и единые
названия во всех локалях.

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | BIGINT PK | |
| title | JSON | Рош Ешива, Зам. Рош Ешивы, Преподаватель, Шлиах, Мадрих… |
| sort_order | INT | порядок в списке команды |

### 2.2 students — истории учеников (`STUDENTS`)
| Поле | Тип | Заметки |
| name | JSON | |
| quote | JSON | короткая цитата |
| teacher_id | BIGINT FK → people.id | у кого учится; ON DELETE SET NULL |
| story | JSON | полная история |
| duration | VARCHAR(32) | напр. «3 года» |
| photo_url | VARCHAR(512) | |
| sort_order, is_published | | |

> Поле `profession` прототипа (свободный текст «FullStack Java Developer…»)
> заменяется связью `student_courses` (§2.6a) с справочником курсов.
>
> Поле `teacher` (раньше свободный JSON-текст) нормализовано в `teacher_id` →
> `people`: имя и локализация наставника берутся из связанной записи, а не
> дублируются строкой. Если ученик не привязан к конкретному человеку — `NULL`.

### 2.3 subjects — предметы Торы (бывш. `CURRICULUM`)
Канонический справочник предметов **Торы** (Талмуд, Алоха, Хасидут, Сихот Ребе,
Смиха). Это не профессиональные курсы (см. §2.6) и не теги. Страница «Учебная
программа» строится из этой таблицы.

| Поле | Тип | Заметки |
| code | VARCHAR(8) | TLM/HAL/HAS/SIH/SMC |
| title | JSON | Талмуд, Алоха, Хасидут… |
| hours | VARCHAR(32) | «12 ч / неделя» |
| color | VARCHAR(32) | CSS-токен/hex |
| items | JSON | массив пунктов программы |
| lead_person_id | BIGINT FK → people.id | ответственный за дисциплину; ON DELETE SET NULL |
| sort_order, is_published | | |

### 2.3a person_subjects — связь человек ↔ предмет (M:N)
Заменяет `teachers.tags`. Один человек ведёт несколько предметов; один предмет
могут вести несколько человек (в расписании Талмуд ведут и Рав Чупин, и Рав
Каминштейн).

| Поле | Тип | Заметки |
| person_id | BIGINT FK → people.id | ON DELETE CASCADE |
| subject_id | BIGINT FK → subjects.id | ON DELETE CASCADE |
| (PK) | PRIMARY KEY (person_id, subject_id) | без дублей |

Использование:
- **Карточка команды** → должность + предметы человека через `person_subjects`.
- **Страница программы** → предмет + `lead_person_id` (и при желании все ведущие через join).
- **Фильтры** «по предмету» / «по должности» работают по связям и `positions`, не по строкам.

### 2.4 daily_blocks — распорядок дня (`DAILY_BLOCKS`)
| Поле | Тип | Заметки |
| time | TIME | «06:45» → `06:45:00` |
| title | JSON | |
| category | ENUM | prayer/study/meal/spirit/personal |
| description | JSON | |
| sort_order | INT | |

### 2.5 schedule_slots — расписание (`SCHEDULE`)
| Поле | Тип | Заметки |
| subject_id | BIGINT FK → subjects.id | вместо строки `subject`; ON DELETE RESTRICT |
| person_id | BIGINT FK → people.id | вместо строки `teacher`; ON DELETE RESTRICT |
| days | JSON | массив **номеров** дней `[0,1,2,3,4]` (0=Вс … 6=Сб) |
| start_time | TIME | напр. `08:30:00` |
| end_time | TIME | напр. `10:00:00` |

> Расписание ссылается на `subjects` и `people` по FK — названия и локализация
> берутся из связанных записей, дублирования строк нет. Поле `category` убрано:
> цвет/категория наследуется от предмета (`subjects.color`).
>
> `days` хранит **локаль-независимые номера** дней недели (0=Вс), а не строки
> `["Вс","Пн"]`: подписи дней локализуются на выводе (ru/he/en), в БД языка нет.
> Время хранится типом `TIME` вместо `VARCHAR(5)` — это даёт валидацию формата и
> корректные сравнения/сортировку по времени.
> _Альтернатива при необходимости полной нормализации:_ таблица
> `schedule_slot_days(slot_id, weekday)` вместо JSON-массива — но для фиксированного
> домена 0–6 JSON-массив чисел достаточен и проще в запросах.

### 2.6 donations / donors — пожертвования
**campaign** (`is_active` помечает текущую): `goal_amount` DECIMAL, `raised_amount`
DECIMAL, `currency` (ILS), `ends_at`, `title` JSON, `is_active`.
**donors** (список на странице): `campaign_id` BIGINT FK → campaign.id
(ON DELETE CASCADE), `name` (или «Аноним»), `amount` DECIMAL, `donated_at`,
`is_anonymous`. (Реальные платежи — см. §6, провайдер отдельно.)

> `donors` теперь привязаны к кампании через `campaign_id` — это поддерживает
> несколько кампаний (исторических/будущих), а не одну анонимную. Число доноров —
> производное (`COUNT(donors WHERE campaign_id = …)`), отдельная колонка
> `donors_count` удалена, чтобы не расходиться с фактическим списком; при наличии
> платёжного вебхука её можно держать денормализованной и обновлять там же, где
> растёт `raised_amount`.

### 2.6a courses + student_courses — профессиональные курсы (`курсы`)
**Не** предметы Торы. Это внешние/прикладные курсы, которые проходят ученики
параллельно с учёбой (FullStack Java Developer, UI/UX Designer, подготовка в
медицинский и т.п.).

`courses`:
| Поле | Тип | Заметки |
| id | BIGINT PK | |
| title | JSON | «FullStack Java Developer» |
| description | JSON | необязательно |
| provider | VARCHAR(128) | внешняя школа/площадка, если есть |
| is_published | BOOL | |

`student_courses` (M:N ученик ↔ курс), заменяет свободный `students.profession`:
| Поле | Тип | Заметки |
| student_id | BIGINT FK → students.id | ON DELETE CASCADE |
| course_id | BIGINT FK → courses.id | ON DELETE CASCADE |
| (PK) | PRIMARY KEY (student_id, course_id) | |

> Открытый вопрос: ведёт ли курсы кто-то из `people` (тогда добавить
> `course_instructors`), или курсы целиком внешние. По данным прототипа они
> скорее внешние — оставил без связи с командой до уточнения.

### 2.7 contact_messages — заявки с формы контактов
`name`, `email`, `phone`, `message`, `created_at`, `is_read`. Только запись с сайта
и чтение в админке.

### 2.8 site_content — произвольные тексты страниц
Для редактируемых кусков, не привязанных к сущности (hero, миссия, блок о Ребе,
футер): `content_key` (VARCHAR, напр. `home.hero.title`), `value` JSON `{ru,he,en}`,
`page_group` (страница). Админка правит по ключу.

> Колонки переименованы с `key`/`group` на `content_key`/`page_group`: исходные
> имена — зарезервированные слова SQL и требовали бы экранирования обратными
> кавычками в каждом запросе.

### 2.9 users — пользователи админки
`email` UNIQUE, `password_hash`, `role` ENUM(`admin`,`editor`), `created_at`,
`last_login_at`. (Подробнее — §4.)

> **Альтернатива JSON-полям:** нормализованные переводы — таблица
> `translations(entity, entity_id, field, locale, value)`. Гибче для масштабной
> локализации, но сложнее в запросах. Для текущего объёма JSON-полей достаточно.

---

## 3. API (Express)

Базовый префикс `/api`. Две группы: **public** (только чтение, для сайта) и
**admin** (CRUD, под авторизацией).

### 3.1 Публичные (GET)

| Метод | Путь | Отдаёт |
| --- | --- | --- |
| GET | `/api/team` | люди + должность + их предметы (через `person_subjects`) |
| GET | `/api/positions` | справочник должностей |
| GET | `/api/subjects` | предметы Торы + ведущий (`lead_person_id`) |
| GET | `/api/courses` | профессиональные курсы |
| GET | `/api/daily` | блоки распорядка |
| GET | `/api/schedule` | расписание со встроенными subject/person (опц. `?day=`, `?person_id=`, `?subject_id=`) |
| GET | `/api/students` | истории учеников + их курсы (через `student_courses`) |
| GET | `/api/campaign` | активная кампания + последние доноры |
| GET | `/api/content/:group` | тексты страницы (`home`, `study`, …) |
| POST | `/api/contact` | приём формы контактов |
| POST | `/api/donations` | инициировать пожертвование (→ платёжный провайдер) |

Все GET принимают `?locale=ru|he|en` — API может вернуть либо нужную локаль, либо
полный `{ru,he,en}` (решаем на этапе фетча; для SSG проще полный объект).

### 3.2 Админские (CRUD, префикс `/api/admin`, требуют авторизации)

Единый паттерн на каждую сущность (`team`→people, `positions`, `students`,
`subjects`, `courses`, `daily`, `schedule`, `donors`, `content`):

| Метод | Путь | Действие |
| --- | --- | --- |
| GET | `/api/admin/:entity` | список (вкл. черновики) |
| GET | `/api/admin/:entity/:id` | один элемент |
| POST | `/api/admin/:entity` | создать |
| PUT | `/api/admin/:entity/:id` | обновить |
| DELETE | `/api/admin/:entity/:id` | удалить |
| PATCH | `/api/admin/:entity/reorder` | массовая смена `sort_order` |

Плюс:
- `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/me`
- `POST /api/admin/upload` — загрузка фото (в `/uploads` или S3-совместимое
  хранилище), возвращает `photo_url`
- `PUT /api/admin/campaign` — правка цели/суммы/дат
- `PUT /api/admin/team/:id/subjects` — задать набор предметов человека
  (перезаписывает `person_subjects`). В форме человека это мультиселект по
  `subjects` — он заменяет прежний ввод тегов. Должность задаётся отдельным
  полем `position_id`.
- `PUT /api/admin/students/:id/courses` — задать набор курсов ученика
  (перезаписывает `student_courses`).

### 3.3 Формат ответа

```jsonc
// успех
{ "data": <payload>, "meta": { "count": 8 } }
// ошибка
{ "error": { "code": "VALIDATION", "message": "...", "fields": { "email": "..." } } }
```

Валидация входа — zod (схемы можно держать в `packages/types` и переиспользовать).

---

## 4. Админка и авторизация

- **Приложение `apps/admin`** на Next.js + MUI. Экраны: вход → дашборд → списки
  сущностей (MUI DataGrid) → форма редактирования (поля ru/he/en, загрузка фото,
  drag-сортировка, переключатель «опубликовано/черновик»).
- **Авторизация:** email + пароль (`password_hash` — bcrypt/argon2). Сессия —
  JWT в httpOnly-cookie **или** серверная сессия; на каждый `/api/admin/*` —
  middleware проверки токена и роли.
- **Роли:** `admin` (всё, включая управление пользователями) и `editor` (контент
  без пользователей). На старте достаточно одного `admin`.
- **Защита:** rate-limit на login, CORS только для доменов web/admin, CSRF-защита
  при cookie-сессиях, все мутации — только аутентифицированные.

Минимальный набор экранов админки (1:1 с сущностями раздела «контент-модель»
в `CONTEXT.md §7`): Команда (должность + мультиселект предметов), Должности,
Предметы (программа, с ведущим), Курсы, Ученики (+ их курсы), Распорядок,
Расписание,
Кампания/Доноры, Тексты страниц (site_content), Сообщения с форм.

---

## 5. Фронт (web) — рендеринг и тема

- **Стратегия рендера:** контентные страницы — SSG/ISR (ревалидация по таймеру
  или по вебхуку из админки после сохранения), формы — клиентские + POST в API.
- **Тема:** `data-theme` (light/dark) на `<html>`; палитра одна (`electric`),
  значения — CSS-переменные, Tailwind ссылается на них в `tailwind.config`.
- **Компоненты:** переносятся из прототипа (`Home`, `Team`, `Curriculum`,
  `Schedule`, `Donate`, `Header`, `Footer`, `Logo`, `Btn`). `window`-неймспейс и
  Babel-в-браузере уходят, заменяются ES-импортами.

---

## 6. Платежи (пожертвования)

Демо-блок прототипа заменяется реальным провайдером (Stripe / израильский шлюз
вроде Tranzila / PayPlus — выбрать по требованиям к ILS и налоговой отчётности
501(c)(3)). Поток: `POST /api/donations` создаёт намерение → редирект/виджет
провайдера → вебхук провайдера обновляет `campaign.raised_amount` и пишет в
`donors`. Ключи провайдера — только на стороне Express, не на фронте.

---

## 7. Локализация и шрифты

- **Языки:** ru (основной), he, en. Библиотека — `next-intl` или `next-i18next`.
- **RTL:** для he — `dir="rtl"` на уровне layout/locale; зеркалирование отступов
  через логические свойства CSS (`margin-inline`, `padding-inline`).
- **Шрифты:**
  - RU/EN → **Manrope** (`--font-display`, fallback `system-ui`).
  - HE → **Alef**, подключается через `:lang(he)` или `[dir="rtl"]`:
    ```css
    :lang(he), [dir="rtl"] { --font-display: "Alef", "Manrope", sans-serif; }
    ```
  - Моно-акцент — JetBrains Mono (`.mono`).
- Контент в БД хранит все локали (`{ru,he,en}`); API/фронт выбирают нужную.

---

## 8. Окружение и деплой (ориентир)

- **Переменные:** `DATABASE_URL` (MySQL), `JWT_SECRET`, `UPLOAD_DIR`/S3-ключи,
  ключи платёжного провайдера, `NEXT_PUBLIC_API_URL`.
- **Локально:** docker-compose с MySQL; `pnpm dev` поднимает web/admin/api.
- **Миграции/сиды:** инструмент на выбор (Prisma migrate / Drizzle / Knex). Сид
  заполняет таблицы данными из JSX-массивов прототипа (`TEAM`, `STUDENTS`, …).
  При сидировании: прежние `role` людей → справочник `positions` + `position_id`;
  прежние `tags`, бывшие предметами, → `person_subjects`; не-предметные пометки
  («Шалиах», «Управление») становятся должностями в `positions`; свободный
  `profession` учеников → `courses` + `student_courses`; строковое имя наставника
  в `STUDENTS` → `students.teacher_id` (резолв по `people`); дни `SCHEDULE`
  (`["Вс","Пн"]`) → номера `[0,1]`; строки времени `«08:30»` → `TIME`.
- **Прод:** web и admin — на платформе под Next (Vercel/Node-хостинг); api — Node;
  MySQL — управляемый инстанс. CORS и cookie-домены настроить под итоговые адреса.

---

## 9. Порядок реализации

1. Монорепо + конфиги + `packages/types`.
2. MySQL-схема, миграции, сид из прототипа.
3. Express: публичные GET-роуты → проверка на `apps/web`.
4. Auth + админские CRUD-роуты.
5. `apps/admin` (MUI): вход, дашборд, CRUD-экраны, загрузка фото.
6. Перенос компонентов в `apps/web`; Tailwind + переменные `electric`; шрифты
   Manrope/Alef; удалить выбор палитры/шрифта.
7. Формы (контакты, пожертвования) + платёжный провайдер.
8. Локализация he (RTL/Alef) и en.
9. ISR-ревалидация по сохранению в админке; деплой.
