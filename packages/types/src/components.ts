/**
 * Component prop types and UI-related types for PlotOps components
 */

import type { ReactNode, ComponentProps } from 'react';
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
  UserRole,
  ProjectStatus,
  SceneStatus,
  CastingStatus,
  DashboardWidget,
  WidgetType
} from './index';

// ============================================================================
// COMMON COMPONENT PROPS
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

export interface ErrorProps extends BaseComponentProps {
  error: Error | string;
  retry?: () => void;
  variant?: 'inline' | 'card' | 'page';
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// FORM COMPONENT PROPS
// ============================================================================

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  initialValues?: Record<string, any>;
  validationSchema?: any; // Zod schema
}

export interface InputProps extends BaseComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface SelectProps extends BaseComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: string | string[];
  multiple?: boolean;
  searchable?: boolean;
  onChange?: (value: string | string[]) => void;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}

export interface DatePickerProps extends BaseComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  onChange?: (value: string) => void;
}

export interface FileUploadProps extends BaseComponentProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
}

// ============================================================================
// NAVIGATION COMPONENT PROPS
// ============================================================================

export interface NavigationProps extends BaseComponentProps {
  user: User;
  currentProject?: Project;
  onProjectChange?: (project: Project) => void;
  onLogout?: () => void;
}

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  onToggle?: () => void;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

// ============================================================================
// DATA DISPLAY COMPONENT PROPS
// ============================================================================

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  pagination?: TablePagination;
  sorting?: TableSorting;
  selection?: TableSelection<T>;
  actions?: TableAction<T>[];
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onChange: (page: number, pageSize: number) => void;
}

export interface TableSorting {
  field?: string;
  order?: 'asc' | 'desc';
  onChange: (field: string, order: 'asc' | 'desc') => void;
}

export interface TableSelection<T = any> {
  selectedRowKeys: string[];
  onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  visible?: (record: T) => boolean;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

// ============================================================================
// PROJECT-SPECIFIC COMPONENT PROPS
// ============================================================================

export interface ProjectSelectorProps extends BaseComponentProps {
  projects: Project[];
  currentProject?: Project;
  onProjectChange: (project: Project) => void;
  loading?: boolean;
}

export interface ProjectDashboardProps extends BaseComponentProps {
  project: Project;
  widgets: DashboardWidget[];
  onWidgetUpdate: (widgets: DashboardWidget[]) => void;
  editable?: boolean;
}

export interface SceneListProps extends BaseComponentProps {
  scenes: Scene[];
  loading?: boolean;
  onSceneClick?: (scene: Scene) => void;
  onSceneUpdate?: (scene: Scene) => void;
  onSceneWrap?: (scene: Scene) => void;
  filters?: SceneFilters;
  onFiltersChange?: (filters: SceneFilters) => void;
}

export interface SceneFilters {
  status?: SceneStatus[];
  location?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  complexity?: number[];
}

export interface SceneCardProps extends BaseComponentProps {
  scene: Scene;
  onClick?: () => void;
  onUpdate?: (scene: Scene) => void;
  onWrap?: () => void;
  showActions?: boolean;
}

export interface StripboardProps extends BaseComponentProps {
  scheduleItems: ScheduleItem[];
  scenes: Scene[];
  locations: Location[];
  cast: Character[];
  onItemMove: (itemId: string, newDate: string, newOrder: number) => void;
  onItemUpdate: (item: ScheduleItem) => void;
  editable?: boolean;
  viewMode?: 'timeline' | 'calendar' | 'list';
}

export interface CastingBoardProps extends BaseComponentProps {
  characters: Character[];
  actors: Actor[];
  onCastActor: (characterId: string, actorId: string) => void;
  onCreateCastingCall: (characterId: string) => void;
  onViewAuditions: (characterId: string) => void;
  loading?: boolean;
}

export interface LocationMapProps extends BaseComponentProps {
  locations: Location[];
  selectedLocation?: Location;
  onLocationSelect?: (location: Location) => void;
  onLocationUpdate?: (location: Location) => void;
  showRoutes?: boolean;
  mapStyle?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

export interface CallSheetPreviewProps extends BaseComponentProps {
  callSheet: CallSheet;
  onGenerate?: () => void;
  onDownload?: () => void;
  onDistribute?: () => void;
  editable?: boolean;
}

export interface AssetTrackerProps extends BaseComponentProps {
  assets: Asset[];
  onAssetCheckout: (assetId: string) => void;
  onAssetReturn: (assetId: string) => void;
  onAssetUpdate: (asset: Asset) => void;
  filters?: AssetFilters;
  onFiltersChange?: (filters: AssetFilters) => void;
}

export interface AssetFilters {
  type?: string[];
  status?: string[];
  scenes?: string[];
  source?: string[];
}

export interface DigitalAssetLibraryProps extends BaseComponentProps {
  assets: DigitalAsset[];
  onAssetSelect?: (asset: DigitalAsset) => void;
  onAssetTag?: (assetId: string, tags: string[]) => void;
  onAssetReview?: (assetId: string, status: string, notes?: string) => void;
  viewMode?: 'grid' | 'list';
  filters?: DigitalAssetFilters;
  onFiltersChange?: (filters: DigitalAssetFilters) => void;
}

export interface DigitalAssetFilters {
  file_type?: string[];
  status?: string[];
  tags?: string[];
  scene?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// MODAL AND DIALOG PROPS
// ============================================================================

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ReactNode;
}

export interface ConfirmDialogProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface DrawerProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  maskClosable?: boolean;
}

// ============================================================================
// NOTIFICATION AND FEEDBACK PROPS
// ============================================================================

export interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  type?: 'primary' | 'secondary';
}

export interface ToastProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  striped?: boolean;
  animated?: boolean;
}

// ============================================================================
// CHART AND VISUALIZATION PROPS
// ============================================================================

export interface ChartProps extends BaseComponentProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  height?: number;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface TimelineProps extends BaseComponentProps {
  items: TimelineItem[];
  orientation?: 'horizontal' | 'vertical';
  showDates?: boolean;
  interactive?: boolean;
  onItemClick?: (item: TimelineItem) => void;
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  type?: 'milestone' | 'event' | 'deadline';
  status?: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  icon?: ReactNode;
  color?: string;
}

export interface GanttChartProps extends BaseComponentProps {
  tasks: GanttTask[];
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStart: string, newEnd: string) => void;
  viewMode?: 'day' | 'week' | 'month';
  showDependencies?: boolean;
  editable?: boolean;
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string[];
  assignee?: string;
  color?: string;
  type?: 'task' | 'milestone' | 'group';
}

// ============================================================================
// ROLE-BASED COMPONENT PROPS
// ============================================================================

export interface RoleBasedComponentProps extends BaseComponentProps {
  userRole: UserRole;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export interface PermissionGateProps extends BaseComponentProps {
  permissions: string[];
  userPermissions: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

// ============================================================================
// RESPONSIVE AND LAYOUT PROPS
// ============================================================================

export interface ResponsiveProps {
  xs?: boolean | number;
  sm?: boolean | number;
  md?: boolean | number;
  lg?: boolean | number;
  xl?: boolean | number;
  xxl?: boolean | number;
}

export interface GridProps extends BaseComponentProps, ResponsiveProps {
  container?: boolean;
  item?: boolean;
  spacing?: number;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export interface LayoutProps extends BaseComponentProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// ============================================================================
// THEME AND STYLING PROPS
// ============================================================================

export interface ThemeProps {
  theme: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily?: string;
}

export interface StyleVariant {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
}