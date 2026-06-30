# Multi-stage build for production-ready React/Vite application
# Force rebuild - $(date +%s%N)
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci since package-lock.json might be missing)
# Rebuild trigger: 2026-03-04T06:26:00Z
RUN npm install --fetch-timeout=600000 --fetch-retries=5

# Copy source code
COPY . .

# Build the application with correct API URL
RUN npm run build

# Stage 2: Runtime stage with Nginx
FROM nginx:1.25-alpine

# Copy custom nginx server config to conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean up any problematic default configs
RUN rm -rf /etc/nginx/conf.d/ssl* 2>/dev/null || true

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    chmod -R 777 /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
