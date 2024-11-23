FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /usr/src/app

FROM base AS install-prod
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile --production --ignore-scripts

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=install /temp/prod/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

FROM base AS release
COPY --from=install-prod /temp/prod/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

EXPOSE 9999/tcp
ENTRYPOINT ["pnpm", "start:prod"]
