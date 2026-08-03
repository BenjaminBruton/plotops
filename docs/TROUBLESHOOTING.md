# PlotOps Troubleshooting Guide

This guide provides solutions to common issues and frequently asked questions for the PlotOps film production ERP system.

## 🚨 Quick Diagnostics

### System Health Check

Run these commands to quickly diagnose common issues:

```bash
# Check service status
pnpm dev:status

# Validate environment
pnpm dev:validate

# View service logs
pnpm docker:logs

# Test database connection
pnpm db:test-connection
```

### Emergency Reset

If you're experiencing major issues, try a complete reset:

```bash
# ⚠️ WARNING: This will delete all local data
pnpm dev:reset
```

## 🔧 Installation and Setup Issues

### Node.js and pnpm Issues

**Problem**: `command not found: pnpm`
```bash
# Solution: Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

**Problem**: Node.js version compatibility issues
```bash
# Check Node.js version
node --version

# Should be 18.0.0 or higher
# If not, install Node.js 18+ from nodejs.org
```

**Problem**: `pnpm install` fails with permission errors
```bash
# Solution: Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Docker Issues

**Problem**: Docker daemon not running
```bash
# Check Docker status
docker info

# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

**Problem**: Docker containers won't start
```bash
# Check available disk space
df -h

# Clean up Docker resources
docker system prune -f

# Rebuild containers
pnpm docker:rebuild
```

**Problem**: Port conflicts (ports already in use)
```bash
# Check what's using the ports
lsof -i :3000  # Web app
lsof -i :5432  # PostgreSQL
lsof -i :5678  # n8n

# Kill processes using the ports
kill -9 <PID>

# Or use different ports in docker-compose.override.yml
```

### Environment Variables

**Problem**: Missing or invalid environment variables
```bash
# Copy template and fill in values
cp .env.template .env

# Generate secure keys
pnpm env:generate-keys

# Validate environment
pnpm env:validate
```

**Problem**: Supabase connection issues
```bash
# Check Supabase URL and keys
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

## 🗄️ Database Issues

### Connection Problems

**Problem**: Cannot connect to database
```bash
# Check if database container is running
docker ps | grep supabase-db

# Check database logs
docker logs plotops-supabase-db-1

# Test connection manually
psql -h localhost -p 5432 -U postgres -d postgres
```

**Problem**: Database migrations fail
```bash
# Check migration files
ls -la services/supabase/migrations/

# Run migrations manually
pnpm db:migrate

# If migrations fail, check logs
pnpm docker:logs supabase-db
```

**Problem**: Row Level Security (RLS) blocking queries
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'plotops';

-- Temporarily disable RLS for debugging (development only)
ALTER TABLE plotops.projects DISABLE ROW LEVEL SECURITY;
```

### Data Issues

**Problem**: Sample data not loading
```bash
# Reset and reseed database
pnpm db:reset
pnpm db:seed

# Check seed script logs
node tools/dev/seed-database.js --verbose
```

**Problem**: Duplicate key errors
```sql
-- Check for duplicate data
SELECT scene_number, COUNT(*) 
FROM plotops.scenes 
WHERE project_id = 'your-project-id'
GROUP BY scene_number 
HAVING COUNT(*) > 1;

-- Fix duplicates by updating scene numbers
UPDATE plotops.scenes 
SET scene_number = scene_number || '_' || id::text 
WHERE id IN (SELECT id FROM duplicates);
```

## 🌐 Web Application Issues

### Build and Development

**Problem**: Next.js build fails
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Build with verbose output
pnpm build:web --verbose
```

**Problem**: TypeScript errors
```bash
# Run type checking
pnpm type-check

# Check specific package
pnpm --filter @plotops/types type-check

# Regenerate types from database
pnpm generate:types
```

**Problem**: Hot reload not working
```bash
# Check if files are being watched
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
pnpm web:dev
```

### Runtime Issues

**Problem**: Authentication not working
```javascript
// Check Supabase client configuration
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Test authentication
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data, error);
```

**Problem**: API routes returning 404
```bash
# Check Next.js routing
ls -la apps/web/src/app/api/

# Verify API route structure
# Should be: apps/web/src/app/api/[endpoint]/route.ts
```

**Problem**: CORS errors
```javascript
// Check CORS configuration in next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

## 📱 Mobile Application Issues

### Expo and React Native

**Problem**: Expo CLI not working
```bash
# Install latest Expo CLI
npm install -g @expo/cli

