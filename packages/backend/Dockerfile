# syntax=docker/dockerfile:1-labs
# Build context: monorepo root (see infra/src/image.ts).

FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY --parents packages/*/package.json ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runtime
WORKDIR /app
# Overlay source on top of the install tree so Bun's hoisted node_modules survive.
COPY --from=deps /app /app
COPY packages/backend ./packages/backend
COPY packages/inference ./packages/inference
COPY packages/types ./packages/types
ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/packages/backend
CMD ["bun", "run", "src/index.ts"]
