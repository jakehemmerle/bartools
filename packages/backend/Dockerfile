# syntax=docker/dockerfile:1.7
# Build context: monorepo root (see infra/src/image.ts).

FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/inference/package.json packages/inference/
COPY packages/types/package.json packages/types/
COPY packages/dashboard/package.json packages/dashboard/
COPY packages/mobile/package.json packages/mobile/
COPY packages/ui/package.json packages/ui/
COPY packages/eval/package.json packages/eval/
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runtime
WORKDIR /app
# Copy entire install tree (root + per-workspace node_modules) first,
# then overlay real source so Bun's hoisted deps aren't shadowed.
COPY --from=deps /app /app
COPY packages/backend ./packages/backend
COPY packages/inference ./packages/inference
COPY packages/types ./packages/types
ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/packages/backend
CMD ["bun", "run", "src/index.ts"]
