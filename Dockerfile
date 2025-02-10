# Use an argument for the Node version (default: 20-alpine)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Enable Corepack and prepare pnpm (using a supported version, e.g. 8.7.0)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Define build arguments with default (dummy) values ---
# These defaults are used during the build so that Next.js does not fail when it
# attempts to parse environment variables that it expects to be valid URLs, etc.
ARG AUTH_SECRET_ARG="default-auth-secret"
ARG AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG="https://dummy.azurecommendpoint"
ARG AZURE_STORAGE_CONNECTION_STRING_ARG="DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy;EndpointSuffix=core.windows.net"
ARG CONTAINER_NAME_AVATARS_ARG="dummy-container"
ARG DATABASE_HOST_ARG="localhost"
ARG DATABASE_NAME_ARG="dummy"
ARG DATABASE_PASSWORD_ARG="dummy"
ARG DATABASE_URL_ARG="http://localhost:5432/dummy"
ARG DATABASE_USER_ARG="dummy"
ARG EMAIL_FROM_ARG="dummy@example.com"
ARG GOOGLE_CLIENT_ID_ARG="dummy-google-client-id"
ARG GOOGLE_CLIENT_SECRET_ARG="dummy-google-client-secret"
ARG NEXT_PUBLIC_API_BASE_URL_ARG="http://localhost:3000/api"

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
ENV AUTH_SECRET=${AUTH_SECRET_ARG} \
    AZURE_COMMUNICATION_EMAIL_ENDPOINT=${AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG} \
    AZURE_STORAGE_CONNECTION_STRING=${AZURE_STORAGE_CONNECTION_STRING_ARG} \
    CONTAINER_NAME_AVATARS=${CONTAINER_NAME_AVATARS_ARG} \
    DATABASE_HOST=${DATABASE_HOST_ARG} \
    DATABASE_NAME=${DATABASE_NAME_ARG} \
    DATABASE_PASSWORD=${DATABASE_PASSWORD_ARG} \
    DATABASE_URL=${DATABASE_URL_ARG} \
    DATABASE_USER=${DATABASE_USER_ARG} \
    EMAIL_FROM=${EMAIL_FROM_ARG} \
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID_ARG} \
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET_ARG} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL_ARG}

# Run the Next.js build (this makes these env variables available during build)
RUN pnpm run build

# --- Production (Runner) Stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Re-declare the same build args for the runner stage (so runtime defaults are set)
ARG AUTH_SECRET_ARG
ARG AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG
ARG AZURE_STORAGE_CONNECTION_STRING_ARG
ARG CONTAINER_NAME_AVATARS_ARG
ARG DATABASE_HOST_ARG
ARG DATABASE_NAME_ARG
ARG DATABASE_PASSWORD_ARG
ARG DATABASE_URL_ARG
ARG DATABASE_USER_ARG
ARG EMAIL_FROM_ARG
ARG GOOGLE_CLIENT_ID_ARG
ARG GOOGLE_CLIENT_SECRET_ARG
ARG NEXT_PUBLIC_API_BASE_URL_ARG

# Set runtime environment variables (they default to the build arg values)
ENV AUTH_SECRET=${AUTH_SECRET_ARG} \
    AZURE_COMMUNICATION_EMAIL_ENDPOINT=${AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG} \
    AZURE_STORAGE_CONNECTION_STRING=${AZURE_STORAGE_CONNECTION_STRING_ARG} \
    CONTAINER_NAME_AVATARS=${CONTAINER_NAME_AVATARS_ARG} \
    DATABASE_HOST=${DATABASE_HOST_ARG} \
    DATABASE_NAME=${DATABASE_NAME_ARG} \
    DATABASE_PASSWORD=${DATABASE_PASSWORD_ARG} \
    DATABASE_URL=${DATABASE_URL_ARG} \
    DATABASE_USER=${DATABASE_USER_ARG} \
    EMAIL_FROM=${EMAIL_FROM_ARG} \
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID_ARG} \
    GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET_ARG} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL_ARG}

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
