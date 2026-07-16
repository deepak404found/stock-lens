FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

FROM base AS deps
# Skip husky prepare during image builds (CI=true + shell check in prepare)
ENV CI=true
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ENV CI=true
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
# --ignore-scripts: prune removes husky/is-ci then would re-run prepare
RUN pnpm build && pnpm prune --prod --ignore-scripts

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/app/server.js"]
