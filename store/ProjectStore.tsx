
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AppState, Project, Task, Payment, User, UserRole, AuditLog } from '../types';
import { db } from '../services/database';

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ORG'; payload: string }
  | { type: 'SYNC_STATE'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  users: [],
  projects: [],
  tasks: [],
  payments: [],
  auditLogs: [],
  currentUser: null,
  currentOrgId: '', // Dynamic on login
};

const ProjectContext = createContext<{
  state: AppState;
  actions: {
    refresh: () => Promise<void>;
    upsertProject: (data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    upsertTask: (data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    login: (user: User, method: string) => void;
    logout: () => void;
  };
} | undefined>(undefined);

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ORG':
      return { ...state, currentOrgId: action.payload };
    case 'SYNC_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    // Only fetch if orgId is set and user is logged in
    const targetOrgId = state.currentUser?.orgId || state.currentOrgId;
    if (!targetOrgId) return;

    try {
      const [projects, tasks, auditLogs] = await Promise.all([
        db.projects.query(targetOrgId),
        db.tasks.query(targetOrgId),
        db.audit.query(targetOrgId)
      ]);
      dispatch({ type: 'SYNC_STATE', payload: { projects, tasks, auditLogs, currentOrgId: targetOrgId } });
    } catch (error) {
      console.error("Refresh Error:", error);
    }
  }, [state.currentOrgId, state.currentUser]);

  const upsertProject = async (data: Partial<Project>) => {
    const orgId = state.currentUser?.orgId || state.currentOrgId;
    if (!state.currentUser || !orgId) return;

    if (data.id) {
      await db.projects.update(data.id, data, orgId);
      await db.audit.log({
        orgId: orgId,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        action: 'UPDATE',
        entityType: 'Project',
        entityId: data.id,
        details: `עדכון פרויקט: ${data.name}`
      });
    } else {
      const created = await db.projects.create({
        ...data,
        orgId: orgId,
      } as Project);
      await db.audit.log({
        orgId: orgId,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        action: 'CREATE',
        entityType: 'Project',
        entityId: created.id,
        details: `יצירת פרויקט חדש: ${created.name}`
      });
    }
    await refresh();
  };

  const deleteProject = async (id: string) => {
    const orgId = state.currentUser?.orgId || state.currentOrgId;
    if (!state.currentUser || !orgId) return;

    await db.projects.delete(id, orgId);
    await db.audit.log({
      orgId: orgId,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      action: 'DELETE',
      entityType: 'Project',
      entityId: id,
      details: `מחיקת פרויקט ID: ${id}`
    });
    await refresh();
  };

  const upsertTask = async (data: Partial<Task>) => {
    const orgId = state.currentUser?.orgId || state.currentOrgId;
    if (!state.currentUser || !orgId) return;

    if (data.id) {
      await db.tasks.update(data.id, data, orgId);
    } else {
      await db.tasks.create({ ...data, orgId: orgId } as Task);
    }
    // Full state refresh to ensure cascading dependencies are synchronized in the UI
    await refresh();
  };

  const deleteTask = async (id: string) => {
    const orgId = state.currentUser?.orgId || state.currentOrgId;
    if (!state.currentUser || !orgId) return;

    await db.tasks.delete(id, orgId);
    await refresh();
  };

  const login = (user: User, method: string) => {
    dispatch({ type: 'SET_ORG', payload: user.orgId });
    dispatch({ type: 'SET_USER', payload: user });
    
    db.audit.log({
      orgId: user.orgId,
      userId: user.id,
      userName: user.name,
      action: 'STATUS_CHANGE',
      entityType: 'User',
      entityId: user.id,
      details: `התחברות למערכת (${method})`
    }).finally(() => {
        refresh();
    });
  };

  const logout = () => {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_ORG', payload: '' });
  };

  return (
    <ProjectContext.Provider value={{ state, actions: { refresh, upsertProject, deleteProject, upsertTask, deleteTask, login, logout } }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectSystem = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectSystem must be used within ProjectProvider');
  return context;
};
