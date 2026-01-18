
import { ProjectStatus, TaskPriority, TaskStatus, UserRole } from './types';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-700',
  [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-700 font-bold animate-pulse',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-slate-200 text-slate-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
  [TaskStatus.STUCK]: 'bg-red-100 text-red-600',
  [TaskStatus.DONE]: 'bg-green-100 text-green-600',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'bg-purple-100 text-purple-700',
  [ProjectStatus.ACTIVE]: 'bg-blue-100 text-blue-700',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
  [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-700',
};
