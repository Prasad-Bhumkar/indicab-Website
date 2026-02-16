# IndiCab - Quick Start Guide for Developers

**Last Updated:** February 15, 2026  
**Status:** Production Ready ✅

## 🚀 Quick Links

- **Deployment Guide:** [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)
- **Technical Roadmap:** [AGENTS.md](./AGENTS.md)
- **API Documentation:** http://localhost:8000/swagger-ui.html
- **Frontend Components:** `indicab-frontend/src/components/`
- **Backend APIs:** `indicab-backend/src/main/java/com/indicab/controller/`

---

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Java JDK 17
- Maven 3.8+
- MySQL 8.0+
- Redis 7.0+ (optional for local dev)

### Frontend Setup
```bash
cd indicab-frontend
npm install
npm run dev        # Start dev server on http://localhost:5174
npm test -- --run  # Run tests
npm run build      # Production build
```

### Backend Setup
```bash
cd indicab-backend
mvn clean install
mvn spring-boot:run  # Start on http://localhost:8000
mvn test             # Run tests
mvn clean package    # Production build
```

### Monorepo Setup (Both Frontend & Backend)
```bash
npm run dev:all     # Starts frontend (5174) + backend (8000) concurrently
```

---

## 📁 Project Structure

```
indicab-Website/
├── indicab-frontend/              # React 18 frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── features/             # Redux feature slices
│   │   ├── services/             # API & WebSocket services
│   │   ├── config/               # API client configuration
│   │   ├── utils/                # Logger, error handler
│   │   └── App.jsx
│   ├── public/
│   ├── vite.config.js            # Vite configuration (includes proxy)
│   └── package.json
│
├── indicab-backend/               # Spring Boot backend
│   ├── src/main/java/com/indicab/
│   │   ├── controller/           # REST API controllers
│   │   ├── service/              # Business logic
│   │   ├── entity/               # JPA entities
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── mapper/               # Entity-DTO mappers
│   │   ├── config/               # Spring configuration
│   │   └── IndicabApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/         # Flyway migration files
│   ├── pom.xml
│   └── mvnw
│
├── docker-compose.prod.yml        # Production deployment config
├── deploy.sh                       # Automated deployment script
├── .env.production                 # Production environment variables
├── VPS_DEPLOYMENT_GUIDE.md        # Detailed deployment instructions
├── AGENTS.md                       # Comprehensive roadmap
└── QUICK_START.md                  # This file
```

---

## 🔑 Key Features

### Frontend
- ✅ Admin Dashboard (User, Driver, Booking management)
- ✅ Ride Booking with fare calculation
- ✅ Real-time WebSocket ride tracking
- ✅ Blog and travel packages management
- ✅ Vehicle fleet management
- ✅ User authentication & profile management
- ✅ Responsive design (mobile-first)
- ✅ Offline queue for bookings

### Backend
- ✅ REST APIs with JWT authentication
- ✅ WebSocket support (STOMP)
- ✅ Admin CRUD endpoints
- ✅ Database migrations (Flyway)
- ✅ Redis caching
- ✅ Health checks & metrics
- ✅ Comprehensive error handling
- ✅ Scheduled tasks support

---

## 🔌 API Endpoints

### Core APIs
```
GET    /api/v1/service-cities              # Get service areas
GET    /api/v1/routes                      # Get popular routes
GET    /api/v1/recommendations             # Get recommendations
POST   /api/v1/bookings                    # Create booking
GET    /api/v1/bookings/{id}              # Get booking details
```

### Admin APIs
```
GET|POST|PUT|DELETE /api/v1/admin/users    # User management
GET|POST|PUT|DELETE /api/v1/admin/drivers  # Driver management
GET|PUT            /api/v1/admin/bookings  # Booking admin
GET|POST|PUT|DELETE /api/v1/admin/blogs    # Blog management
GET|POST|PUT|DELETE /api/v1/admin/packages # Package management
GET|POST|PUT|DELETE /api/v1/admin/vehicles # Vehicle management
GET                /api/v1/admin/dashboard # Dashboard stats
```

### User APIs
```
GET    /api/v1/users/profile               # Get current user profile
PUT    /api/v1/users/{id}/profile          # Update profile
POST   /api/v1/users/{id}/password         # Change password
DELETE /api/v1/users/{id}/account          # Delete account
```

### WebSocket
```
WS     /ws/ride                            # Connect to WebSocket
STOMP  /topic/ride/{rideId}                # Subscribe to live tracking
```

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env.development/.env.production):**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=IndiCab
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=https://...
```

**Backend (application.properties):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/indicab_website
spring.datasource.username=indicab_user
spring.datasource.password=password
spring.redis.host=localhost
spring.redis.port=6379
jwt.secret=your-256-bit-secret
```

---

## 🧪 Testing

### Frontend
```bash
npm test -- --run           # Run all tests
npm test -- --watch         # Watch mode
npm test:coverage           # Coverage report
npm test:ui                 # UI dashboard
```

### Backend
```bash
mvn test                    # Run all tests
mvn test -Dtest=TestClass   # Run specific test
mvn verify                  # Full build + tests
```

---

## 📦 Building for Production

### Frontend
```bash
cd indicab-frontend
npm run build:prod
# Output: dist/ folder ready for deployment
```

