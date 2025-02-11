# Use an argument for the Node version (default: 20-alpine)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Enable Corepack and prepare pnpm (using a supported version, e.g. 8.7.0)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Define build arguments with default (dummy) values ---
# These defaults are used during the build so that Next.js does not fail when it
# attempts to parse environment variables that it expects to be valid URLs, etc.
ARG NEXT_PRIVATE_COSMOS_DB_KEY_ARG="dummy-cosmos-db-key"
ARG NEXT_PRIVATE_COSMOS_DB_URI_ARG="https://dummy-cosmos-db-uri"
ARG NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG="https://dummy.azurecommendpoint"
ARG NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING_ARG="DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy;EndpointSuffix=core.windows.net"
ARG CONTAINER_NAME_AVATARS_ARG="dummy-container"
ARG NEXT_PRIVATE_DATABASE_HOST_ARG="localhost"
ARG NEXT_PRIVATE_DATABASE_NAME_ARG="dummy"
ARG NEXT_PRIVATE_DATABASE_PASSWORD_ARG="dummy"
ARG NEXT_PRIVATE_DATABASE_URL_ARG="http://localhost:5432/dummy"
ARG NEXT_PRIVATE_DATABASE_USER_ARG="dummy"
ARG NEXT_PRIVATE_EMAIL_FROM_ARG="dummy@example.com"
ARG NEXT_PRIVATE_GOOGLE_CLIENT_ID_ARG="dummy-google-client-id"
ARG NEXT_PRIVATE_GOOGLE_CLIENT_SECRET_ARG="dummy-google-client-secret"
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
ENV NEXT_PRIVATE_COSMOS_DB_KEY=${NEXT_PRIVATE_COSMOS_DB_KEY_ARG} \
    NEXT_PRIVATE_COSMOS_DB_URI=${NEXT_PRIVATE_COSMOS_DB_URI_ARG} \
    NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT=${NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG} \
    NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING=${NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING_ARG} \
    NEXT_PRIVATE_DATABASE_HOST=${NEXT_PRIVATE_DATABASE_HOST_ARG} \
    NEXT_PRIVATE_DATABASE_NAME=${NEXT_PRIVATE_DATABASE_NAME_ARG} \
    NEXT_PRIVATE_DATABASE_PASSWORD=${NEXT_PRIVATE_DATABASE_PASSWORD_ARG} \
    NEXT_PRIVATE_DATABASE_URL=${NEXT_PRIVATE_DATABASE_URL_ARG} \
    NEXT_PRIVATE_DATABASE_USER=${NEXT_PRIVATE_DATABASE_USER_ARG} \
    NEXT_PRIVATE_EMAIL_FROM=${NEXT_PRIVATE_EMAIL_FROM_ARG} \
    NEXT_PRIVATE_GOOGLE_CLIENT_ID=${NEXT_PRIVATE_GOOGLE_CLIENT_ID_ARG} \
    NEXT_PRIVATE_GOOGLE_CLIENT_SECRET=${NEXT_PRIVATE_GOOGLE_CLIENT_SECRET_ARG} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL_ARG}

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
