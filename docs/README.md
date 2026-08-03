# PlotOps Documentation

Welcome to the comprehensive documentation for PlotOps, the film production ERP system. This documentation covers everything from getting started to advanced deployment and troubleshooting.

## 📚 Documentation Overview

### Getting Started
- **[Main README](../README.md)** - Project overview, quick start, and key features
- **[Development Guide](../DEVELOPMENT.md)** - Complete development environment setup
- **[User Guide](USER_GUIDE.md)** - Comprehensive user workflows and features

### Development & Contributing
- **[Contributing Guide](../CONTRIBUTING.md)** - Development workflow, coding standards, and guidelines
- **[Architecture Documentation](ARCHITECTURE.md)** - System architecture, diagrams, and technical details
- **[API Documentation](API.md)** - Complete API reference with examples

### Deployment & Operations
- **[Deployment Guide](../DEPLOYMENT.md)** - Production deployment and infrastructure setup
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues, solutions, and FAQ

### Package Documentation
- **[Shared Packages](../packages/README.md)** - Overview of all shared packages and their usage

## 🎬 Film Production Features

### Core Workflows
1. **[Script Ingestion & Breakdown](USER_GUIDE.md#1-script-ingestion-and-breakdown)**
   - Upload and parse screenplay files
   - AI-powered scene extraction
   - Interactive breakdown tables

2. **[Casting Management](USER_GUIDE.md#2-casting-management)**
   - Public casting board
   - Audition scheduling and tracking
   - Actor database management

3. **[Location Scouting](USER_GUIDE.md#3-location-scouting-and-management)**
   - Interactive map-based search
   - Location documentation and permits
   - Cost and logistics management

4. **[Production Scheduling](USER_GUIDE.md#4-production-scheduling-the-stripboard)**
   - Visual stripboard interface
   - Scene clustering and optimization
   - Automated call sheet generation

5. **[On-Set Monitoring](USER_GUIDE.md#5-on-set-production-monitoring)**
   - Real-time progress tracking
   - Mobile wrap tracker
   - Production alerts and notifications

6. **[Asset Management](USER_GUIDE.md#6-asset-and-post-production-management)**
   - Digital asset organization
   - Collaborative tagging system
   - Reshoot workflow integration

## 👥 User Role Documentation

### Role-Specific Guides
- **[Producer Dashboard](USER_GUIDE.md#producer-dashboard)** - Project oversight and budget management
- **[Assistant Director Dashboard](USER_GUIDE.md#assistant-director-ad-dashboard)** - Daily operations and scheduling
- **[Casting Director Dashboard](USER_GUIDE.md#casting-director-dashboard)** - Audition and talent management
- **[Location Scout Dashboard](USER_GUIDE.md#location-scout-dashboard)** - Location discovery and logistics
- **[Editor Dashboard](USER_GUIDE.md#editor-dashboard)** - Post-production asset management
- **[Publicist Dashboard](USER_GUIDE.md#publicist-dashboard)** - Marketing and publicity coordination

## 🏗️ Technical Architecture

### System Components
- **[High-Level Architecture](ARCHITECTURE.md#system-architecture-overview)** - Complete system overview
- **[Monorepo Structure](ARCHITECTURE.md#monorepo-structure)** - Package organization and dependencies
- **[Database Schema](ARCHITECTURE.md#database-architecture)** - Entity relationships and data flow
- **[Security Architecture](ARCHITECTURE.md#security-architecture)** - Authentication, authorization, and data protection

### Integration Points
- **[Real-time Features](ARCHITECTURE.md#real-time-subscriptions)** - WebSocket subscriptions and live updates
- **[Automation Workflows](ARCHITECTURE.md#automation-workflows-n8n)** - n8n workflow integration
- **[External APIs](API.md#external-api-issues)** - Google Maps, weather, and notification services

## 🔧 Development Resources

### Setup and Configuration
- **[Prerequisites](../DEVELOPMENT.md#prerequisites)** - Required tools and versions
- **[Environment Setup](../DEVELOPMENT.md#initial-setup)** - Step-by-step installation guide
- **[Docker Services](../DEVELOPMENT.md#docker-services)** - Development service configuration

### Code Quality and Standards
- **[Coding Standards](../CONTRIBUTING.md#coding-standards)** - TypeScript, React, and database guidelines
- **[Testing Guidelines](../CONTRIBUTING.md#testing-guidelines)** - Unit, integration, and E2E testing
- **[Git Workflow](../CONTRIBUTING.md#pull-request-guidelines)** - Commit conventions and PR process

### Package Development
- **[Types Package](../packages/types/)** - Shared TypeScript definitions
- **[Business Logic Package](../packages/business-logic/)** - Core film production logic
- **[API Client Package](../packages/api-client/)** - Supabase integration layer
- **[UI Package](../packages/ui/)** - Shared component library
- **[Auth Package](../packages/auth/)** - Authentication and RBAC
- **[Shared Package](../packages/shared/)** - Common utilities
- **[Config Package](../packages/config/)** - Configuration management

## 🚀 Deployment and Operations

### Production Deployment
- **[Quick Deployment](../DEPLOYMENT.md#quick-deployment)** - Fast production setup
- **[Infrastructure Setup](../DEPLOYMENT.md#infrastructure-setup)** - Detailed service configuration
- **[Security Configuration](../DEPLOYMENT.md#security-configuration)** - Production security setup
- **[Monitoring Setup](../DEPLOYMENT.md#monitoring--analytics)** - Performance and error tracking

### CI/CD and Automation
- **[GitHub Actions](../DEPLOYMENT.md#cicd-pipeline)** - Automated testing and deployment
- **[Database Migrations](../DEPLOYMENT.md#database-migrations)** - Schema change management
- **[Multi-Environment Setup](../DEPLOYMENT.md#multi-environment-setup)** - Development, staging, production

## 🆘 Support and Troubleshooting

### Common Issues
- **[Installation Problems](TROUBLESHOOTING.md#installation-and-setup-issues)** - Setup and dependency issues
- **[Database Issues](TROUBLESHOOTING.md#database-issues)** - Connection and migration problems
- **[Performance Issues](TROUBLESHOOTING.md#performance-issues)** - Optimization and scaling
- **[Security Issues](TROUBLESHOOTING.md#security-and-permissions)** - Authentication and permissions

### Debugging Tools
- **[Logging and Monitoring](TROUBLESHOOTING.md#logging-and-monitoring)** - Debug techniques and tools
- **[Development Tools](TROUBLESHOOTING.md#development-tools)** - Browser tools and database clients
- **[API Testing](TROUBLESHOOTING.md#api-testing)** - Testing endpoints and integrations

### FAQ and Support
- **[Frequently Asked Questions](TROUBLESHOOTING.md#frequently-asked-questions)** - Common questions and answers
- **[Getting Help](TROUBLESHOOTING.md#getting-additional-help)** - Support channels and resources

## 📱 Mobile Application

### Mobile-Specific Features
- **[Installation and Setup](USER_GUIDE.md#installation-and-setup)** - Mobile app installation
- **[On-Set Features](USER_GUIDE.md#on-set-features)** - Field production tools
- **[Offline Capabilities](USER_GUIDE.md#offline-capabilities)** - Working without internet

### Mobile Development
- **[React Native Architecture](ARCHITECTURE.md#mobile-architecture)** - Mobile app structure
- **[Expo Configuration](../DEPLOYMENT.md#mobile-application-deployment-expo-eas)** - Build and deployment setup
- **[Mobile Troubleshooting](TROUBLESHOOTING.md#mobile-application-issues)** - Common mobile issues

## 🔗 External Resources

### Film Production Resources
- **Industry Standards**: Standard screenplay formatting and production practices
- **Film Terminology**: Glossary of film production terms and concepts
- **Best Practices**: Recommended workflows for different production scales

### Technical Resources
- **[Supabase Documentation](https://supabase.com/docs)** - Database and authentication
- **[Next.js Documentation](https://nextjs.org/docs)** - Web application framework
- **[Expo Documentation](https://docs.expo.dev/)** - Mobile application platform
- **[n8n Documentation](https://docs.n8n.io/)** - Workflow automation

## 📝 Contributing to Documentation

### Documentation Standards
- Use clear, concise language accessible to both technical and non-technical users
- Include code examples and screenshots where helpful
- Follow consistent formatting and linking conventions
- Keep documentation up-to-date with code changes

### Updating Documentation
1. **Edit existing files** for corrections or improvements
2. **Create new files** for new features or workflows
3. **Update links** when files are moved or renamed
4. **Test all links** to ensure they work correctly
5. **Follow markdown conventions** for consistent formatting

### Documentation Structure
```
docs/
├── README.md              # This file - documentation index
├── USER_GUIDE.md          # Complete user workflows and features
├── ARCHITECTURE.md        # Technical architecture and diagrams
├── API.md                 # API documentation and examples
└── TROUBLESHOOTING.md     # Common issues and solutions

Root level:
├── README.md              # Project overview and quick start
├── DEVELOPMENT.md         # Development environment setup
├── DEPLOYMENT.md          # Production deployment guide
└── CONTRIBUTING.md        # Development workflow and guidelines
```

---

**Need help?** Check the [troubleshooting guide](TROUBLESHOOTING.md) or create an issue in the repository.

**Want to contribute?** See the [contributing guide](../CONTRIBUTING.md) for development workflow and guidelines.

**Ready to deploy?** Follow the [deployment guide](../DEPLOYMENT.md) for production setup instructions.