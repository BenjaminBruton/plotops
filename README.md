# PlotOps - Film Production ERP

> A "Cradle-to-Grave" Film Production ERP that ingests a screenplay and orchestrates the entire lifecycle of a film project.

[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🎬 Project Vision

PlotOps is a comprehensive film production ERP system designed to manage the complete lifecycle of film projects from script to screen. Built as a multi-tenant, role-based workspace where AI assists with data entry and logistics, but humans retain full creative and operational control.

### Key Principles

- **Role-Based Access Control (RBAC)**: Users are assigned specific roles (Producer, AD, Casting Director, Scout, Editor, Publicist) with unique dashboard views and permissions
- **AI-Assisted, Human-Validated**: The system suggests and automates workflows, but every AI output is editable or deletable by users
- **Real-Time Collaboration**: Built on Supabase for instant updates across all stakeholders
- **Automation-First**: Leverages n8n for heavy lifting like PDF generation, script parsing, and notifications

## 🏗️ Architecture Overview

PlotOps is built as a modern monorepo with shared packages supporting both web and mobile applications:

```
PlotOps/
├── apps/
│   ├── web/                    # Next.js web application (desktop workflows)
│   └── mobile/                 # Expo mobile app (on-set management)
├── packages/
│   ├── types/                  # Shared TypeScript definitions
│   ├── ui/                     # Design system & components
│   ├── business-logic/         # Core film production logic
│   ├── api-client/            # Supabase integration
│   ├── auth/                  # Authentication & RBAC
│   ├── shared/                # Utilities & helpers
│   └── config/                # Configuration management
├── services/
│   ├── supabase/              # Database schemas & migrations
│   └── n8n-workflows/         # Automation workflows
└── tools/
    └── dev/                   # Development utilities
```

### Technology Stack

- **Frontend**: Next.js 14 (web) + Expo (mobile)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Automation**: n8n workflows
- **Styling**: Tailwind CSS + Shadcn UI
- **Build System**: Turborepo + pnpm workspaces
- **Maps**: Google Maps JavaScript API
- **Caching**: Redis

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Installation

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

### Access Points

Once running, you can access:

- **Web Application**: http://localhost:3000
- **Supabase Studio**: http://localhost:3001 (Database management)
- **n8n Workflows**: http://localhost:5678 (Automation)
- **PgAdmin**: http://localhost:8080 (Database admin)
- **Redis Commander**: http://localhost:8081 (Cache management)
- **MailHog**: http://localhost:8025 (Email testing)

## 🎭 Film Production Features

### Script Ingestion & Breakdown
- **Upload & Parse**: Support for PDF and .fdx screenplay files
- **Intelligent Extraction**: AI-powered extraction of scenes, characters, and props
- **Breakdown Tables**: Editable breakdown sheets with complexity ratings (1-5 scale)
- **Budget Tagging**: Preliminary budget allocation for scenes and elements

### Casting & Public Job Board
- **Public Casting Calls**: `/casting` route for public audition submissions
- **Kanban Management**: Internal casting workflow with drag-and-drop interface
- **Actor Profiles**: Headshots, demo reels, and comprehensive actor information
- **Audition Tracking**: Callback management and casting decisions

### Location Scouting & Management
- **Interactive Maps**: Google Maps integration for location discovery
- **Site Documentation**: Photo uploads, contact management, and logistics notes
- **Permit Tracking**: Permit requirements and approval status
- **Cost Management**: Location fees and availability tracking

### Production Scheduling (The Stripboard)
- **Drag-and-Drop Timeline**: Visual scene scheduling with clustering suggestions
- **Smart Clustering**: AI-suggested scene groupings based on location and cast availability
- **Call Sheet Generation**: One-click PDF generation with weather, maps, and contact info
- **Real-Time Updates**: Instant notifications for schedule changes

### On-Set Production Monitoring
- **Mobile-First Wrap Tracker**: Real-time scene completion tracking
- **Progress Monitoring**: Compare scheduled vs. actual wrap times
- **Alert System**: Push notifications and emails for delays or issues
- **Script Supervisor Tools**: Mobile-responsive checklists and notes

### Asset & Post-Production Management
- **Digital Asset Management**: Raw footage metadata and organization
- **Collaborative Tagging**: Editor/Director tagging system (#VFX-Needed, #Foley, #ADR)
- **Reshoot Workflow**: "Flag for Reshoot" creates tasks in the stripboard
- **Version Control**: Asset versioning and approval workflows

## 👥 User Roles & Permissions

### Producer
- **Dashboard**: Project overview, budget tracking, high-level scheduling
- **Permissions**: Full project access, team management, budget approval
- **Key Features**: Script breakdown approval, casting decisions, location approval

### Assistant Director (AD)
- **Dashboard**: Stripboard management, call sheet generation, crew coordination
- **Permissions**: Schedule management, crew assignments, location logistics
- **Key Features**: Scene clustering, call sheet automation, wrap tracking

### Casting Director
- **Dashboard**: Casting calls, audition management, actor database
- **Permissions**: Casting workflow, actor profiles, audition scheduling
- **Key Features**: Public job board, callback management, casting decisions

### Location Scout
- **Dashboard**: Location database, scouting reports, permit tracking
- **Permissions**: Location management, site photos, contact information
- **Key Features**: Map integration, logistics planning, cost estimation

### Editor
- **Dashboard**: Asset management, post-production workflow, version control
- **Permissions**: Asset tagging, editing workflow, reshoot requests
- **Key Features**: Collaborative tagging, version tracking, feedback loops

### Publicist
- **Dashboard**: Marketing materials, press management, social media
- **Permissions**: Marketing assets, press releases, social media content
- **Key Features**: Asset distribution, press kit management, social integration

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all applications
pnpm web:dev               # Start web application only
pnpm mobile:dev            # Start mobile application only
pnpm mobile:ios            # Run on iOS simulator
pnpm mobile:android        # Run on Android emulator

# Docker Services
pnpm docker:up             # Start all services
pnpm docker:down           # Stop all services
pnpm docker:logs           # View service logs
pnpm services:restart      # Restart services

# Database Management
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed with sample data
pnpm db:backup             # Backup database
pnpm db:reset              # Reset database (destructive)

# Code Quality
pnpm lint                  # Run linting
pnpm lint:fix              # Fix linting issues
pnpm format                # Format code with Prettier
pnpm type-check            # TypeScript type checking

# Testing
pnpm test                  # Run all tests
pnpm test:unit             # Unit tests only
pnpm test:integration      # Integration tests only
pnpm test:e2e              # End-to-end tests
pnpm test:coverage         # Generate coverage report

# Building
pnpm build                 # Build all applications
pnpm build:web             # Build web application
pnpm build:mobile          # Build mobile application
pnpm build:packages        # Build shared packages only
```

### Docker Services

The development environment includes these services:

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

## 📦 Shared Packages

### [`@plotops/types`](packages/types/) - TypeScript Definitions
Core type definitions for users, projects, scenes, characters, locations, and all film production entities.

### [`@plotops/business-logic`](packages/business-logic/) - Core Business Rules
Script parsing, scene clustering, budget calculations, schedule optimization, and production progress tracking.

### [`@plotops/api-client`](packages/api-client/) - Supabase Integration
Database operations, real-time subscriptions, file uploads, and query builders for all entities.

### [`@plotops/auth`](packages/auth/) - Authentication & RBAC
Role-based access control, permission management, multi-tenant support, and session handling.

### [`@plotops/ui`](packages/ui/) - Design System
Shared component library, Tailwind configuration, design tokens, and accessibility helpers.

### [`@plotops/shared`](packages/shared/) - Utilities
Date formatting, validation functions, business logic helpers, and cross-platform utilities.

### [`@plotops/config`](packages/config/) - Configuration
Environment configuration, feature flags, service settings, and role-based permissions.

## 🔄 Automation Workflows

PlotOps includes pre-built n8n workflows for common film production tasks:

### Call Sheet Generation
- Pulls scene and cast data from database
- Fetches weather information for outdoor scenes
- Generates branded PDF call sheets
- Emails to cast and crew automatically

### Script Parsing (Planned)
- Extracts data from uploaded screenplay files
- Identifies characters, props, and locations
- Creates initial breakdown tables
- Suggests scene complexity ratings

### Notification System (Planned)
- SMS reminders for call times
- Email updates on schedule changes
- Slack integration for crew communication
- Push notifications for mobile users

## 🗄️ Database Schema

The database follows a multi-tenant architecture with these core entities:

- **Organizations**: Production companies with isolated data
- **Projects**: Individual films/productions
- **Users**: Team members with role-based access
- **Scenes**: Script breakdown with metadata and complexity ratings
- **Characters**: Cast requirements and assignments
- **Locations**: Scouting information and booking status
- **Props**: Equipment and set pieces
- **Casting**: Auditions and talent management
- **Assets**: Digital asset management for post-production

View the complete schema in [`services/supabase/migrations/`](services/supabase/migrations/).

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - Detailed setup and development instructions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment and configuration
- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and guidelines
- **[Architecture Documentation](plans/plotops-monorepo-architecture.md)** - Technical architecture details
- **[Package Documentation](packages/README.md)** - Shared packages overview
- **[API Documentation](docs/api/)** - API reference and examples

## 🚀 Deployment

### Web Application
The web application is optimized for deployment on Vercel or Netlify with:
- Edge functions for API routes
- Automatic deployments from Git
- Preview environments for pull requests
- Environment variable management

### Mobile Application
The mobile application uses Expo Application Services (EAS) for:
- Over-the-air updates
- Native builds for iOS and Android
- App store deployment automation
- Device testing and distribution

### Infrastructure
- **Database**: Supabase hosted PostgreSQL
- **Automation**: n8n Cloud or self-hosted
- **Caching**: Redis Cloud or self-hosted
- **Storage**: Supabase Storage for files and assets

## 🔒 Security

PlotOps implements enterprise-grade security:

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) in PostgreSQL
- **Multi-Tenancy**: Organization-level data isolation
- **API Security**: Protected routes with middleware
- **File Security**: Upload validation and scanning
- **Audit Logging**: Comprehensive activity tracking

## 🆘 Support & Troubleshooting

### Common Issues

**Services won't start**
```bash
pnpm dev:status          # Check service status
pnpm docker:logs         # View service logs
pnpm dev:reset           # Reset everything
```

**Database connection issues**
```bash
pnpm db:migrate          # Run migrations
pnpm services:restart    # Restart services
```

**Environment validation fails**
```bash
pnpm dev:validate        # Run detailed validation
pnpm env:generate-keys   # Generate missing keys
```

### Getting Help

1. **Check the documentation** in the `/docs` folder
2. **Review error logs** with `pnpm docker:logs`
3. **Validate your environment** with `pnpm dev:validate`
4. **Reset your environment** with `pnpm dev:reset`
5. **Create an issue** in the repository with error details

## 🎯 Roadmap

### Phase 1: Core Foundation ✅
- [x] Monorepo architecture
- [x] Database schema and migrations
- [x] Authentication and RBAC
- [x] Basic web and mobile applications
- [x] Docker development environment

### Phase 2: Script & Breakdown Features
- [ ] PDF/FDX script parsing
- [ ] AI-powered scene extraction
- [ ] Interactive breakdown tables
- [ ] Budget estimation tools

### Phase 3: Casting & Location Management
- [ ] Public casting board
- [ ] Audition management system
- [ ] Location scouting tools
- [ ] Google Maps integration

### Phase 4: Production Scheduling
- [ ] Interactive stripboard
- [ ] Scene clustering algorithms
- [ ] Call sheet automation
- [ ] Real-time schedule updates

### Phase 5: On-Set & Post-Production
- [ ] Mobile wrap tracking
- [ ] Asset management system
- [ ] Collaborative tagging
- [ ] Reshoot workflow integration

## 📄 License

This project is private and proprietary. All rights reserved.

---

**PlotOps** - Orchestrating film production from script to screen 🎬✨