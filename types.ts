
export enum UserRole {
  SYS_ADMIN = 'SYS_ADMIN',
  PM_ADMIN = 'PM_ADMIN',
  WORKER = 'WORKER',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessibleProjects: string[]; // List of project IDs
  photoURL?: string;
}

export enum ProjectStatus {
  PLANNING = 'בתכנון',
  ACTIVE = 'פעיל',
  ON_HOLD = 'בהשהיה',
  COMPLETED = 'הושלם',
  CANCELLED = 'בוטל'
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  financialTarget: number;
  projectCost: number;
  paidAmount: number;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  contacts: Contact[];
  isDeleted: boolean;
}

export enum TaskPriority {
  LOW = 'נמוכה',
  MEDIUM = 'בינונית',
  HIGH = 'גבוהה',
  URGENT = 'דחוף'
}

export enum TaskStatus {
  TODO = 'טרם התחיל',
  IN_PROGRESS = 'בתהליך',
  STUCK = 'תקוע',
  DONE = 'הושלם'
}

export interface Task {
  id: string;
  projectId: string;
  phase: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  isRedFlag: boolean;
  redFlagReason?: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  status: 'PLANNED' | 'INVOICE' | 'PAID' | 'OVERDUE';
  description: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  associatedProjects: string[];
}
