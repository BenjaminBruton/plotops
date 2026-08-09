# Troubleshooting Guide

Common issues and solutions for PlotOps development.

## Database Issues

### Connection Failures

**Problem**: Cannot connect to Supabase database

```bash
# Check .env file
cat .env | grep SUPABASE

# Verify credentials in Supabase dashboard
# Settings > API > Project URL and API keys
```

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` matches your project URL
2. Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check `SUPABASE_SERVICE_ROLE_KEY` for backend operations
4. Confirm your IP is allowed in Supabase dashboard (Database > Settings > Network Restrictions)

### Migration Failures

**Problem**: Migrations fail to apply

```bash
# Check migration logs in Supabase SQL Editor
```

**Solution**:
1. Run migrations one at a time through Supabase SQL Editor
2. Check for syntax errors in SQL
3. Verify schema permissions (use `public` schema)
4. Check for conflicting table/column names

### RLS Policy Errors

**Problem**: Row Level Security blocking queries

**Solution**:
1. Check RLS policies in Supabase dashboard (Authentication > Policies)
2. Verify user authentication status
3. Ensure policies match your user roles
4. Temporarily disable RLS for testing (re-enable for production)

## Build Issues

### Next.js Build Failures

**Problem**: Web app won't build

```bash
# Clear caches
rm -rf .next node_modules
pnpm install
pnpm build:web
```

**Solution**:
1. Check for TypeScript errors: `pnpm type-check`
2. Verify all dependencies installed: `pnpm install`
3. Clear Next.js cache: `rm -rf .next`
4. Check Node.js version: `node --version` (need 18+)

### TypeScript Errors

**Problem**: Type checking fails

```bash
# Run type check
pnpm type-check

# Rebuild packages
pnpm build:packages
```

**Solution**:
1. Ensure shared packages are built: `pnpm build:packages`
2. Check for missing type definitions
3. Verify import paths are correct
4. Clear TypeScript cache: `rm -rf .tsbuildinfo`

### Module Resolution

**Problem**: Cannot find module errors

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Solution**:
1. Check package.json for correct dependencies
2. Verify workspace configuration in pnpm-workspace.yaml
3. Ensure proper exports in package.json
4. Clear node_modules and reinstall

## Development Server Issues

### Port Already in Use

**Problem**: Port 3000 already in use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Solution**:
1. Kill existing process
2. Use different port: `PORT=3001 pnpm web:dev`
3. Check for zombie processes

### Hot Reload Not Working

**Problem**: Changes not reflecting

**Solution**:
1. Restart development server
2. Clear browser cache
3. Check file watchers limit (Linux): `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
4. Verify .next cache is being cleared

## Mobile App Issues

### Expo Issues

**Problem**: Metro bundler errors

```bash
# Clear Expo cache
pnpm mobile:dev --clear
```

**Solution**:
1. Clear Metro cache: `expo start --clear`
2. Reset Expo cache: `expo r -c`
3. Reinstall dependencies in mobile app
4. Check Expo CLI version

### Simulator/Emulator Issues

**Problem**: Can't connect to simulators

```bash
# iOS
open -a Simulator

# Android
emulator -avd <device-name>
```

**Solution**:
1. Ensure Xcode/Android Studio installed
2. Check simulator/emulator is running
3. Verify React Native dependencies
4. Restart Metro bundler

## Performance Issues

### Slow Build Times

**Solution**:
1. Use Turbo cache: Check turbo.json configuration
2. Enable parallel builds in Turborepo
3. Upgrade to latest Node.js LTS
4. Add more RAM if possible

### Memory Issues

**Solution**:
1. Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 pnpm build`
2. Build packages separately
3. Clear caches regularly
4. Close unnecessary applications

## Authentication Issues

### Login Failures

**Problem**: Cannot authenticate users

**Solution**:
1. Check Supabase Auth settings (Authentication > Settings)
2. Verify redirect URLs configured correctly
3. Ensure email templates are set up
4. Check for browser blocking cookies

### Session Expiration

**Problem**: Session keeps expiring

**Solution**:
1. Check JWT expiration settings in Supabase
2. Implement token refresh logic
3. Verify session storage (localStorage/cookies)

## Environment Issues

### Environment Variables Not Loading

**Problem**: .env variables undefined

```bash
# Validate environment
pnpm dev:validate
```

**Solution**:
1. Restart development server after .env changes
2. Check variable names start with `NEXT_PUBLIC_` for client-side
3. Verify .env file exists and has correct values
4. Don't commit .env (use .env.example)

### pnpm Version Issues

**Problem**: pnpm commands failing

```bash
# Check version
pnpm --version

# Update pnpm
npm install -g pnpm@latest
```

**Solution**:
1. Ensure pnpm 8+ installed
2. Update to latest: `npm install -g pnpm`
3. Clear pnpm store: `pnpm store prune`

## Testing Issues

### Tests Failing

**Problem**: Test suite fails

```bash
# Run tests with verbose output
pnpm test --verbose

# Run specific test
pnpm test path/to/test.spec.ts
```

**Solution**:
1. Check test database configuration
2. Ensure test data is seeded properly
3. Verify mock services are working
4. Check for async timing issues

## API Issues

### CORS Errors

**Problem**: CORS blocking API calls

**Solution**:
1. Configure allowed origins in Supabase dashboard
2. Add CORS headers to API routes
3. Use Supabase client properly (handles CORS)
4. Check browser console for specific CORS errors

### Rate Limiting

**Problem**: Too many requests

**Solution**:
1. Implement request debouncing
2. Cache API responses
3. Check Supabase quotas (Project Settings > Usage)
4. Upgrade plan if needed

## Getting Help

If issues persist:

1. **Check documentation** in `/docs` folder
2. **Search existing issues** on GitHub
3. **Enable debug logging** for detailed error info
4. **Create a bug report** with:
   - Error messages
   - Steps to reproduce
   - Environment details (`pnpm --version`, `node --version`)
   - Relevant logs

### Collect System Info

```bash
# Get versions
node --version
pnpm --version

# Get environment status
pnpm dev:status

# Check package versions
pnpm list
```

### Enable Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm web:dev

# Supabase debug
NEXT_PUBLIC_SUPABASE_DEBUG=true pnpm web:dev
```
