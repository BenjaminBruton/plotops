# PlotOps Deployment Guide

This guide covers deploying PlotOps to production environments, including infrastructure setup, security configuration, and monitoring.

## 🏗️ Architecture Overview

PlotOps production deployment consists of:

- **Web Application**: Next.js app deployed to Vercel/Netlify
- **Mobile Application**: React Native app distributed via Expo EAS
- **Database**: Supabase hosted PostgreSQL with real-time features
- **Caching**: Redis Cloud for session and data caching
- **Storage**: Supabase Storage for files and assets
- **CDN**: Automatic via deployment platforms

## 🚀 Quick Deployment

### Prerequisites

- **Supabase Account**: [supabase.com](https://supabase.com)
- **Vercel Account**: [vercel.com](https://vercel.com) (for web app)
- **Expo Account**: [expo.dev](https://expo.dev) (for mobile app)
- **Domain Name**: For custom domain setup
- **SSL Certificate**: Automatic via deployment platforms

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Deploy Database Schema**
   ```bash
   # Push migrations to production
   supabase db push
   
   # Verify deployment
   supabase db diff
   ```

3. **Configure Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
   -- ... (repeat for all tables)
   
   -- Create RLS policies (see security section)
   ```

4. **Set up Authentication**
   - Configure OAuth providers (Google, GitHub, etc.)
   - Set up email templates
   - Configure redirect URLs
   - Enable email confirmations

### 2. Web Application Deployment (Vercel)

1. **Connect Repository**
   - Import project from GitHub/GitLab
   - Select the `apps/web` directory as root
   - Configure build settings

2. **Environment Variables**
   ```bash
   # Required environment variables
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # External APIs
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   OPENWEATHER_API_KEY=your-weather-key
   
   
   # Email/SMS
   SENDGRID_API_KEY=your-sendgrid-key
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   
   # Security
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-domain.com
   ```

3. **Build Configuration**
   ```javascript
   // vercel.json
   {
     "buildCommand": "cd ../.. && pnpm build:web",
     "outputDirectory": ".next",
     "installCommand": "cd ../.. && pnpm install",
     "framework": "nextjs"
   }
   ```

4. **Domain Setup**
   - Add custom domain in Vercel dashboard
   - Configure DNS records
   - Enable automatic HTTPS

### 3. Mobile Application Deployment (Expo EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   eas login
   ```

2. **Configure EAS Build**
   ```json
   // eas.json
   {
     "cli": {
       "version": ">= 3.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": true
         }
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
           "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

3. **Build and Submit**
   ```bash
   # Build for production
   eas build --platform all --profile production
   
   # Submit to app stores
   eas submit --platform ios
   eas submit --platform android
   ```

4. **Over-the-Air Updates**
   ```bash
   # Configure update channels
   eas update:configure
   
   # Publish updates
   eas update --branch production --message "Bug fixes and improvements"
   ```

## 🔧 Infrastructure Setup

### Supabase Configuration

1. **Database Settings**
   ```sql
   -- Set timezone
   ALTER DATABASE postgres SET timezone TO 'UTC';
   
   -- Enable extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
   ```

2. **Storage Buckets**
   ```javascript
   // Create storage buckets
   const buckets = [
     { name: 'scripts', public: false },
     { name: 'headshots', public: true },
     { name: 'location-photos', public: true },
     { name: 'call-sheets', public: false },
     { name: 'assets', public: false }
   ];
   
   // Configure bucket policies
   ```

3. **Real-time Configuration**
   ```sql
   -- Enable real-time for specific tables
   ALTER PUBLICATION supabase_realtime ADD TABLE plotops.projects;
   ALTER PUBLICATION supabase_realtime ADD TABLE plotops.scenes;
   ALTER PUBLICATION supabase_realtime ADD TABLE plotops.project_members;
   ```


### Redis Cache Setup

1. **Redis Cloud Configuration**
   ```bash
   # Environment variables
   REDIS_URL=redis://username:password@host:port
   REDIS_TLS_URL=rediss://username:password@host:port
   ```

2. **Cache Strategy**
   ```javascript
   // Cache configuration
   const cacheConfig = {
     // User sessions (24 hours)
     sessions: { ttl: 86400 },
     
     // API responses (5 minutes)
     api: { ttl: 300 },
     
     // Static data (1 hour)
     static: { ttl: 3600 },
     
     // Real-time data (30 seconds)
     realtime: { ttl: 30 }
   };
   ```

## 🔒 Security Configuration

### Environment Security

1. **Secrets Management**
   ```bash
   # Use platform-specific secret management
   # Vercel: Environment Variables dashboard
   # Expo: EAS Secrets
   ```

2. **API Key Rotation**
   ```bash
   # Rotate Supabase keys
   supabase projects api-keys --project-ref YOUR_PROJECT_REF
   
   # Update all deployment environments
   # Set up automated rotation (recommended)
   ```

### Database Security

1. **Row Level Security Policies**
   ```sql
   -- Organization isolation
   CREATE POLICY "Users can only access their organization data" ON plotops.projects
     FOR ALL USING (
       organization_id IN (
         SELECT organization_id FROM plotops.user_profiles 
         WHERE id = auth.uid()
       )
     );
   
   -- Role-based access
   CREATE POLICY "Producers can manage projects" ON plotops.projects
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM plotops.user_profiles 
         WHERE id = auth.uid() 
         AND role IN ('producer', 'admin')
         AND organization_id = projects.organization_id
       )
     );
   ```

2. **Database Backup**
   ```bash
   # Automated daily backups
   supabase db dump --project-ref YOUR_PROJECT_REF --schema plotops
   
   # Store backups securely (S3, Google Cloud Storage)
   ```

### Application Security

1. **Content Security Policy**
   ```javascript
   // next.config.js
   const securityHeaders = [
     {
       key: 'Content-Security-Policy',
       value: `
         default-src 'self';
         script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co;
         style-src 'self' 'unsafe-inline';
         img-src 'self' data: blob: *.supabase.co *.googleapis.com;
         connect-src 'self' *.supabase.co wss://*.supabase.co;
       `.replace(/\s{2,}/g, ' ').trim()
     }
   ];
   ```

2. **Rate Limiting**
   ```javascript
   // API route protection
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   ```

## 📊 Monitoring & Analytics

### Application Monitoring

1. **Vercel Analytics**
   ```javascript
   // Enable Vercel Analytics
   import { Analytics } from '@vercel/analytics/react';
   
   export default function App() {
     return (
       <>
         <YourApp />
         <Analytics />
       </>
     );
   }
   ```

2. **Supabase Monitoring**
   ```sql
   -- Monitor database performance
   SELECT * FROM pg_stat_statements 
   ORDER BY total_exec_time DESC 
   LIMIT 10;
   
   -- Monitor real-time connections
   SELECT * FROM pg_stat_activity 
   WHERE application_name = 'supabase_realtime';
   ```

3. **Custom Metrics**
   ```javascript
   // Track film production metrics
   const metrics = {
     projectsCreated: 'counter',
     scenesCompleted: 'counter',
     callSheetsGenerated: 'counter',
     activeUsers: 'gauge',
     responseTime: 'histogram'
   };
   ```

### Error Tracking

1. **Sentry Integration**
   ```javascript
   // Web application
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 0.1
   });
   ```

2. **Mobile Error Tracking**
   ```javascript
   // Expo application
   import * as Sentry from 'sentry-expo';
   
   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     enableInExpoDevelopment: false
   });
   ```

### Performance Monitoring

1. **Web Vitals**
   ```javascript
   // Track Core Web Vitals
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