### Backend
```bash
cd indicab-backend
mvn clean package
# Output: target/indicab-backend-*.jar ready for deployment
```

### Docker Deployment
```bash
# Build images
./deploy.sh build

# Start services
./deploy.sh start

# Verify deployment
./deploy.sh verify

# Check status
./deploy.sh status
```

---

## 🐛 Debugging

### Frontend Debugging
```javascript
// Enable debug logging
localStorage.setItem('DEBUG', '*');

// Check Redux state
window.__REDUX_DEVTOOLS_EXTENSION__

// WebSocket status
import { websocketService } from './services/websocketService';
console.log(websocketService.getConnectionStatus());
```

### Backend Debugging
```bash
# View logs
./deploy.sh logs backend

# Stream logs
docker logs -f indicab-backend

# Access database
docker exec -it indicab-mysql mysql -u indicab_user -p indicab_website

# Check health
curl http://localhost:8000/actuator/health
```

---

## 📊 Database

### Migration Files
- `V001__create_blog_table.sql` - Blog table schema
- `V002__create_package_table.sql` - Travel packages
- `V003__create_vehicle_table.sql` - Vehicle/car fleet

### Backup & Restore
```bash
# Create backup
./deploy.sh backup

# Restore from backup (interactive)
./indicab-backend/scripts/backup-restore.sh

# Manual backup
docker exec indicab-mysql mysqldump -u indicab_user -p indicab_website > backup.sql
```

---

## 🔒 Security

### Important Files (Keep Secret!)
- `.env.production` - Production environment variables
- `ssl/indicab.key` - SSL private key
- JWT_SECRET - Change in production
- Database passwords - Change in production
- Redis password - Change in production

### Best Practices
- ✅ Use strong passwords (min 16 characters)
- ✅ Enable HTTPS in production
- ✅ Rotate JWT secrets regularly
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting on APIs
- ✅ Monitor logs for suspicious activity
- ✅ Keep dependencies updated
- ✅ Use strong database user permissions

---

## 📱 API Authentication

### Getting a Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### Using Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/users/profile
```

---

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] `.env.production` configured with actual values
- [ ] SSL certificates obtained
- [ ] Database migrations tested
- [ ] Backups configured with cron
- [ ] Monitoring setup (Sentry, etc.)
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] Load tested (if needed)
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on deployment

---

## 📞 Getting Help

1. **Check Documentation:**
   - [AGENTS.md](./AGENTS.md) - Comprehensive roadmap
   - [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md) - Deployment details
   - API docs: http://localhost:8000/swagger-ui.html

2. **Check Logs:**
   ```bash
   ./deploy.sh logs backend
   ./deploy.sh logs frontend
   docker logs -f indicab-mysql
   ```

3. **Test Connectivity:**
   ```bash
   # Frontend
   curl http://localhost:5174
   
   # Backend
   curl http://localhost:8000/actuator/health
   
   # Database
   docker exec indicab-mysql mysql -u indicab_user -p -e "SELECT 1"
   ```

4. **Common Issues:**
   - Ports in use: `lsof -i :5174` (frontend) or `:8000` (backend)
   - Database connection: Check `SPRING_DATASOURCE_URL` in `.env.production`
   - WebSocket: Verify `/ws` proxy in Vite/Nginx config
   - CORS issues: Check `CORS_ALLOWED_ORIGINS` in backend config

---

## 📝 Useful Commands

```bash
# Development
npm run dev:all              # Start both frontend & backend
npm run dev                  # Frontend only
cd indicab-backend && mvnw spring-boot:run  # Backend only

# Testing
npm test -- --run            # Frontend tests
mvn test                     # Backend tests

# Building
npm run build:prod           # Frontend production build
mvn clean package            # Backend production jar

# Deployment
./deploy.sh build            # Build Docker images
./deploy.sh start            # Start all services
./deploy.sh status           # Check status
./deploy.sh logs backend     # View backend logs
./deploy.sh backup           # Create database backup
./deploy.sh verify           # Verify deployment

# Database
docker exec -it indicab-mysql mysql -u indicab_user -p indicab_website
```

---

## 🎯 Next Steps

1. **Local Development:**
   - Clone repo: `git clone <repo>`
   - Setup frontend: `cd indicab-frontend && npm install`
   - Setup backend: `cd indicab-backend && mvn install`
   - Run both: `npm run dev:all`

2. **Testing Locally:**
   - Test frontend: `npm test`
   - Test backend: `mvn test`
   - Manual testing: Swagger UI at `http://localhost:8000/swagger-ui.html`

3. **Deploying to VPS:**
   - Read: [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)
   - Configure: `.env.production` with your values
   - Deploy: `./deploy.sh build && ./deploy.sh start`
   - Verify: `./deploy.sh verify`

---

## 📚 Documentation Map

- **AGENTS.md** → Full project roadmap, version history, technical specs
- **VPS_DEPLOYMENT_GUIDE.md** → Step-by-step deployment instructions
- **QUICK_START.md** → This file, quick reference for developers
- **indicab-backend/scripts/README.md** → Database scripts documentation
- **code files** → JSDoc comments and inline documentation

---

*Last Updated: February 15, 2026*  
*For questions or issues, refer to AGENTS.md troubleshooting section*
