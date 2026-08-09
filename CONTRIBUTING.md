# Contributing to PlotOps

Thank you for your interest in contributing to PlotOps! This guide will help you understand our development workflow, coding standards, and how to contribute effectively to the film production ERP system.

## 🎯 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18+ installed
- **pnpm** 8+ installed
- **Git** configured with your name and email
- A **GitHub account** with SSH keys set up
- **Supabase Account** for database access

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   git clone git@github.com:YOUR_USERNAME/PlotOps.git
   cd PlotOps
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   pnpm install
   
   # Set up development environment
   pnpm dev:setup
   
   # Validate setup
   pnpm dev:validate
   ```

3. **Start Development**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individual applications
   pnpm web:dev      # Web application
   pnpm mobile:dev   # Mobile application
   ```

## 🌟 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Fixes**: Fix issues in existing functionality
- **✨ New Features**: Add new film production features
- **📚 Documentation**: Improve or add documentation
- **🎨 UI/UX**: Enhance user interface and experience
- **⚡ Performance**: Optimize application performance
- **🧪 Testing**: Add or improve test coverage
- **🔧 Tooling**: Improve development tools and workflows

### Contribution Workflow

1. **Check Existing Issues**
   - Browse [open issues](https://github.com/your-org/PlotOps/issues)
   - Look for issues labeled `good first issue` or `help wanted`
   - Comment on issues you'd like to work on

2. **Create an Issue** (for new features/bugs)
   - Use appropriate issue templates
   - Provide detailed descriptions and context
   - Include screenshots or mockups for UI changes

3. **Create a Branch**
   ```bash
   # Create and switch to a new branch
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

4. **Make Changes**
   - Follow our [coding standards](#coding-standards)
   - Write tests for new functionality
   - Update documentation as needed

5. **Test Your Changes**
   ```bash
   # Run all tests
   pnpm test
   
   # Run linting
   pnpm lint
   
   # Type checking
   pnpm type-check
   
   # Test specific areas
   pnpm test:unit
   pnpm test:integration
   ```

6. **Commit Your Changes**
   ```bash
   # Stage changes
   git add .
   
   # Commit with conventional commit format
   git commit -m "feat(casting): add audition video upload"
   ```

7. **Push and Create Pull Request**
   ```bash
   # Push to your fork
   git push origin feature/your-feature-name
   
   # Create pull request on GitHub
   ```

## 📝 Coding Standards

### TypeScript Guidelines

1. **Strict Type Safety**
   ```typescript
   // ✅ Good: Explicit types
   interface User {
     id: string;
     email: string;
     role: UserRole;
   }
   
   const createUser = (userData: Omit<User, 'id'>): User => {
     return {
       id: generateId(),
       ...userData
     };
   };
   
   // ❌ Avoid: Any types
   const processData = (data: any) => {
     // Avoid using 'any'
   };
   ```

2. **Naming Conventions**
   ```typescript
   // ✅ Good: Descriptive names
   const isUserAuthorized = (user: User, permission: Permission): boolean => {
     return user.permissions.includes(permission);
   };
   
   // Component names: PascalCase
   const SceneBreakdownTable = () => { /* ... */ };
   
   // Constants: SCREAMING_SNAKE_CASE
   const MAX_SCENES_PER_DAY = 6;
   
   // Variables/functions: camelCase
   const calculateSceneComplexity = (scene: Scene): number => { /* ... */ };
   ```

3. **Error Handling**
   ```typescript
   // ✅ Good: Proper error handling
   const parseScript = async (file: File): Promise<ParseResult> => {
     try {
       const content = await file.text();
       return await scriptParser.parse(content);
     } catch (error) {
       logger.error('Script parsing failed', { error, fileName: file.name });
       throw new ScriptParsingError('Failed to parse script', { cause: error });
     }
   };
   ```

### React/Next.js Guidelines

1. **Component Structure**
   ```typescript
   // ✅ Good: Well-structured component
   interface SceneCardProps {
     scene: Scene;
     onEdit: (scene: Scene) => void;
     onDelete: (sceneId: string) => void;
     className?: string;
   }
   
   export const SceneCard: React.FC<SceneCardProps> = ({
     scene,
     onEdit,
     onDelete,
     className
   }) => {
     const [isEditing, setIsEditing] = useState(false);
     
     const handleEdit = useCallback(() => {
       setIsEditing(true);
     }, []);
     
     return (
       <div className={cn('scene-card', className)}>
         {/* Component content */}
       </div>
     );
   };
   ```

2. **Hooks Usage**
   ```typescript
   // ✅ Good: Custom hooks for business logic
   const useSceneManagement = (projectId: string) => {
     const [scenes, setScenes] = useState<Scene[]>([]);
     const [loading, setLoading] = useState(true);
     
     const createScene = useCallback(async (sceneData: CreateSceneData) => {
       const newScene = await apiClient.createScene(sceneData);
       setScenes(prev => [...prev, newScene]);
       return newScene;
     }, []);
     
     return { scenes, loading, createScene };
   };
   ```

3. **State Management**
   ```typescript
   // ✅ Good: Zustand store structure
   interface ProjectStore {
     currentProject: Project | null;
     scenes: Scene[];
     loading: boolean;
     
     // Actions
     setCurrentProject: (project: Project) => void;
     addScene: (scene: Scene) => void;
     updateScene: (sceneId: string, updates: Partial<Scene>) => void;
   }
   
   export const useProjectStore = create<ProjectStore>((set, get) => ({
     currentProject: null,
     scenes: [],
     loading: false,
     
     setCurrentProject: (project) => set({ currentProject: project }),
     addScene: (scene) => set(state => ({ 
       scenes: [...state.scenes, scene] 
     })),
     updateScene: (sceneId, updates) => set(state => ({
       scenes: state.scenes.map(scene => 
         scene.id === sceneId ? { ...scene, ...updates } : scene
       )
     }))
   }));
   ```

### CSS/Styling Guidelines

1. **Tailwind CSS Usage**
   ```typescript
   // ✅ Good: Semantic class combinations
   const SceneCard = ({ scene, isSelected }) => (
     <div className={cn(
       // Base styles
       'rounded-lg border bg-card p-4 shadow-sm transition-colors',
       // Interactive states
       'hover:bg-accent hover:text-accent-foreground',
       // Conditional styles
       isSelected && 'ring-2 ring-primary',
       scene.isCompleted && 'opacity-75'
     )}>
       {/* Content */}
     </div>
   );
   ```

2. **Component Variants**
   ```typescript
   // ✅ Good: Using class-variance-authority
   const buttonVariants = cva(
     'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
     {
       variants: {
         variant: {
           default: 'bg-primary text-primary-foreground hover:bg-primary/90',
           destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
           outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
         },
         size: {
           default: 'h-10 px-4 py-2',
           sm: 'h-9 rounded-md px-3',
           lg: 'h-11 rounded-md px-8'
         }
       }
     }
   );
   ```

### Database Guidelines

1. **Migration Structure**
   ```sql
   -- ✅ Good: Clear migration with rollback
   BEGIN;
   
   -- Add new column
   ALTER TABLE plotops.scenes 
   ADD COLUMN estimated_duration INTEGER;
   
   -- Add constraint
   ALTER TABLE plotops.scenes 
   ADD CONSTRAINT check_duration_positive 
   CHECK (estimated_duration > 0);
   
   -- Create index
   CREATE INDEX idx_scenes_duration 
   ON plotops.scenes(estimated_duration);
   
   COMMIT;
   ```

2. **Query Optimization**
   ```typescript
   // ✅ Good: Efficient queries with proper joins
   const getProjectScenes = async (projectId: string) => {
     const { data, error } = await supabase
       .from('scenes')
       .select(`
         *,
         scene_characters (
           character:characters (*)
         ),
         scene_locations (
           location:locations (*)
         )
       `)
       .eq('project_id', projectId)
       .order('scene_number');
     
     if (error) throw error;
     return data;
   };
   ```

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// ✅ Good: Comprehensive unit test
describe('SceneClusteringService', () => {
  let service: SceneClusteringService;
  
  beforeEach(() => {
    service = new SceneClusteringService();
  });
  
  describe('clusterByLocation', () => {
    it('should group scenes by location', () => {
      const scenes = [
        { id: '1', location: 'Kitchen', dayNight: 'DAY' },
        { id: '2', location: 'Kitchen', dayNight: 'NIGHT' },
        { id: '3', location: 'Bedroom', dayNight: 'DAY' }
      ];
      
      const clusters = service.clusterByLocation(scenes);
      
      expect(clusters).toHaveLength(2);
      expect(clusters[0].location).toBe('Kitchen');
      expect(clusters[0].scenes).toHaveLength(2);
    });
    
    it('should handle empty scenes array', () => {
      const clusters = service.clusterByLocation([]);
      expect(clusters).toEqual([]);
    });
  });
});
```

### Integration Testing

```typescript
// ✅ Good: Integration test with database
describe('Scene API Integration', () => {
  let testProject: Project;
  
  beforeAll(async () => {
    testProject = await createTestProject();
  });
  
  afterAll(async () => {
    await cleanupTestProject(testProject.id);
  });
  
  it('should create and retrieve scene', async () => {
    const sceneData = {
      project_id: testProject.id,
      scene_number: '1',
      location_name: 'Test Location',
      scene_type: 'INT',
      time_of_day: 'DAY'
    };
    
    const createdScene = await apiClient.createScene(sceneData);
    expect(createdScene.id).toBeDefined();
    
    const retrievedScene = await apiClient.getScene(createdScene.id);
    expect(retrievedScene.scene_number).toBe('1');
  });
});
```

### E2E Testing

```typescript
// ✅ Good: End-to-end test
test('complete scene breakdown workflow', async ({ page }) => {
  await page.goto('/projects/test-project/scenes');
  
  // Upload script
  await page.getByRole('button', { name: 'Upload Script' }).click();
  await page.setInputFiles('input[type="file"]', 'test-script.pdf');
  
  // Wait for processing
  await page.waitForSelector('[data-testid="breakdown-table"]');
  
  // Verify scenes were extracted
  const sceneRows = page.locator('[data-testid="scene-row"]');
  await expect(sceneRows).toHaveCount(5);
  
  // Edit a scene
  await sceneRows.first().getByRole('button', { name: 'Edit' }).click();
  await page.fill('[data-testid="complexity-rating"]', '3');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Verify changes saved
  await expect(sceneRows.first()).toContainText('Complexity: 3');
});
```

## 📋 Pull Request Guidelines

### PR Title Format

Use conventional commit format for PR titles:

```
feat(scope): add new feature
fix(scope): resolve bug in component
docs(scope): update documentation
style(scope): improve styling
refactor(scope): restructure code
test(scope): add test coverage
chore(scope): update dependencies
```

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Film Production Context
- [ ] Script breakdown feature
- [ ] Casting management
- [ ] Location scouting
- [ ] Production scheduling
- [ ] Asset management
- [ ] Other: ___________

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots or GIFs showing the changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**
   - All tests must pass
   - Linting must pass
   - Type checking must pass
   - Build must succeed

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Ensure code follows standards

3. **Testing**
   - Manual testing in development environment
   - Verify film production workflows work correctly
   - Test on both web and mobile if applicable

## 🏗️ Architecture Guidelines

### Package Structure

When adding new functionality:

1. **Types First**: Add type definitions to [`@plotops/types`](packages/types/)
2. **Business Logic**: Implement core logic in [`@plotops/business-logic`](packages/business-logic/)
3. **API Integration**: Add database operations to [`@plotops/api-client`](packages/api-client/)
4. **UI Components**: Add reusable components to [`@plotops/ui`](packages/ui/)
5. **Application Logic**: Implement in appropriate app ([`apps/web`](apps/web/) or [`apps/mobile`](apps/mobile/))

### Database Changes

1. **Create Migration**
   ```bash
   # Create new migration file
   touch services/supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name.sql
   ```

2. **Migration Format**
   ```sql
   -- Migration: Add scene complexity tracking
   -- Created: 2024-03-27
   
   BEGIN;
   
   -- Add new columns
   ALTER TABLE plotops.scenes 
   ADD COLUMN complexity_rating INTEGER CHECK (complexity_rating >= 1 AND complexity_rating <= 5);
   
   -- Update existing data (if needed)
   UPDATE plotops.scenes 
   SET complexity_rating = 3 
   WHERE complexity_rating IS NULL;
   
   -- Add indexes
   CREATE INDEX idx_scenes_complexity ON plotops.scenes(complexity_rating);
   
   COMMIT;
   ```

3. **Update Types**
   ```typescript
   // packages/types/src/database.ts
   export interface Scene {
     id: string;
     project_id: string;
     scene_number: string;
     complexity_rating?: number; // Add new field
     // ... other fields
   }
   ```

### API Design

1. **RESTful Endpoints**
   ```typescript
   // ✅ Good: RESTful API design
   // GET /api/projects/:projectId/scenes
   // POST /api/projects/:projectId/scenes
   // PUT /api/projects/:projectId/scenes/:sceneId
   // DELETE /api/projects/:projectId/scenes/:sceneId
   ```

2. **Error Handling**
   ```typescript
   // ✅ Good: Consistent error responses
   export class APIError extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public code: string
     ) {
       super(message);
     }
   }
   
   // Usage
   if (!scene) {
     throw new APIError('Scene not found', 404, 'SCENE_NOT_FOUND');
   }
   ```

## 🎬 Film Production Domain Knowledge

### Understanding Film Production

When contributing to PlotOps, it's helpful to understand film production terminology:

- **Scene**: A single unit of action in one location
- **Shot**: Individual camera setups within a scene
- **Stripboard**: Visual schedule showing scenes in shooting order
- **Call Sheet**: Daily schedule for cast and crew
- **Wrap**: End of shooting for the day
- **Pickup**: Additional shots needed after principal photography

### User Roles and Workflows

1. **Producer**: Oversees entire project, manages budget and schedule
2. **Assistant Director (AD)**: Manages daily operations and crew coordination
3. **Casting Director**: Manages auditions and talent selection
4. **Location Scout**: Finds and manages filming locations
5. **Script Supervisor**: Tracks continuity and script changes
6. **Editor**: Manages post-production assets and workflows

## 🚀 Release Process

### Version Management

We use semantic versioning (SemVer):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Release Workflow

1. **Feature Freeze**: No new features, only bug fixes
2. **Testing**: Comprehensive testing across all platforms
3. **Documentation**: Update all relevant documentation
4. **Release Notes**: Document all changes and improvements
5. **Deployment**: Deploy to staging, then production
6. **Monitoring**: Monitor for issues post-deployment

## 🆘 Getting Help

### Resources

- **[Development Guide](DEVELOPMENT.md)**: Detailed setup instructions
- **[Architecture Documentation](plans/plotops-monorepo-architecture.md)**: Technical architecture
- **[API Documentation](docs/api/)**: API reference
- **[Package Documentation](packages/README.md)**: Shared packages overview

### Communication

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Code Review**: Provide constructive feedback in pull requests

### Common Questions

**Q: How do I add a new film production feature?**
A: Start by understanding the film production workflow, add types to `@plotops/types`, implement business logic in `@plotops/business-logic`, and create UI components.

**Q: How do I test my changes?**
A: Run `pnpm test` for all tests, `pnpm test:unit` for unit tests, and manually test in the development environment.

**Q: How do I handle database changes?**
A: Create a migration file, update TypeScript types, and test thoroughly in development before submitting.

## 🎉 Recognition

Contributors are recognized in:

- **README.md**: Contributors section
- **Release Notes**: Feature attribution
- **GitHub**: Contributor graphs and statistics

Thank you for contributing to PlotOps and helping revolutionize film production management! 🎬✨