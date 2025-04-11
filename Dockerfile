# Dockerfile for building and running a Next\.js application using multi\-stage builds

# Use an argument for the Node version (default: 20\-alpine)
ARG NODE_VERSION=20-alpine

# Base image stage using the specified Node version
FROM node:${NODE_VERSION} AS base

# Add metadata to the image
LABEL maintainer="your-email@example.com"
LABEL description="The Bakerz Next.js Application"
LABEL version="1.0.0"

# --- Setup Corepack and pnpm ---
# Enable Corepack and prepare pnpm (using a supported version, e\.g\. 8\.7\.0)
RUN corepack enable && corepack prepare pnpm@8.7.0 --activate

# --- Build Arguments ---
# Define build arguments with default \(dummy\) values
# These are used during the build to satisfy Next\.js environment variable parsing
ARG NEXT_PRIVATE_COSMOS_DB_KEY_ARG="dummy-cosmos-db-key"
ARG NEXT_PRIVATE_COSMOS_DB_URI_ARG="https://dummy-cosmos-db-uri"
ARG NEXT_PRIVATE_AZURE_COMMUNICATION_EMAIL_ENDPOINT_ARG="https://dummy.azurecommendpoint"
ARG NEXT_PRIVATE_AZURE_STORAGE_CONNECTION_STRING_ARG="DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy;EndpointSuffix=core.windows.net"
ARG NEXT_PRIVATE_DATABASE_HOST_ARG="localhost"
ARG NEXT_PRIVATE_DATABASE_NAME_ARG="dummy"
ARG NEXT_PRIVATE_DATABASE_PASSWORD_ARG="dummy"
ARG NEXT_PRIVATE_DATABASE_URL_ARG="http://localhost:5432/dummy"
ARG NEXT_PRIVATE_DATABASE_USER_ARG="dummy"
ARG NEXT_PRIVATE_EMAIL_FROM_ARG="dummy@example.com"
ARG NEXT_PRIVATE_GOOGLE_CLIENT_ID_ARG="dummy-google-client-id"
ARG NEXT_PRIVATE_GOOGLE_CLIENT_SECRET_ARG="dummy-google-client-secret"
ARG NEXT_PRIVATE_STRIPE_SECRET_KEY_ARG="dummy"
ARG NEXT_PRIVATE_BLOB_AVATAR_CONTAINER_ARG="dummy"
ARG NEXT_PRIVATE_BLOB_PRODUCTS_CONTAINER_ARG="dummy"
ARG NEXT_PRIVATE_COSMOS_DB_NAME_ARG="dummy"
ARG NEXT_PUBLIC_API_BASE_URL_ARG="https://web-thebakerz-dev-hhanh4h8h2e9fwhu.germanywestcentral-01.azurewebsites.net"
ARG NEXT_PUBLIC_AZURE_MAPS_KEY_ARG="7bzv2NVJ68C9d1wabxtxLOeTC7mPcV4fZFoYcfBHZqVkXfQodKdAJQQJ99BBAC5RqLJpEl2BAAAgAZMP49OS"
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_ARG="AIzaSyCYzvUO6OClkren0t_X-Q4S5RzJY-fQ2h4"
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_ARG="pk_test_51QstCP4fjZXKNzErULgaAhn6KPl504SZ6WiR6XQIS4puiYRIYGbrbLbxSxqw3i4mIlscMGrJot0Hm63w5cVeQ9bg00befjhUUt"


# --- Dependencies Stage ---
# Install system dependencies and Node modules
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml .npmrc* ./
# Install dependencies with a frozen lockfile
RUN pnpm i --frozen-lockfile

# --- Build Stage ---
# Build the application
FROM base AS builder
WORKDIR /app
# Copy previously installed dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set environment variables for the build stage using the build arguments
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
    NEXT_PRIVATE_STRIPE_SECRET_KEY=${NEXT_PRIVATE_STRIPE_SECRET_KEY_ARG} \
    NEXT_PRIVATE_BLOB_AVATAR_CONTAINER=${NEXT_PRIVATE_BLOB_AVATAR_CONTAINER_ARG} \
    NEXT_PRIVATE_BLOB_PRODUCTS_CONTAINER=${NEXT_PRIVATE_BLOB_PRODUCTS_CONTAINER_ARG} \
    NEXT_PRIVATE_COSMOS_DB_NAME=${NEXT_PRIVATE_COSMOS_DB_NAME_ARG} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL_ARG} \
    NEXT_PUBLIC_AZURE_MAPS_KEY=${NEXT_PUBLIC_AZURE_MAPS_KEY_ARG} \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_ARG} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_ARG}
# Run the Next\.js build to generate production assets
RUN pnpm run build

# --- Production \(Runner\) Stage ---
# Set up the production environment
FROM mcr.microsoft.com/playwright:v1.51.1-focal AS runner
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

# Expose the port and set environment variables for runtime configuration
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to the non\-root user and start the server
USER nextjs
CMD ["node", "server.js"]