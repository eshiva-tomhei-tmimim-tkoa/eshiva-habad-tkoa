# Eshiva Chabad Lubavitch Tkoa — новый сайт

Редизайн и продакшен-реализация сайта **Ешивы «ХаБаД Ткоа»** (Yeshiva Chabad
Tkoa) — учебного заведения в посёлке Ткоа (Гуш-Эцион, Израиль).

Сайт — на русском (основной), с переключателем на иврит (HE, RTL) и английский (EN).

## Документация

- [CONTEXT.md](CONTEXT.md) — о проекте, целевой стек, контент-модель, дизайн-система.
- [ARCHITECTURE.md](ARCHITECTURE.md) — схема БД (MySQL), контракты API (Express),
  модель админки и авторизации, локализация и шрифты.

## Целевой стек

| Слой | Решение |
| --- | --- |
| Фронт (сайт) | Next.js (App Router) + Tailwind |
| Фронт (админка) | Next.js + MUI |
| Бэк | Express (общий API) |
| БД | MySQL |
| Монорепо | pnpm workspaces (+ опц. Turborepo) |
| Палитра | `electric` (light/dark) |
| Шрифты | Manrope (RU/EN) + Alef (HE) |

## Структура (целевая)

```
apps/
  web/     # Next.js + Tailwind — публичный сайт
  admin/   # Next.js + MUI — админка (CRUD контента)
  api/     # Express + MySQL — единый бэкенд
packages/
  types/   # общие TS-типы (контракты API)
  ui/      # (опц.) общие компоненты
  config/  # eslint / tsconfig / prettier
```

## Статус

Дизайн-прототип готов (хранится локально, вне git). Идёт переход на продакшен-стек —
см. план этапов в [CONTEXT.md §9](CONTEXT.md) и [ARCHITECTURE.md §9](ARCHITECTURE.md).
