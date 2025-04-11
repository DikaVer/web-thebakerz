# Dockerfile for building and running a Next\.js application using multi\-stage builds

# Use an argument for the Node version (default: 20\-alpine)
ARG NODE_VERSION=20-alpine

# Base image stage using the specified Node version
FROM node:${NODE_VERSION} AS base

# --- Setup Corepack and pnpm ---
# Enable Corepack and prepare pnpm (using a supported version, e\.g\. 8\.7\.0)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Build Arguments ---
# Define build arguments for public environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_AZURE_MAPS_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# --- Dependencies Stage ---
# Install system dependencies and Node modules
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./
# Install dependencies with a frozen lockfile
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
# Build the application
FROM base AS builder
WORKDIR /app
# Copy previously installed dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set environment variables for the build stage using the build arguments
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_AZURE_MAPS_KEY=${NEXT_PUBLIC_AZURE_MAPS_KEY} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
# Run the Next\.js build to generate production assets
RUN pnpm build

# --- Playwright Setup Stage ---
# Pre-download Playwright dependencies
FROM mcr.microsoft.com/playwright:focal AS playwright
RUN npx playwright install-deps

# --- Production \(Runner\) Stage ---
# Set up the production environment
FROM mcr.microsoft.com/playwright:focal AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non\-root user for better security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and build outputs \(standalone output and static assets\)
COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Playwright dependencies from the playwright stage
COPY --from=playwright /ms-playwright /ms-playwright

# Expose the port and set environment variables for runtime configuration
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Switch to the non\-root user and start the server
USER nextjs
CMD ["node", "server.js"]