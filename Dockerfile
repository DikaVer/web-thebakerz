# Use an argument for Node version (default: 20-alpine)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Enable Corepack and pin pnpm to a supported version
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Dependencies Stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm i --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy the source code (including any environment defaults if needed)
COPY . .

ENV AUTH_SECRET="default" \
    AZURE_COMMUNICATION_EMAIL_ENDPOINT="default" \
    AZURE_STORAGE_CONNECTION_STRING="default" \
    CONTAINER_NAME_AVATARS="default" \
    DATABASE_HOST="default" \
    DATABASE_NAME="default" \
    DATABASE_PASSWORD="default" \
    DATABASE_URL="default" \
    DATABASE_USER="default" \
    EMAIL_FROM="default" \
    GOOGLE_CLIENT_ID="default" \
    GOOGLE_CLIENT_SECRET="default" \
    NEXT_PUBLIC_API_BASE_URL="default"

# Optionally, if you need to copy an env file, do so:
# COPY .env.production .env.production
RUN pnpm run build

# --- Production Image ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create a non-root user for security
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
