# Публичный сайт (Next.js, output: standalone). Контекст — корень монорепо.
# docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example/api -t yeshiva-web .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @yeshiva/types build
# NEXT_PUBLIC_* «зашивается» в клиентский бандл на этапе сборки.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BUILD_STANDALONE=1
RUN pnpm --filter @yeshiva/web build

# --- Runtime: минимальный standalone-сервер Next ---
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
