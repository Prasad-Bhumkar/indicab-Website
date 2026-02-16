# Indicab Application - Deployment Guide

**Last Updated:** February 13, 2026  
**Status:** ✅ Production Ready

---

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Development Setup](#development-setup)
3. [Testing](#testing)
4. [Production Build](#production-build)
5. [Deployment](#deployment)
6. [Monitoring & Support](#monitoring--support)

---

## Environment Setup

### Prerequisites
- Node.js 18+ or higher
- npm or yarn package manager
- Git for version control
- Java 17+ (for backend, optional for frontend-only deployment)
- MySQL 8.0+ (for backend, optional for frontend-only deployment)

### Environment Variables

Create `.env` file in `indicab-frontend/` directory:

```env
# Frontend Environment
VITE_API_BASE_URL=https://api.indicab.com/api  # Production API endpoint
VITE_APP_NAME=Indicab
VITE_LOG_LEVEL=info  # debug, info, warn, error
```

For development/testing with mock backend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Development Setup

### 1. Install Dependencies

```bash
cd indicab-frontend
npm install
```

### 2. Run Development Server

**Option A: Frontend Only (with fallback data)**
```bash
npm run dev
# Accessible at http://localhost:5173
```

**Option B: Frontend + Mock Backend**
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start mock backend
npm run dev:mock
# Mock backend available at http://localhost:8000
```

**Option C: Both simultaneously**
```bash
npm run dev:all
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### 3. Run Tests

```bash
# Run tests once
npm run test -- --run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### 4. Code Quality

The project includes:
- **Linting:** ESLint (configured in `eslint.config.js`)
- **Testing:** Vitest + React Testing Library
- **Logging:** Custom logger utility (`src/utils/logger.js`)
- **Error Handling:** Comprehensive error handler (`src/utils/errorHandler.js`)

---

## Testing

### Unit Tests
All tests are located in `**/*.test.jsx` files.

**Current Status:**
- Test Files: 1 passed (1)
- Tests: 5 passed (5)
- Pass Rate: 100%

Run tests:
```bash
npm run test -- --run
```

### Manual Testing Checklist

#### Authentication
- [ ] User can register with valid email
- [ ] User can login with correct credentials
- [ ] User gets error on invalid login
- [ ] Session persists on page refresh
- [ ] User can logout successfully

#### Bookings
- [ ] User can fill booking form
- [ ] Booking saves offline if backend unavailable
- [ ] Offline bookings sync when online
- [ ] Booking confirmation shows correctly
- [ ] Booking history displays all bookings

#### Features
- [ ] Popular routes load and display
- [ ] Recommendations load and display
- [ ] User can toggle favorite recommendations
- [ ] Service cities show with statistics
- [ ] Map integration works correctly

#### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Offline indicator appears when disconnected
- [ ] Error boundary catches React errors gracefully
- [ ] API errors are logged properly

#### Accessibility
- [ ] Form labels are associated with inputs
- [ ] Keyboard navigation works
- [ ] ARIA attributes are present
- [ ] Color contrast meets WCAG standards

---

## Production Build

### Build Command

```bash
npm run build
```

**Output:**
- Location: `dist/` directory
- Main bundle: `dist/assets/index-*.js`
- Size: ~194 KB gzipped (reasonable for feature-rich SPA)
- Build time: ~4-5 seconds

### Build Optimization

The build includes:
- ✅ Code splitting with lazy loading
- ✅ Tree shaking to remove unused code
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Asset optimization

### Verify Production Build

```bash
# Preview production build locally
npm run preview
# Accessible at http://localhost:4173
```

---

## Deployment

### Frontend Deployment Options

#### Option 1: Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir dist
```

Environment variables in Netlify:
- `VITE_API_BASE_URL` = Your production API URL

#### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: GitHub Pages

```bash
npm run deploy
# This uses the homepage setting in package.json
# Homepage: https://Prasad-Bhumkar.github.io/indicab-Website/
```

#### Option 4: Docker

Create `Dockerfile` in root:

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY indicab-frontend/package*.json ./
RUN npm install
COPY indicab-frontend/ ./
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t indicab-frontend:latest .
docker run -p 80:80 indicab-frontend:latest
```

#### Option 5: Traditional Server (Apache/Nginx)

```bash
# Copy dist folder to server
scp -r dist/* user@server:/var/www/html/

# On server with Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Backend Deployment

See `AGENTS.md` for Spring Boot backend setup and Docker deployment.

---

## Production Checklist

### Security
- [ ] All API calls use HTTPS only
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly set
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)

### Performance
- [ ] Bundle size optimized (< 250 KB gzipped)
- [ ] Images optimized and lazy-loaded
- [ ] Caching headers configured
- [ ] API response times < 500ms
- [ ] JavaScript execution < 1s
- [ ] Lighthouse score > 80

### Monitoring
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics configured
- [ ] API health checks configured
- [ ] Uptime monitoring enabled
- [ ] Log aggregation set up

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing completed
- [ ] Keyboard navigation works
- [ ] Color contrast verified
- [ ] Form labels properly associated

---

## Monitoring & Support

### Logging

The application includes a comprehensive logging system:

```javascript
import { logger } from './utils/logger';

// Different log levels
logger.debug('Component', 'Debug message');
logger.info('Component', 'Info message');
logger.warn('Component', 'Warning message');
logger.error('Component', 'Error message');

// API logging
logger.logRequest('GET', '/api/bookings');
logger.logResponse('GET', '/api/bookings', 200, data);
logger.logApiError('GET', '/api/bookings', 500, error);
```

Log Level Configuration:
- Development: `DEBUG` (all messages)
- Production: `INFO` (info and above)

### Error Tracking

Configure Sentry for production error tracking:

```javascript
// Already configured in src/config/sentry.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // ... more config
});
```

### Health Checks

Monitor backend health:

```bash
curl https://api.indicab.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-02-13T15:00:00Z",
  "version": "1.0.0"
}
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page on load | Check `VITE_API_BASE_URL` environment variable |
| API calls failing | Verify backend is running and CORS configured |
| Offline features not working | Check browser localStorage permission |
| Build fails | Run `npm install` and clear node_modules cache |
| Large bundle size | Review code-splitting and lazy loading setup |

### Support Contacts

- **Technical Support:** support@indicab.com
- **Bug Reports:** github.com/Prasad-Bhumkar/indicab-Website/issues
- **Documentation:** See `AGENTS.md` and `API_ENDPOINTS.md`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 13, 2026 | Initial production release |
| 1.0.1 | TBD | Bug fixes and patches |
| 1.1.0 | TBD | New features and improvements |

---

## Additional Resources

- **Frontend Documentation:** See `AGENTS.md`
- **API Documentation:** See `API_ENDPOINTS.md`
- **Development Progress:** See `DEVELOPMENT_PROGRESS.md`
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Redux Toolkit:** https://redux-toolkit.js.org/

---

**Status:** ✅ PRODUCTION READY  
**Last Verification:** February 13, 2026  
**Next Review:** Monthly
