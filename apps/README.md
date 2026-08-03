# Applications

This directory contains the platform-specific applications for PlotOps.

## Web Application (`web/`)

Next.js 14 application optimized for desktop workflows:

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Key Features**:
  - Complex data visualization (Stripboard, Gantt charts)
  - File upload and processing
  - Advanced reporting and analytics
  - Multi-window workflows
  - Keyboard shortcuts and power-user features

### Development

```bash
cd apps/web
pnpm dev
```

## Mobile Application (`mobile/`)

React Native/Expo application for on-the-go production management:

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand + TanStack Query
- **Key Features**:
  - Real-time production monitoring
  - Location-based features
  - Push notifications
  - Offline capability
  - Camera integration for asset management

### Development

```bash
cd apps/mobile
pnpm start
```

### Platform-Specific Commands

```bash
# iOS Simulator
pnpm ios

# Android Emulator
pnpm android

# Web Browser
pnpm web
```

## Shared Dependencies

Both applications share:
- Business logic packages
- Type definitions
- UI components (platform-adaptive)
- API client
- Authentication logic