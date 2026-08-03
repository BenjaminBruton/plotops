/**
 * @plotops/auth - Authentication and Role-Based Access Control for PlotOps
 * 
 * This package provides comprehensive authentication and authorization functionality
 * including Supabase Auth integration, role-based permissions, and multi-tenant support.
 */

import type {
  User,
  UserRole,
  Permission,
  Tenant
} from '@plotops/types';
import { databaseConfig, authConfig, rbacConfig } from '@plotops/config';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  tenant_slug?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  tenant_name?: string;
  tenant_slug?: string;
  role?: UserRole;
}

export interface ResetPasswordRequest {
  email: string;
  tenant_slug?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

interface AuthState {
  user: User | null;
  session: any | null; // Using any for now since we don't have Supabase types
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginRequest) => Promise<{ user: User; session: any }>;
  signUp: (credentials: RegisterRequest) => Promise<{ user: User; session: any }>;
  signOut: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  refreshSession: () => Promise<any | null>;
  hasPermission: (permission: Permission, resource?: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string, action: Permission) => boolean;
}

export interface PermissionContext {
  user: User;
  tenant: Tenant;
  project?: { id: string; tenant_id: string };
  resource?: string;
}

// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================

export class AuthManager {
  private currentUser: User | null = null;
  private currentSession: any | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Initialize auth system - implementation depends on environment
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // This would be implemented differently for web vs mobile
      // For now, just notify listeners of initial state
      this.notifyListeners({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.notifyListeners({
        user: null,
        session: null,
        loading: false,
        error: 'Failed to initialize authentication',
      });
    }
  }

  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => listener(state));
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener({
      user: this.currentUser,
      session: this.currentSession,
      loading: false,
      error: null,
    });

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async signIn(credentials: LoginRequest): Promise<{ user: User; session: any }> {
    try {
      // Implementation would depend on the specific auth provider
      // This is a placeholder that would be implemented in the specific environment
      throw new Error('signIn must be implemented by the specific auth provider');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      this.notifyListeners({
        user: null,
        session: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  public async signUp(credentials: RegisterRequest): Promise<{ user: User; session: any }> {
    try {
      // Implementation would depend on the specific auth provider
      throw new Error('signUp must be implemented by the specific auth provider');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      this.notifyListeners({
        user: null,
        session: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    try {
      // Clear local state
      this.currentUser = null;
      this.currentSession = null;
      this.notifyListeners({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  public async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      // Implementation would depend on the specific auth provider
      throw new Error('resetPassword must be implemented by the specific auth provider');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  public async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      // Implementation would depend on the specific auth provider
      throw new Error('changePassword must be implemented by the specific auth provider');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  public async refreshSession(): Promise<any | null> {
    try {
      // Implementation would depend on the specific auth provider
      return null;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentSession(): any | null {
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  // Protected method for setting user state (used by concrete implementations)
  protected setUserState(user: User | null, session: any | null): void {
    this.currentUser = user;
    this.currentSession = session;
    this.notifyListeners({
      user,
      session,
      loading: false,
      error: null,
    });
  }
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL MANAGER
// ============================================================================

export class RBACManager {
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  public hasRole(role: UserRole): boolean {
    const user = this.authManager.getCurrentUser();
    return user?.role === role;
  }

  public hasPermission(permission: Permission, resource?: string): boolean {
    const user = this.authManager.getCurrentUser();
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check role-based permissions from config
    const roleConfig = rbacConfig.roles[user.role];
    if (!roleConfig) return false;

    // Check general permissions
    if (roleConfig.permissions.some(p => p === permission)) {
      return true;
    }

    // Check resource-specific permissions
    if (resource) {
      const resourcePerms = this.getResourcePermissions(resource, user.role);
      return resourcePerms.includes(permission);
    }

    return false;
  }

  private getResourcePermissions(resource: string, role: UserRole): Permission[] {
    // Type-safe way to access resource permissions
    const resourcePermissions = rbacConfig.resourcePermissions as any;
    if (resourcePermissions[resource] && resourcePermissions[resource][role]) {
      return resourcePermissions[resource][role];
    }
    return [];
  }

  public canAccess(resource: string, action: Permission): boolean {
    return this.hasPermission(action, resource);
  }

  public getAvailableActions(resource: string): Permission[] {
    const user = this.authManager.getCurrentUser();
    if (!user) return [];

    // Admin has all permissions
    if (user.role === 'admin') {
      return ['read', 'write', 'delete', 'admin'] as Permission[];
    }

    // Get resource-specific permissions
    const resourcePerms = this.getResourcePermissions(resource, user.role);
    if (resourcePerms.length > 0) {
      return resourcePerms;
    }

    // Fall back to role permissions
    const roleConfig = rbacConfig.roles[user.role];
    return roleConfig?.permissions ? [...roleConfig.permissions] : [];
  }

  public canAccessModule(module: string): boolean {
    const user = this.authManager.getCurrentUser();
    if (!user) return false;

    // Define module access rules based on roles
    const moduleAccess: Record<string, string[]> = {
      projects: ['admin', 'producer', 'assistant_director'],
      scenes: ['admin', 'producer', 'assistant_director', 'script_supervisor'],
      casting: ['admin', 'producer', 'casting_director'],
      locations: ['admin', 'producer', 'assistant_director', 'location_scout'],
      assets: ['admin', 'producer', 'assistant_director', 'editor'],
      schedule: ['admin', 'producer', 'assistant_director', 'script_supervisor'],
      budget: ['admin', 'producer'],
      reports: ['admin', 'producer', 'assistant_director'],
    };

    return moduleAccess[module]?.includes(user.role) || false;
  }

  public filterDataByPermissions<T extends { tenant_id: string; created_by?: string }>(
    data: T[],
    permission: Permission
  ): T[] {
    const user = this.authManager.getCurrentUser();
    if (!user) return [];

    // Admin can see all data within tenant
    if (user.role === 'admin') {
      return data.filter(item => item.tenant_id === user.tenant_id);
    }

    // Filter by tenant and additional permission checks
    return data.filter(item => {
      // Must be same tenant
      if (item.tenant_id !== user.tenant_id) return false;

      // If user has the required permission, they can see it
      if (this.hasPermission(permission)) return true;

      // If it's their own data, they can see it
      if (item.created_by === user.id) return true;

      return false;
    });
  }

  public async checkProjectAccess(projectId: string, permission: Permission): Promise<boolean> {
    const user = this.authManager.getCurrentUser();
    if (!user) return false;

    // Admin has access to all projects in their tenant
    if (user.role === 'admin') return true;

    // Check if user has general permission
    if (this.hasPermission(permission, 'projects')) return true;

    // TODO: Check project-specific permissions (e.g., project team members)
    // This would require a database query to check if user is assigned to the project

    return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createPermissionChecker = (authManager: AuthManager, rbacManager: RBACManager) => {
  return {
    canRead: (resource: string) => rbacManager.canAccess(resource, 'read' as Permission),
    canWrite: (resource: string) => rbacManager.canAccess(resource, 'write' as Permission),
    canDelete: (resource: string) => rbacManager.canAccess(resource, 'delete' as Permission),
    canAdmin: (resource: string) => rbacManager.canAccess(resource, 'admin' as Permission),
    hasRole: (role: UserRole) => rbacManager.hasRole(role),
    isAuthenticated: () => authManager.isAuthenticated(),
    getCurrentUser: () => authManager.getCurrentUser(),
  };
};

// ============================================================================
// PERMISSION VALIDATION HELPERS
// ============================================================================

export const validatePermissions = {
  /**
   * Check if user can perform action on resource
   */
  can: (user: User | null, action: Permission, resource?: string): boolean => {
    if (!user) return false;
    
    // Create temporary managers for validation
    const authManager = new AuthManager();
    (authManager as any).currentUser = user;
    const rbacManager = new RBACManager(authManager);
    
    return rbacManager.hasPermission(action, resource);
  },

  /**
   * Check if user has specific role
   */
  hasRole: (user: User | null, role: UserRole): boolean => {
    return user?.role === role;
  },

  /**
   * Check if user can access module
   */
  canAccessModule: (user: User | null, module: string): boolean => {
    if (!user) return false;
    
    const authManager = new AuthManager();
    (authManager as any).currentUser = user;
    const rbacManager = new RBACManager(authManager);
    
    return rbacManager.canAccessModule(module);
  },

  /**
   * Filter array of items based on user permissions
   */
  filterByPermissions: <T extends { tenant_id: string; created_by?: string }>(
    user: User | null,
    items: T[],
    permission: Permission
  ): T[] => {
    if (!user) return [];
    
    const authManager = new AuthManager();
    (authManager as any).currentUser = user;
    const rbacManager = new RBACManager(authManager);
    
    return rbacManager.filterDataByPermissions(items, permission);
  },
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const PERMISSIONS = {
  READ: 'read' as Permission,
  WRITE: 'write' as Permission,
  DELETE: 'delete' as Permission,
  ADMIN: 'admin' as Permission,
} as const;

export const USER_ROLES = {
  ADMIN: 'admin' as UserRole,
  PRODUCER: 'producer' as UserRole,
  ASSISTANT_DIRECTOR: 'assistant_director' as UserRole,
  CASTING_DIRECTOR: 'casting_director' as UserRole,
  LOCATION_SCOUT: 'location_scout' as UserRole,
  EDITOR: 'editor' as UserRole,
  PUBLICIST: 'publicist' as UserRole,
  SCRIPT_SUPERVISOR: 'script_supervisor' as UserRole,
} as const;

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const authManager = new AuthManager();
export const rbacManager = new RBACManager(authManager);

// ============================================================================
// EXPORTS
// ============================================================================

// All types and classes are already exported above