# PlotOps Development Guide

Complete guide for setting up and developing PlotOps locally.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd PlotOps
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Database Setup

Apply migrations through your Supabase dashboard SQL Editor or use:

```bash
pnpm db:migrate
```

### 4. Start Development

```bash
# Start web application
pnpm web:dev

# Start mobile application (in another terminal)
pnpm mobile:dev
```

## Project Structure

```
PlotOps/
├── apps/
│   ├── web/                 # Next.js web app
│   └── mobile/              # Expo mobile app
├── packages/
│   ├── types/               # TypeScript definitions
│   ├── ui/                  # Component library
│   ├── business-logic/      # Core logic
│   ├── api-client/         # Supabase client
│   ├── auth/               # Authentication
│   ├── shared/             # Utilities
│   └── config/             # Configuration
├── services/
│   ├── supabase/           # Database migrations
└── tools/
    └── dev/                # Development utilities
```

## Available Scripts

### Development
```bash
pnpm dev                    # Start all applications
pnpm web:dev               # Start web only
pnpm mobile:dev            # Start mobile only
pnpm mobile:ios            # Run on iOS simulator
pnpm mobile:android        # Run on Android emulator
```

### Database
```bash
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed with sample data
pnpm db:backup             # Backup database
pnpm db:reset              # Reset database (destructive)
```

### Code Quality
```bash
pnpm lint                  # Run linting
pnpm lint:fix              # Fix linting issues
pnpm format                # Format code
pnpm type-check            # TypeScript checking
```

### Testing
```bash
pnpm test                  # All tests
pnpm test:unit             # Unit tests
pnpm test:integration      # Integration tests
pnpm test:e2e              # End-to-end tests
pnpm test:coverage         # Coverage report
```

### Building
```bash
pnpm build                 # Build all
pnpm build:web             # Build web app
pnpm build:mobile          # Build mobile app
pnpm build:packages        # Build packages only
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ... develop your feature ...

# Test changes
pnpm test
pnpm lint
pnpm type-check

# Commit
git add .
git commit -m "feat(scope): description"

# Push
git push origin feature/your-feature
```

### 2. Database Changes

Create migration files in `services/supabase/migrations/`:

```sql
-- services/supabase/migrations/YYYYMMDDHHMMSS_description.sql
BEGIN;

-- Your changes here
ALTER TABLE public.scenes ADD COLUMN new_field TEXT;

COMMIT;
```

Apply via Supabase dashboard SQL Editor.

### 3. Adding Packages

```bash
# Add to web app
pnpm --filter web add package-name

# Add to mobile app
pnpm --filter mobile add package-name

# Add to workspace root
pnpm add -D package-name -w
```

## Troubleshooting

### Database Connection Issues

```bash
# Verify .env file has correct credentials
cat .env | grep SUPABASE

# Check Supabase dashboard for database status
```

### Build Issues

```bash
# Clear caches and rebuild
rm -rf node_modules .next
pnpm install
pnpm build
```

### Type Errors

```bash
# Run type checking
pnpm type-check

# Fix common issues
pnpm build:packages  # Rebuild shared packages
```

## Best Practices

### Code Style
- Use TypeScript for all code
- Follow ESLint and Prettier configuration
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Testing
- Write unit tests for business logic
- Integration tests for API calls
- E2E tests for critical user flows

### Git Workflow
- Keep commits atomic and focused
- Use conventional commit format
- Rebase before merging
- Keep branches up to date with main

## Additional Resources

- [Architecture Documentation](plans/plotops-monorepo-architecture.md)
- [Contributing Guide](CONTRIBUTING.md)
- [API Documentation](docs/api/)
- [Package Documentation](packages/README.md)
