# API (Express + Prisma). Контекст сборки — корень монорепо.
# docker build -f apps/api/Dockerfile -t yeshiva-api .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Builder: установка, генерация Prisma-клиента, сборка TS ---
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @yeshiva/types build
RUN pnpm --filter @yeshiva/api exec prisma generate
RUN pnpm --filter @yeshiva/api build

# --- Runtime: переносим весь workspace (node_modules со сгенерированным
#     Prisma-клиентом + dist). Симлинки pnpm сохраняются. ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 4000
# Применяем миграции и стартуем (idempotent: migrate deploy безопасен).
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/index.js"]
