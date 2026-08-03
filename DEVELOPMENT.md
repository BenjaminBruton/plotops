# PlotOps Development Guide

Welcome to the PlotOps development environment! This guide will help you set up and work with the complete film production ERP system.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PlotOps
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the development environment**
   ```bash
   pnpm dev:setup
   ```
   
   This command will:
   - Copy environment variables from template
   - Generate secure keys
   - Start Docker services
   - Initialize the database
   - Seed with sample data

4. **Validate the setup**
   ```bash
   pnpm dev:validate
   ```

5. **Start developing**
   ```bash
   # Start the web application
   pnpm web:dev
   
   # Start the mobile application (in another terminal)
   pnpm mobile:dev
   ```

## 🏗️ Architecture Overview

PlotOps is a monorepo built with:

- **Frontend**: Next.js (web) + Expo (mobile)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Automation**: n8n workflows
- **Caching**: Redis
- **Build System**: Turborepo
- **Package Manager**: pnpm

### Project Structure

```
PlotOps/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo mobile application
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI components
│   ├── auth/                # Authentication logic
│   ├── api-client/          # API client
│   ├── business-logic/      # Core business logic
│   ├── shared/              # Shared utilities
│   └── config/              # Shared configuration
├── services/
│   ├── supabase/            # Database schemas and migrations
│   └── n8n-workflows/       # Automation workflows
├── tools/
│   └── dev/                 # Development utilities
└── docker-compose.yml       # Development services
```

## 🐳 Docker Services

The development environment includes the following services:

| Service | Port | Description |
|---------|------|-------------|
| **Supabase Database** | 5432 | PostgreSQL database |
| **Supabase Studio** | 3001 | Database management UI |
| **Supabase API** | 8000 | REST API, Auth, Storage |
| **n8n** | 5678 | Workflow automation |
| **Redis** | 6379 | Caching and sessions |
| **PgAdmin** | 8080 | Database administration |
| **Redis Commander** | 8081 | Redis management |
| **MailHog** | 8025 | Email testing |

### Service Management

```bash
# Start all services
pnpm docker:up

# Stop all services
pnpm docker:down

# View service logs
pnpm docker:logs

# Restart services
pnpm services:restart

# Check service status
pnpm dev:status
```

## 🗄️ Database Management

### Migrations

```bash
# Run database migrations
pnpm db:migrate

# Reset database (⚠️ destructive)
pnpm db:reset

# Backup database
pnpm db:backup

# Restore from backup
pnpm db:restore
```

### Seeding

```bash
# Seed with sample data
pnpm db:seed
```

The sample data includes:
- 2 production companies
- 3 film projects (various stages)
- Characters, scenes, and locations
- Sample casting calls
- Props and equipment

### Schema Overview

The database follows a multi-tenant architecture with these core entities:

- **Organizations**: Production companies
- **Projects**: Individual films/productions
- **Users**: Team members with role-based access
- **Scenes**: Script breakdown with metadata
- **Characters**: Cast requirements and assignments
- **Locations**: Scouting and booking information
- **Props**: Equipment and set pieces
- **Casting**: Auditions and talent management

## 🔧 Development Scripts

### Application Development

```bash
# Start web app in development mode
pnpm web:dev

# Start mobile app
pnpm mobile:dev

# Run mobile app on iOS simulator
pnpm mobile:ios

# Run mobile app on Android emulator
pnpm mobile:android
```

### Code Quality

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check
```

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run e2e tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm build:web
pnpm build:mobile

# Build only packages
pnpm build:packages
```

## 🔐 Environment Variables

Key environment variables for development:

### Database
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: Supabase JWT secret
- `ANON_KEY`: Supabase anonymous key
- `SERVICE_ROLE_KEY`: Supabase service role key

### External APIs
- `GOOGLE_MAPS_API_KEY`: For location features
- `OPENWEATHER_API_KEY`: For weather in call sheets
- `TWILIO_ACCOUNT_SID`: For SMS notifications
- `SENDGRID_API_KEY`: For email notifications

### n8n
- `N8N_ENCRYPTION_KEY`: Workflow encryption
- `N8N_BASIC_AUTH_USER`: Admin username
- `N8N_BASIC_AUTH_PASSWORD`: Admin password

## 🎬 Film Production Features

### Script Breakdown
- Upload and parse screenplay files
- Extract scenes, characters, and props
- Generate breakdown sheets
- Assign complexity ratings

