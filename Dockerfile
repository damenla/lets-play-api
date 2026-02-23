# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies including devDependencies for building
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
# Copy migrations explicitly because they are not compiled by tsc
COPY --from=builder /app/src/infrastructure/database/migrations ./dist/infrastructure/database/migrations

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
