# Use an argument for the Node version (default: 20-alpine)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Enable Corepack and prepare pnpm (using a supported version, e.g. 8.7.0)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Define build arguments with default (dummy) values ---
# These defaults are used during the build so that Next.js does not fail when it
# attempts to parse environment variables that it expects to be valid URLs, etc.

ARG NEXT_PUBLIC_API_BASE_URL_ARG="https://web-thebakerz-dev-hhanh4h8h2e9fwhu.germanywestcentral-01.azurewebsites.net"

# --- Dependencies Stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy only package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm i --frozen-lockfile

# --- Build Stage ---
FROM base AS builder
WORKDIR /app
# Copy dependencies and then the rest of your source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for the build stage using the build args.
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL_ARG}

# Run the Next.js build (this makes these env variables available during build)
RUN pnpm run build

# --- Production (Runner) Stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and build outputs (standalone output and static assets)
COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the port and set additional runtime environment variables
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to the non-root user and start the server
USER nextjs
CMD ["node", "server.js"]
