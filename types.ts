
export enum UserRole {
  SYS_ADMIN = 'sys_admin',
  PROJECT_MANAGER = 'project_manager',
  WORKER = 'worker',
  VIEWER = 'viewer'
}

export enum ProjectStatus {
  PLANNING = 'בתכנון',
  ACTIVE = 'פעיל',
  PAUSED = 'בהשהיה',
  COMPLETED = 'הושלם',
  CANCELLED = 'בוטל'
}

export enum TaskType {
  STAGE = 'שלב',
  TASK = 'משימה',
  MILESTONE = 'אבן דרך'
}

export enum TaskStatus {
  NOT_STARTED = 'טרם החל',
  IN_PROGRESS = 'בתהליך',
  STUCK = 'תקוע',
  DONE = 'הושלם'
}

export enum Priority {
  LOW = 'נמוכה',
  MEDIUM = 'בינונית',
  HIGH = 'גבוהה',
  CRITICAL = 'קריטית'
}

export enum DependencyType {
  FS = 'FS', // Finish-to-Start
  SS = 'SS'  // Start-to-Start
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  clientName: string;
  managerId: string;
  status: ProjectStatus;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  totalBudget: number;
  notes?: string;
  isDeleted: boolean;
}

export interface Task {
  id: string;
  orgId: string;
  projectId: string;
  parentId?: string;
  type: TaskType;
  name: string;
  ownerId: string;
  assignedContactId?: string;
  priority: Priority;
  status: TaskStatus;
  plannedStart: string;
  workDays: number;
  plannedEnd: string; // Calculated
  dependencyId?: string;
  dependencyType?: DependencyType;
  hasIssue: boolean;
  issueDescription?: string;
  progressPct: number;
  isDeleted: boolean;
}

export interface Payment {
  id: string;
  orgId: string;
  projectId: string;
  taskId?: string;
  type: 'INCOME' | 'EXPENSE';
  plannedAmount: number;
  actualAmount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AppState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  auditLogs: AuditLog[];
  currentUser: User | null;
  currentOrgId: string;
}
