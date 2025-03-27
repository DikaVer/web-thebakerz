# Dockerfile for building and running a Next\.js application using multi\-stage builds

# Use an argument for the Node version (default: 20\-alpine)
ARG NODE_VERSION=20-alpine

# Base image stage using the specified Node version
FROM node:${NODE_VERSION} AS base

# --- Setup Corepack and pnpm ---
# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Dependencies Stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package files for better caching
COPY package.json pnpm-lock.yaml .npmrc* ./
# Install dependencies with production flag for smaller node_modules
RUN pnpm i --frozen-lockfile --prod

# --- Development Dependencies Stage ---
FROM deps AS dev-deps
# Install all dependencies including devDependencies
RUN pnpm i --frozen-lockfile 

# --- Build Stage ---
FROM dev-deps AS builder
WORKDIR /app
# Copy source code
COPY . .

# Set build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_AZURE_MAPS_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_AZURE_MAPS_KEY=${NEXT_PUBLIC_AZURE_MAPS_KEY}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}

# Use Next.js output options for smaller builds
RUN pnpm run build

# --- Production (Runner) Stage ---
# Use Node alpine instead of Playwright for a smaller image
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
RUN mkdir -p .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the port and set environment variables
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to the non-root user and start the server
USER nextjs
CMD ["node", "server.js"]