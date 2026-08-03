/**
 * @plotops/api-client - Supabase integration and API client for PlotOps
 * 
 * This package provides comprehensive database operations, real-time subscriptions,
 * file upload/download utilities, and query builders for all PlotOps entities.
 */

import type {
  User,
  Project,
  Scene,
  Character,
  Actor,
  Location,
  Asset,
  ScheduleItem,
  CallSheet,
  DigitalAsset,
  Tenant,
  ApiResponse,
  PaginationParams,
  FilterParams,
  FileUploadRequest,
  FileUploadResponse
} from '@plotops/types';
import { databaseConfig } from '@plotops/config';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface WhereClause {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not_in' | 'is' | 'not';
  value: any;
}

interface OrderByClause {
  column: string;
  direction: 'asc' | 'desc';
}

interface DatabaseClient {
  from<T = any>(table: string): QueryBuilder<T>;
  rpc<T = any>(fn: string, args?: Record<string, any>): Promise<T>;
  storage: StorageClient;
  auth: AuthClient;
  realtime: RealtimeClient;
}

export interface QueryBuilder<T = any> {
  select(columns?: string): QueryBuilder<T>;
  insert(data: Partial<T> | Partial<T>[]): QueryBuilder<T>;
  update(data: Partial<T>): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
  eq(column: string, value: any): QueryBuilder<T>;
  neq(column: string, value: any): QueryBuilder<T>;
  gt(column: string, value: any): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  lte(column: string, value: any): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  ilike(column: string, pattern: string): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  is(column: string, value: any): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  range(from: number, to: number): QueryBuilder<T>;
  single(): Promise<ApiResponse<T>>;
  maybeSingle(): Promise<ApiResponse<T | null>>;
  then<TResult1 = ApiResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: ApiResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface StorageClient {
  from(bucket: string): StorageBucket;
  createBucket(id: string, options?: any): Promise<any>;
  getBucket(id: string): Promise<any>;
  listBuckets(): Promise<any>;
}

export interface StorageBucket {
  upload(path: string, file: File | Buffer, options?: any): Promise<any>;
  download(path: string): Promise<any>;
  createSignedUrl(path: string, expiresIn: number): Promise<any>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
  list(path?: string, options?: any): Promise<any>;
  remove(paths: string[]): Promise<any>;
}

export interface AuthClient {
  getSession(): Promise<any>;
  getUser(): Promise<any>;
  signInWithPassword(credentials: any): Promise<any>;
  signUp(credentials: any): Promise<any>;
  signOut(): Promise<any>;
  onAuthStateChange(callback: (event: string, session: any) => void): any;
}

export interface RealtimeClient {
  channel(name: string): RealtimeChannel;
  removeAllChannels(): void;
}

export interface RealtimeChannel {
  on(event: string, callback: (payload: any) => void): RealtimeChannel;
  subscribe(): void;
  unsubscribe(): void;
}

// ============================================================================
// MOCK DATABASE CLIENT (for development without Supabase dependency)
// ============================================================================

class MockQueryBuilder<T = any> implements QueryBuilder<T> {
  private tableName: string;
  private selectColumns?: string;
  private whereConditions: WhereClause[] = [];
  private orderConditions: OrderByClause[] = [];
  private limitCount?: number;
  private rangeFrom?: number;
  private rangeTo?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string): QueryBuilder<T> {
    this.selectColumns = columns;
    return this;
  }

  insert(data: Partial<T> | Partial<T>[]): QueryBuilder<T> {
    console.log(`Mock insert into ${this.tableName}:`, data);
    return this;
  }

  update(data: Partial<T>): QueryBuilder<T> {
    console.log(`Mock update ${this.tableName}:`, data);
    return this;
  }

  delete(): QueryBuilder<T> {
    console.log(`Mock delete from ${this.tableName}`);
    return this;
  }

