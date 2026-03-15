# Multi-stage build for production-ready React/Vite application
# Force rebuild - $(date +%s%N)
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci since package-lock.json might be missing)
# Rebuild trigger: 2026-03-04T06:26:00Z
RUN npm install

# Copy source code
COPY . .

# Build the application with correct API URL
RUN npm run build

# Stage 2: Runtime stage with Nginx
FROM nginx:1.25-alpine

# Create a minimal main nginx.conf that doesn't require SSL
RUN echo 'user nginx;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /var/run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '  include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '  default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '  access_log /var/log/nginx/access.log;' >> /etc/nginx/nginx.conf && \
    echo '  sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '  keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '  include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Copy custom nginx server config to conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean up any problematic default configs
RUN rm -rf /etc/nginx/conf.d/ssl*

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    chmod -R 777 /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
