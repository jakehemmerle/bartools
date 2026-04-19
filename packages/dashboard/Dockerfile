# syntax=docker/dockerfile:1-labs

FROM oven/bun:1.3.11-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY tsconfig.base.json ./
COPY --parents packages/*/package.json ./
RUN bun install --frozen-lockfile

COPY packages/dashboard ./packages/dashboard
COPY packages/types ./packages/types

ARG VITE_BARTOOLS_API_BASE_URL=/api
ARG VITE_BARTOOLS_REVIEWER_USER_ID=
ARG VITE_BARTOOLS_VENUE_ID=

ENV VITE_BARTOOLS_API_BASE_URL=${VITE_BARTOOLS_API_BASE_URL}
ENV VITE_BARTOOLS_REVIEWER_USER_ID=${VITE_BARTOOLS_REVIEWER_USER_ID}
ENV VITE_BARTOOLS_VENUE_ID=${VITE_BARTOOLS_VENUE_ID}

WORKDIR /app/packages/dashboard
RUN bun run build

FROM caddy:2.10-alpine AS runtime
WORKDIR /srv

COPY packages/dashboard/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/packages/dashboard/dist /srv

EXPOSE 8080
