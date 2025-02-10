# Use an argument to specify the Node version (default: 20-alpine)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Enable Corepack and prepare pnpm (choose Option 1 or Option 2)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate
# If you want to use the default version, use:
# RUN corepack enable && corepack prepare pnpm --activate

# --- Dependency Installation Stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm i --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# --- Final Production Stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