2. **Database Performance**
   ```sql
   -- Monitor slow queries
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   WHERE mean_exec_time > 1000 
   ORDER BY mean_exec_time DESC;
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy PlotOps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web

  deploy-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - run: pnpm install
      - run: eas update --branch production --non-interactive
        working-directory: apps/mobile
```

### Database Migrations

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  push:
    paths:
      - 'services/supabase/migrations/**'
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - run: supabase db push
```

## 🌍 Multi-Environment Setup

### Environment Configuration

1. **Development**
   ```bash
   # .env.development
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
   ```

2. **Staging**
   ```bash
   # .env.staging
   NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
   ```

3. **Production**
   ```bash
   # .env.production
   NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
   ```

### Branch Strategy

```
main (production)
├── staging (staging environment)
├── develop (development environment)
└── feature/* (feature branches)
```

## 📈 Scaling Considerations

### Database Scaling

1. **Connection Pooling**
   ```javascript
   // Supabase connection pooling
   const supabase = createClient(url, key, {
     db: {
       schema: 'plotops'
     },
     auth: {
       persistSession: true
     },
     realtime: {
       params: {
         eventsPerSecond: 10
       }
     }
   });
   ```

2. **Read Replicas**
   ```sql
   -- Configure read replicas for reporting queries
   -- Use Supabase's built-in read replica support
   ```

### Application Scaling

1. **Edge Functions**
   ```javascript
   // Use Vercel Edge Functions for global performance
   export const config = {
     runtime: 'edge'
   };
   
   export default function handler(req) {
     // Handle requests at the edge
   }
   ```

2. **CDN Configuration**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-project.supabase.co'],
       loader: 'custom',
       loaderFile: './image-loader.js'
     }
   };
   ```

## 🚨 Disaster Recovery

### Backup Strategy

1. **Database Backups**
   ```bash
   # Daily automated backups
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   supabase db dump --project-ref $PROJECT_REF > backup_$DATE.sql
   aws s3 cp backup_$DATE.sql s3://plotops-backups/
   ```

2. **File Storage Backups**
   ```bash
   # Backup Supabase Storage
   supabase storage download --recursive bucket-name ./backups/
   ```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   supabase db reset --project-ref $PROJECT_REF
   psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
   ```

2. **Application Recovery**
   ```bash
   # Rollback deployment
   vercel rollback
   eas update --branch production --message "Rollback to previous version"
   ```

## 📞 Support & Maintenance

### Health Checks

```javascript
// API health check endpoint
export default function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      storage: await checkStorage(),
      redis: await checkRedis()
    }
  };
  
  res.status(200).json(health);
}
```

### Maintenance Windows

1. **Scheduled Maintenance**
   - Database maintenance: Sundays 2-4 AM UTC
   - Application updates: Rolling deployments
   - Security patches: As needed

2. **Emergency Procedures**
   - Incident response team contacts
   - Escalation procedures
   - Communication templates

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Run all tests (`pnpm test`)
- [ ] Verify environment variables
- [ ] Check database migrations
- [ ] Review security configurations
- [ ] Test backup/restore procedures
- [ ] Validate SSL certificates
- [ ] Check monitoring setup

### Post-Deployment

- [ ] Verify application health
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Validate real-time features
- [ ] Test mobile app updates

### Rollback Plan

- [ ] Document rollback procedures
- [ ] Test rollback in staging
- [ ] Prepare communication plan
- [ ] Identify rollback triggers
- [ ] Set up automated alerts

---

For additional support with deployment, refer to the [troubleshooting guide](TROUBLESHOOTING.md) or create an issue in the repository.