  eq(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: any[]): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'in', value: values });
    return this;
  }

  is(column: string, value: any): QueryBuilder<T> {
    this.whereConditions.push({ column, operator: 'is', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    this.orderConditions.push({
      column,
      direction: options?.ascending === false ? 'desc' : 'asc'
    });
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder<T> {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  async single(): Promise<ApiResponse<T>> {
    console.log(`Mock single query on ${this.tableName}`);
    return {
      success: true,
      data: {} as T,
    };
  }

  async maybeSingle(): Promise<ApiResponse<T | null>> {
    console.log(`Mock maybeSingle query on ${this.tableName}`);
    return {
      success: true,
      data: null,
    };
  }

  then<TResult1 = ApiResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: ApiResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    console.log(`Mock query on ${this.tableName}`);
    const result: ApiResponse<T[]> = {
      success: true,
      data: [],
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

class MockDatabaseClient implements DatabaseClient {
  from<T = any>(table: string): QueryBuilder<T> {
    return new MockQueryBuilder<T>(table);
  }

  async rpc<T = any>(fn: string, args?: Record<string, any>): Promise<T> {
    console.log(`Mock RPC call: ${fn}`, args);
    return {} as T;
  }

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Buffer, options?: any) => {
        console.log(`Mock upload to ${bucket}/${path}`);
        return { data: { path }, error: null };
      },
      download: async (path: string) => {
        console.log(`Mock download from ${bucket}/${path}`);
        return { data: new Blob(), error: null };
      },
      createSignedUrl: async (path: string, expiresIn: number) => {
        console.log(`Mock signed URL for ${bucket}/${path}`);
        return { data: { signedUrl: `https://mock.url/${path}` }, error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock.url/${path}` }
      }),
      list: async (path?: string, options?: any) => {
        console.log(`Mock list ${bucket}/${path || ''}`);
        return { data: [], error: null };
      },
      remove: async (paths: string[]) => {
        console.log(`Mock remove from ${bucket}:`, paths);
        return { data: null, error: null };
      },
    }),
    createBucket: async (id: string, options?: any) => {
      console.log(`Mock create bucket: ${id}`);
      return { data: null, error: null };
    },
    getBucket: async (id: string) => {
      console.log(`Mock get bucket: ${id}`);
      return { data: null, error: null };
    },
    listBuckets: async () => {
      console.log('Mock list buckets');
      return { data: [], error: null };
    },
  };

  auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async (credentials: any) => ({ data: null, error: null }),
    signUp: async (credentials: any) => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => ({
      data: { subscription: {} },
    }),
  };

  realtime = {
    channel: (name: string) => {
      const mockChannel = {
        on: (event: string, callback: (payload: any) => void) => mockChannel,
        subscribe: () => {},
        unsubscribe: () => {},
      };
      return mockChannel;
    },
    removeAllChannels: () => {},
  };
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class PlotOpsAPI {
  private client: DatabaseClient;
  private initialized = false;

  constructor(client?: DatabaseClient) {
    // Use provided client or create mock client
    this.client = client || new MockDatabaseClient();
    this.initialized = true;
  }

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

  async getProjects(params?: PaginationParams & FilterParams): Promise<ApiResponse<Project[]>> {
    try {
      let query = this.client.from<Project>('projects').select('*');

      if (params?.search) {
        query = query.ilike('title', `%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.sort_by) {
        query = query.order(params.sort_by, { 
          ascending: params.sort_order !== 'desc' 
        });
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      return await query;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch projects',
        },
      };
    }
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      return await this.client
        .from<Project>('projects')
        .select('*')
        .eq('id', id)
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch project',
        },
      };
    }
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
    try {
      return await this.client
        .from<Project>('projects')
        .insert(project)
        .select()
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create project',
        },
      };
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    try {
      return await this.client
        .from<Project>('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update project',
        },
      };
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client
        .from<Project>('projects')
        .delete()
        .eq('id', id);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete project',
        },
      };
    }
  }

  // ============================================================================
  // SCENE OPERATIONS
  // ============================================================================

  async getScenes(projectId: string, params?: PaginationParams & FilterParams): Promise<ApiResponse<Scene[]>> {
    try {
      let query = this.client
        .from<Scene>('scenes')
        .select('*')
        .eq('project_id', projectId);

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.sort_by) {
        query = query.order(params.sort_by, { 
          ascending: params.sort_order !== 'desc' 
        });
      } else {
        query = query.order('scene_number');
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      return await query;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch scenes',
        },
      };
    }
  }

  async createScene(scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Scene>> {
    try {
      return await this.client
        .from<Scene>('scenes')
        .insert(scene)
        .select()
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create scene',
        },
      };
    }
  }

  async updateScene(id: string, updates: Partial<Scene>): Promise<ApiResponse<Scene>> {
    try {
      return await this.client
        .from<Scene>('scenes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update scene',
        },
      };
    }
  }

  // ============================================================================
  // CHARACTER AND CASTING OPERATIONS
  // ============================================================================

  async getCharacters(projectId: string): Promise<ApiResponse<Character[]>> {
    try {
      return await this.client
        .from<Character>('characters')
        .select('*')
        .eq('project_id', projectId)
        .order('name');
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch characters',
        },
      };
    }
  }

  async getActors(params?: PaginationParams & FilterParams): Promise<ApiResponse<Actor[]>> {
    try {
      let query = this.client.from<Actor>('actors').select('*');

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      query = query.order('name');

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      return await query;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch actors',
        },
      };
    }
  }

  // ============================================================================
  // LOCATION OPERATIONS
  // ============================================================================

  async getLocations(projectId: string): Promise<ApiResponse<Location[]>> {
    try {
      return await this.client
        .from<Location>('locations')
        .select('*')
        .eq('project_id', projectId)
        .order('name');
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch locations',
        },
      };
    }
  }

  async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Location>> {
    try {
      return await this.client
        .from<Location>('locations')
        .insert(location)
        .select()
        .single();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create location',
        },
      };
    }
  }

  // ============================================================================
  // SCHEDULE OPERATIONS
  // ============================================================================

  async getScheduleItems(projectId: string, dateRange?: { start: string; end: string }): Promise<ApiResponse<ScheduleItem[]>> {
    try {
      let query = this.client
        .from<ScheduleItem>('schedule_items')
        .select('*')
        .eq('project_id', projectId);

      if (dateRange) {
        query = query
          .gte('shoot_date', dateRange.start)
          .lte('shoot_date', dateRange.end);
      }

      query = query.order('shoot_date').order('order_index');

      return await query;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch schedule',
        },
      };
    }
  }

  // ============================================================================
  // ASSET OPERATIONS
  // ============================================================================

  async getAssets(projectId: string, params?: FilterParams): Promise<ApiResponse<Asset[]>> {
    try {
      let query = this.client
        .from<Asset>('assets')
        .select('*')
        .eq('project_id', projectId);

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      query = query.order('name');

      return await query;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch assets',
        },
      };
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      const bucket = databaseConfig.supabase.url ? 'plotops-assets' : 'mock-bucket';
      const folder = request.folder || 'uploads';
      const path = `${folder}/${Date.now()}-${request.filename}`;

      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, request.file, {
          contentType: request.content_type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        url: urlData.publicUrl,
        filename: request.filename,
        size: request.file instanceof File ? request.file.size : Buffer.byteLength(request.file),
        content_type: request.content_type,
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const bucket = databaseConfig.supabase.url ? 'plotops-assets' : 'mock-bucket';
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  subscribeToProject(projectId: string, callback: (data: any) => void) {
    const channel = this.client.realtime.channel(`project:${projectId}`);
    
    channel
      .on('postgres_changes', callback)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  subscribeToScenes(projectId: string, callback: (data: any) => void) {
    const channel = this.client.realtime.channel(`scenes:${projectId}`);
    
    channel
      .on('postgres_changes', callback)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  subscribeToSchedule(projectId: string, callback: (data: any) => void) {
    const channel = this.client.realtime.channel(`schedule:${projectId}`);
    
    channel
      .on('postgres_changes', callback)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      // Simple query to test connection
      await this.client.from('projects').select('id').limit(1);
      return { status: 'ok', message: 'Database connection healthy' };
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Database connection failed' 
      };
    }
  }

  getClient(): DatabaseClient {
    return this.client;
  }
}

