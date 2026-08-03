/**
 * @plotops/shared - Common utilities and helper functions for PlotOps
 * 
 * This package provides shared utilities including date/time formatting,
 * file processing helpers, validation schemas, constants, and business logic helpers.
 */

import type { Scene, UserRole, ProjectStatus, SceneStatus } from '@plotops/types';

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

export const formatDate = (date: Date | string, format?: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return d.toLocaleDateString();
};

export const formatTime = (date: Date | string, format: '12h' | '24h' = '12h'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === '24h') {
    return d.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (date: Date | string, dateFormat?: string, timeFormat: '12h' | '24h' = '12h'): string => {
  return `${formatDate(date, dateFormat)} ${formatTime(date, timeFormat)}`;
};

export const isDateInRange = (date: Date | string, start: Date | string, end: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return d >= s && d <= e;
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const getDaysBetween = (start: Date | string, end: Date | string): number => {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeekday = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

export const isWeekend = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const getTimeZoneOffset = (timezone: string): number => {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const removeHtmlTags = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

export const extractInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const generateId = (prefix?: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

// ============================================================================
// ARRAY AND OBJECT UTILITIES
// ============================================================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []
  );
};

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T, 
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPassword = (password: string, minLength = 8): boolean => {
  if (password.length < minLength) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// ============================================================================
// FILE PROCESSING UTILITIES
// ============================================================================

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileName = (filepath: string): string => {
  return filepath.split('/').pop() || '';
};

export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
  const extension = getFileExtension(filename);
  return videoExtensions.includes(extension);
};

export const isAudioFile = (filename: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];
  const extension = getFileExtension(filename);
  return audioExtensions.includes(extension);
};

export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  const extension = getFileExtension(filename);
  return docExtensions.includes(extension);
};

// ============================================================================
// NUMBER AND CURRENCY UTILITIES
// ============================================================================

export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, total: number, decimals = 1): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const roundToNearest = (value: number, nearest: number): number => {
  return Math.round(value / nearest) * nearest;
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// ============================================================================
// BUSINESS LOGIC HELPERS
// ============================================================================

export const calculateSceneProgress = (scenes: Scene[]): {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
} => {
  const total = scenes.length;
  const completed = scenes.filter(s => s.status === 'completed').length;
  const inProgress = scenes.filter(s => s.status === 'in_progress').length;
  const notStarted = scenes.filter(s => s.status === 'not_scheduled' || s.status === 'scheduled').length;
  
  return {
    total,
    completed,
    inProgress,
    notStarted,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const estimateProjectDuration = (scenes: Scene[]): number => {
  return scenes.reduce((total, scene) => total + scene.estimated_duration, 0);
};

export const getProjectStatusColor = (status: ProjectStatus): string => {
  const colors = {
    development: '#6B7280',
    pre_production: '#F59E0B',
    production: '#10B981',
    post_production: '#3B82F6',
    completed: '#059669',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7280';
};

export const getSceneStatusColor = (status: SceneStatus): string => {
  const colors = {
    not_scheduled: '#6B7280',
    scheduled: '#F59E0B',
    in_progress: '#3B82F6',
    completed: '#10B981',
    needs_reshoot: '#EF4444',
    cancelled: '#6B7280',
  };
  return colors[status] || '#6B7280';
};

export const getRoleDisplayName = (role: UserRole): string => {
  const names = {
    admin: 'Administrator',
    producer: 'Producer',
    assistant_director: 'Assistant Director',
    casting_director: 'Casting Director',
    location_scout: 'Location Scout',
    editor: 'Editor',
    publicist: 'Publicist',
    script_supervisor: 'Script Supervisor',
  };
  return names[role] || role;
};

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await delay(delayMs * attempt);
    }
  }
  
  throw lastError!;
};

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ]);
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSTANTS = {
  DATE_FORMATS: {
    SHORT: 'short',
    LONG: 'long',
    ISO: 'iso',
  },
  TIME_FORMATS: {
    TWELVE_HOUR: '12h' as const,
    TWENTY_FOUR_HOUR: '24h' as const,
  },
  FILE_TYPES: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'],
    AUDIO: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    SCRIPT: ['fdx', 'fountain', 'txt', 'pdf'],
  },
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    URL: /^https?:\/\/.+/,
    HEX_COLOR: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
  },
} as const;

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export class PlotOpsError extends Error {
  public code: string;
  public details?: Record<string, any>;

  constructor(message: string, code = 'UNKNOWN_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'PlotOpsError';
    this.code = code;
    this.details = details;
  }
}

export const createError = (message: string, code?: string, details?: Record<string, any>): PlotOpsError => {
  return new PlotOpsError(message, code, details);
};

export const isPlotOpsError = (error: any): error is PlotOpsError => {
  return error instanceof PlotOpsError;
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { Scene, UserRole, ProjectStatus, SceneStatus };