# Login to Expo
expo login

# Check Expo status
expo whoami
```

**Problem**: Metro bundler issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache completely
rm -rf node_modules/.cache
rm -rf apps/mobile/.expo
```

**Problem**: iOS simulator not starting
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 14"

# Open Simulator app
open -a Simulator
```

**Problem**: Android emulator issues
```bash
# List available AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Pixel_4_API_30

# Check Android SDK path
echo $ANDROID_HOME
```

### Build and Deployment

**Problem**: EAS build fails
```bash
# Check EAS configuration
cat eas.json

# Clear EAS cache
eas build --clear-cache

# Build with verbose logging
eas build --platform ios --profile development --verbose
```

**Problem**: Over-the-air (OTA) updates not working
```bash
# Check update configuration
eas update:configure

# Publish update with specific message
eas update --branch production --message "Bug fixes"

# Check update status
eas update:list
```

## 🔄 Automation and Integration Issues

### n8n Workflow Problems

**Problem**: n8n container won't start
```bash
# Check n8n logs
docker logs plotops-n8n-1

# Check n8n configuration
cat docker-compose.yml | grep -A 10 n8n

# Access n8n directly
curl http://localhost:5678/healthz
```

**Problem**: Workflows not triggering
```bash
# Check webhook URLs
curl -X POST http://localhost:5678/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'

# Check n8n execution logs
# Access n8n UI at http://localhost:5678
# Go to Executions tab to see workflow runs
```

**Problem**: Email notifications not sending
```bash
# Test email configuration
curl -X POST http://localhost:5678/webhook/test-email \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "body": "This is a test"
     }'

