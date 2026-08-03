# PlotOps Monorepo Configuration Examples

## Workspace Configuration

### Root `package.json`
```json
{
  "name": "plotops-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean",
    "web:dev": "pnpm --filter web dev",
    "mobile:dev": "pnpm --filter mobile dev",
    "mobile:ios": "pnpm --filter mobile ios",
    "mobile:android": "pnpm --filter mobile android"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.6.0"
}
```

### Turborepo Configuration (`turbo.json`)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@plotops/types": ["./packages/types/src"],
      "@plotops/ui": ["./packages/ui/src"],
      "@plotops/business-logic": ["./packages/business-logic/src"],
      "@plotops/api-client": ["./packages/api-client/src"],
      "@plotops/auth": ["./packages/auth/src"],
      "@plotops/shared": ["./packages/shared/src"],
      "@plotops/config": ["./packages/config/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Application Configurations

### Web App (`apps/web/package.json`)
```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@plotops/types": "workspace:*",
    "@plotops/ui": "workspace:*",
    "@plotops/business-logic": "workspace:*",
    "@plotops/api-client": "workspace:*",
    "@plotops/auth": "workspace:*",
    "@plotops/shared": "workspace:*",
    "@plotops/config": "workspace:*",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "framer-motion": "^10.16.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.0.0"
  }
}
```

### Mobile App (`apps/mobile/package.json`)
```json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android"
  },
  "dependencies": {
    "@plotops/types": "workspace:*",
    "@plotops/ui": "workspace:*",
    "@plotops/business-logic": "workspace:*",
    "@plotops/api-client": "workspace:*",
    "@plotops/auth": "workspace:*",
    "@plotops/shared": "workspace:*",
    "@plotops/config": "workspace:*",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "expo": "~49.0.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "react-native-web": "~0.19.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "expo-router": "^2.0.0",
    "zustand": "^4.4.0",
    "expo-notifications": "~0.20.0",
    "expo-location": "~16.1.0",
    "expo-camera": "~13.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "typescript": "^5.0.0"
  }
}
```

## Shared Package Configurations

### Types Package (`packages/types/package.json`)
```json
{
  "name": "@plotops/types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### UI Package (`packages/ui/package.json`)
```json
{
  "name": "@plotops/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@plotops/types": "workspace:*",
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "tailwindcss": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@storybook/react": "^7.5.0",
    "@storybook/react-vite": "^7.5.0",
    "@types/react": "^18.2.0",
    "tsup": "^7.2.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

### Business Logic Package (`packages/business-logic/package.json`)
```json
{
  "name": "@plotops/business-logic",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@plotops/types": "workspace:*",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "tsup": "^7.2.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

## Build Tool Configurations

### TSUp Configuration (`packages/*/tsup.config.ts`)
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-native', '@plotops/*'],
});
```

### ESLint Configuration (`.eslintrc.js`)
```javascript
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['apps/web/**/*'],
      extends: ['next/core-web-vitals'],
    },
    {
      files: ['apps/mobile/**/*'],
      extends: ['@react-native-community'],
    },
  ],
};
```

### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Development Environment

### Docker Compose (`docker-compose.dev.yml`)
```yaml
version: '3.8'
services:
  supabase:
    image: supabase/supabase:latest
    ports:
      - "54321:54321"
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - supabase_data:/var/lib/postgresql/data

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  supabase_data:
  n8n_data:
```

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

### Git Hooks (`.husky/pre-commit`)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

### Lint Staged Configuration (`lint-staged.config.js`)
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
```

## Environment Configuration

### Environment Variables Template (`.env.example`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Weather API
WEATHER_API_KEY=your_weather_api_key

# File Storage
NEXT_PUBLIC_STORAGE_BUCKET=plotops-assets

# App Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

This configuration provides a complete foundation for the PlotOps monorepo with proper tooling, build processes, and development environment setup.