### Casting Management
- Create public casting calls
- Manage auditions and callbacks
- Store actor profiles and reels
- Track casting decisions

### Location Scouting
- Map-based location search
- Photo and contact management
- Permit tracking
- Cost estimation

### Production Scheduling
- Drag-and-drop stripboard
- Scene clustering by location/cast
- Call sheet generation
- Weather integration

### Automation Workflows

The system includes n8n workflows for:

1. **Call Sheet Generation**
   - Pulls scene and cast data
   - Fetches weather information
   - Generates PDF call sheets
   - Emails to cast and crew

2. **Script Parsing** (planned)
   - Extracts data from uploaded scripts
   - Identifies characters and props
   - Creates initial breakdown

3. **Notification System** (planned)
   - SMS reminders for call times
   - Email updates on schedule changes
   - Slack integration for crew communication

## 🔍 Debugging

### Common Issues

**Services won't start**
```bash
# Check Docker status
docker info

# View service logs
pnpm docker:logs

# Reset everything
pnpm dev:reset
```

**Database connection issues**
```bash
# Check database status
pnpm dev:status

# Restart database
docker-compose restart supabase-db

# Check database logs
docker-compose logs supabase-db
```

**Environment validation fails**
```bash
# Run detailed validation
pnpm dev:validate

# Check specific service
curl http://localhost:8000/health
```

### Development Tools

- **Supabase Studio**: http://localhost:3001 - Database management
- **n8n Interface**: http://localhost:5678 - Workflow automation
- **PgAdmin**: http://localhost:8080 - Advanced database tools
- **Redis Commander**: http://localhost:8081 - Cache inspection
- **MailHog**: http://localhost:8025 - Email testing

## 📝 Git Workflow

### Commit Convention

We use conventional commits with the following types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

### Scopes

Use these scopes to categorize changes:

- **Apps**: `web`, `mobile`
- **Packages**: `types`, `ui`, `auth`, `api-client`
- **Features**: `casting`, `locations`, `scenes`, `scheduling`
- **Infrastructure**: `docker`, `database`, `supabase`, `n8n`

### Example Commits

```bash
feat(casting): add audition video upload
fix(web): resolve scene breakdown pagination
docs(api): update authentication endpoints
chore(deps): update dependencies
```

### Pre-commit Hooks

The following checks run automatically on commit:

1. **Lint-staged**: Formats and lints changed files
2. **Type checking**: Ensures TypeScript compilation
3. **Tests**: Runs tests for affected packages
4. **Commit message**: Validates conventional commit format

## 🚀 Deployment

### Web Application

```bash
# Build for production
pnpm build:web

# Deploy (configure your deployment target)
pnpm deploy:web
```

### Mobile Application

```bash
# Build for production
pnpm build:mobile

# Deploy to app stores (configure EAS)
pnpm deploy:mobile
```

## 🆘 Getting Help

### Resources

- **[User Guide](docs/USER_GUIDE.md)**: Complete film production workflows and user guides
- **[API Documentation](docs/API.md)**: Comprehensive API reference and examples
- **[Architecture Documentation](docs/ARCHITECTURE.md)**: System architecture and visual diagrams
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Common issues and solutions
- **[Contributing Guide](CONTRIBUTING.md)**: Development workflow and guidelines
- **[Deployment Guide](DEPLOYMENT.md)**: Production deployment instructions
- **Database Schema**: View in Supabase Studio at http://localhost:3001
- **Workflow Examples**: Check [`services/n8n-workflows/`](services/n8n-workflows/)

### Quick Troubleshooting

1. **Check service status**: `pnpm dev:status`
2. **Validate environment**: `pnpm dev:validate`
3. **View logs**: `pnpm docker:logs`
4. **Reset environment**: `pnpm dev:reset`
5. **Full troubleshooting**: See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

### Support

- **Issues**: Create an issue in the repository for bugs or feature requests
- **Documentation**: Check the comprehensive guides in [`docs/`](docs/)
- **Community**: Join discussions and share tips with other developers
- **Logs**: Review error logs in Docker services for debugging

## 🎯 Next Steps

After setting up your development environment:

1. **Explore the sample data** in Supabase Studio
2. **Try the web application** at http://localhost:3000
3. **Test n8n workflows** at http://localhost:5678
4. **Review the codebase** structure and patterns
5. **Start building features** using the established patterns

Happy coding! 🎬✨