# Check SendGrid API key
echo $SENDGRID_API_KEY
```

### External API Issues

**Problem**: Google Maps not loading
```javascript
// Check API key configuration
console.log('Google Maps API Key:', process.env.GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...');

// Test API key
fetch(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`)
  .then(response => console.log('Maps API Status:', response.status));
```

**Problem**: Weather API not working
```bash
# Test weather API
curl "http://api.openweathermap.org/data/2.5/weather?q=London&appid=$OPENWEATHER_API_KEY"
```

## 🔒 Security and Permissions

### Authentication Issues

**Problem**: Users can't access organization data
```sql
-- Check user organization assignment
SELECT up.*, o.name as org_name 
FROM plotops.user_profiles up
JOIN plotops.organizations o ON up.organization_id = o.id
WHERE up.id = 'user-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'projects';
```

**Problem**: Role-based permissions not working
```sql
-- Check user roles and permissions
SELECT 
  up.role,
  pm.role as project_role,
  p.title as project_title
FROM plotops.user_profiles up
LEFT JOIN plotops.project_members pm ON up.id = pm.user_id
LEFT JOIN plotops.projects p ON pm.project_id = p.id
WHERE up.id = 'user-id';
```

### File Upload Issues

**Problem**: File uploads failing
```javascript
// Check file size limits
console.log('Max file size:', process.env.MAX_FILE_SIZE || '10MB');

// Test upload endpoint
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => console.log('Upload status:', response.status));
```

**Problem**: Supabase Storage permissions
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'your-bucket';

-- Create storage policy if missing
INSERT INTO storage.policies (id, bucket_id, policy_name, definition)
VALUES (
  'allow-authenticated-uploads',
  'scripts',
  'Authenticated users can upload',
  'auth.role() = ''authenticated'''
);
```

## 📊 Performance Issues

### Slow Database Queries

**Problem**: Queries taking too long
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC;

-- Analyze specific query
EXPLAIN ANALYZE SELECT * FROM plotops.scenes WHERE project_id = 'uuid';
```

**Problem**: Missing database indexes
```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'plotops' 
AND n_distinct > 100;

-- Create missing indexes
CREATE INDEX CONCURRENTLY idx_scenes_project_location 
ON plotops.scenes(project_id, location_name);
```

### Memory and Resource Issues

**Problem**: High memory usage
```bash
# Check Docker container memory usage
docker stats

# Check Node.js memory usage
node --max-old-space-size=4096 apps/web/server.js

# Monitor system resources
htop  # or top on macOS
```

**Problem**: Slow file uploads
```bash
# Check available disk space
df -h

# Check network speed
curl -o /dev/null -s -w "%{speed_download}\n" http://speedtest.wdc01.softlayer.com/downloads/test100.zip

# Optimize file uploads
# Use multipart uploads for large files
# Implement client-side compression
```

## 🔍 Debugging Tools and Techniques

### Logging and Monitoring

**Enable Debug Logging**:
```bash
# Set debug environment variables
export DEBUG=plotops:*
export NODE_ENV=development
export LOG_LEVEL=debug

# Start with verbose logging
pnpm dev --verbose
```

**Database Query Logging**:
```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- View logs
docker logs plotops-supabase-db-1 --tail 100 -f
```

**Network Debugging**:
```bash
# Monitor network requests
# Use browser dev tools Network tab

# Test API endpoints
curl -v -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/projects

# Check WebSocket connections
# Use browser dev tools Console:
# new WebSocket('ws://localhost:3000/socket')
```

### Development Tools

**React Developer Tools**:
- Install React DevTools browser extension
- Use Components and Profiler tabs
- Monitor state changes and re-renders

**Database Tools**:
```bash
# Access database directly
psql -h localhost -p 5432 -U postgres -d postgres

# Use pgAdmin (web interface)
open http://localhost:8080

# Use Supabase Studio
open http://localhost:3001
```

**API Testing**:
```bash
# Use Postman collection
# Import from /api/postman.json

# Or use curl for quick tests
curl -X GET http://localhost:3000/api/health
```

## ❓ Frequently Asked Questions

### General Questions

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page. You'll receive an email with reset instructions.

**Q: Can I use PlotOps offline?**
A: The mobile app has limited offline functionality for on-set use. The web application requires an internet connection.

**Q: How do I invite team members to my project?**
A: Go to Project Settings → Team Members → Invite. Enter their email and select their role.

**Q: What file formats are supported for script upload?**
A: PDF and Final Draft (.fdx) files are supported. The script should follow standard formatting.

### Technical Questions

**Q: How do I backup my project data?**
A: Use `pnpm db:backup` for development, or use Supabase's backup features in production.

**Q: Can I integrate with other film production tools?**
A: Yes, PlotOps provides APIs and webhooks for integration. See the [API documentation](API.md).

**Q: How do I customize the stripboard layout?**
A: The stripboard supports drag-and-drop reordering. Color coding and grouping options are available in the settings.

**Q: What's the maximum file size for uploads?**
A: Default limit is 100MB per file. This can be configured in the environment settings.

### Billing and Subscription

**Q: How is pricing calculated?**
A: Pricing is per organization with unlimited projects and users. See the pricing page for current rates.

**Q: Can I export my data if I cancel?**
A: Yes, you can export all project data in standard formats before canceling your subscription.

**Q: Is there a free trial?**
A: Yes, new organizations get a 30-day free trial with full access to all features.

### Security and Privacy

**Q: How is my data protected?**
A: All data is encrypted in transit and at rest. We use industry-standard security practices and regular security audits.

**Q: Who can see my project data?**
A: Only users in your organization with appropriate permissions can access project data. Data is isolated between organizations.

**Q: Can I control user permissions?**
A: Yes, PlotOps has comprehensive role-based access control. You can assign roles and customize permissions per project.

## 🆘 Getting Additional Help

### Support Channels

1. **Documentation**: Check all documentation files in the `/docs` folder
2. **GitHub Issues**: Create an issue for bugs or feature requests
3. **Community Forum**: Join discussions with other users
4. **Email Support**: Contact support@plotops.com for urgent issues

### Before Contacting Support

Please gather this information:

1. **System Information**:
   ```bash
   # Run diagnostics
   pnpm dev:status
   pnpm dev:validate
   
   # System info
   node --version
   pnpm --version
   docker --version
   ```

2. **Error Details**:
   - Exact error message
   - Steps to reproduce
   - Browser/device information
   - Screenshots if applicable

3. **Log Files**:
   ```bash
   # Collect relevant logs
   pnpm docker:logs > logs.txt
   ```

### Emergency Contacts

For production issues affecting multiple users:

- **Critical Issues**: support@plotops.com (24/7 response)
- **Security Issues**: security@plotops.com
- **Billing Issues**: billing@plotops.com

---

This troubleshooting guide covers the most common issues. For problems not covered here, please check the other documentation files or contact support with detailed information about your issue.