// ============================================================================
// QUERY BUILDER UTILITIES
// ============================================================================

export const createQueryBuilder = <T = any>(client: DatabaseClient, tableName: string) => {
  return {
    select: (columns?: string) => client.from<T>(tableName).select(columns || '*'),
    insert: (data: Partial<T> | Partial<T>[]) => client.from<T>(tableName).insert(data),
    update: (data: Partial<T>) => client.from<T>(tableName).update(data),
    delete: () => client.from<T>(tableName).delete(),
  };
};

export const buildWhereClause = <T>(query: QueryBuilder<T>, conditions: WhereClause[]): QueryBuilder<T> => {
  let result = query;
  
  conditions.forEach(condition => {
    switch (condition.operator) {
      case 'eq':
        result = result.eq(condition.column, condition.value);
        break;
      case 'neq':
        result = result.neq(condition.column, condition.value);
        break;
      case 'gt':
        result = result.gt(condition.column, condition.value);
        break;
      case 'gte':
        result = result.gte(condition.column, condition.value);
        break;
      case 'lt':
        result = result.lt(condition.column, condition.value);
        break;
      case 'lte':
        result = result.lte(condition.column, condition.value);
        break;
      case 'like':
        result = result.like(condition.column, condition.value);
        break;
      case 'ilike':
        result = result.ilike(condition.column, condition.value);
        break;
      case 'in':
        result = result.in(condition.column, condition.value);
        break;
      case 'is':
        result = result.is(condition.column, condition.value);
        break;
    }
  });
  
  return result;
};

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new PlotOpsAPI();

// ============================================================================
// EXPORTS
// ============================================================================

// All types and classes are already exported above