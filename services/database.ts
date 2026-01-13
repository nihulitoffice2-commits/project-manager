
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { 
  Project, Task, Payment, User, AuditLog, 
  DependencyType 
} from '../types';
import { addIsraelWorkdays } from '../utils/dateUtils';

/**
 * IDatabase Interface enforcement for Phase 3
 */
export interface IDatabase {
  projects: {
    create(data: Omit<Project, 'id' | 'isDeleted'>): Promise<Project>;
    update(id: string, data: Partial<Project>, orgId: string): Promise<Project>;
    delete(id: string, orgId: string): Promise<void>;
    query(orgId: string): Promise<Project[]>;
  };
  tasks: {
    create(data: Omit<Task, 'id' | 'plannedEnd' | 'isDeleted'>): Promise<Task>;
    update(id: string, data: Partial<Task>, orgId: string): Promise<Task>;
    delete(id: string, orgId: string): Promise<void>;
    query(orgId: string, projectId?: string): Promise<Task[]>;
  };
  audit: {
    log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
    query(orgId: string): Promise<AuditLog[]>;
  };
}

class FirestoreDatabase implements IDatabase {
  projects = {
    create: async (data: Omit<Project, 'id' | 'isDeleted'>): Promise<Project> => {
      const colRef = collection(firestore, 'projects');
      const docRef = await addDoc(colRef, {
        ...data,
        isDeleted: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: data.managerId // Assuming managerId is the creator for now
      });
      return { ...data, id: docRef.id, isDeleted: false } as Project;
    },

    update: async (id: string, data: Partial<Project>, orgId: string): Promise<Project> => {
      const docRef = doc(firestore, 'projects', id);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp()
      });
      const updated = await getDoc(docRef);
      return { id, ...updated.data() } as Project;
    },

    delete: async (id: string, orgId: string): Promise<void> => {
      const docRef = doc(firestore, 'projects', id);
      await updateDoc(docRef, { 
        isDeleted: true, 
        updated_at: serverTimestamp() 
      });
    },

    query: async (orgId: string): Promise<Project[]> => {
      const colRef = collection(firestore, 'projects');
      const q = query(
        colRef, 
        where('orgId', '==', orgId), 
        where('isDeleted', '==', false),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    }
  };

  tasks = {
    create: async (data: Omit<Task, 'id' | 'plannedEnd' | 'isDeleted'>): Promise<Task> => {
      const plannedEnd = addIsraelWorkdays(data.plannedStart, data.workDays);
      const colRef = collection(firestore, 'tasks');
      const docRef = await addDoc(colRef, {
        ...data,
        plannedEnd,
        isDeleted: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: data.ownerId
      });
      const newTask = { ...data, id: docRef.id, plannedEnd, isDeleted: false } as Task;
      await this.handleDependencies(newTask.id, data.orgId);
      return newTask;
    },

    update: async (id: string, data: Partial<Task>, orgId: string): Promise<Task> => {
      const docRef = doc(firestore, 'tasks', id);
      const currentSnap = await getDoc(docRef);
      if (!currentSnap.exists()) throw new Error('Task not found');
      
      const currentData = currentSnap.data() as Task;
      const updatedFields: any = { ...data, updated_at: serverTimestamp() };
      
      // Re-calculate end date if start or duration changed
      if (data.plannedStart || data.workDays) {
        updatedFields.plannedEnd = addIsraelWorkdays(
          data.plannedStart || currentData.plannedStart, 
          data.workDays || currentData.workDays
        );
      }
      
      await updateDoc(docRef, updatedFields);
      
      // Cascade changes to dependent tasks
      await this.handleDependencies(id, orgId);
      
      const updated = await getDoc(docRef);
      return { id, ...updated.data() } as Task;
    },

    delete: async (id: string, orgId: string): Promise<void> => {
      const docRef = doc(firestore, 'tasks', id);
      await updateDoc(docRef, { 
        isDeleted: true, 
        updated_at: serverTimestamp() 
      });
    },

    query: async (orgId: string, projectId?: string): Promise<Task[]> => {
      const colRef = collection(firestore, 'tasks');
      let q = query(
        colRef, 
        where('orgId', '==', orgId), 
        where('isDeleted', '==', false),
        orderBy('plannedStart', 'asc')
      );
      
      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
    }
  };

  audit = {
    log: async (entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
      const colRef = collection(firestore, 'audit_logs');
      await addDoc(colRef, {
        ...entry,
        timestamp: new Date().toISOString() 
      });
    },

    query: async (orgId: string): Promise<AuditLog[]> => {
      const colRef = collection(firestore, 'audit_logs');
      const q = query(
        colRef, 
        where('orgId', '==', orgId), 
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
    }
  };

  /**
   * Internal logic to handle task dependency cascading.
   * If Task A changes, find all Task B where B.dependencyId == A.id and shift them.
   */
  private async handleDependencies(changedTaskId: string, orgId: string) {
    const docRef = doc(firestore, 'tasks', changedTaskId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const changedTask = snap.data() as Task;

    const colRef = collection(firestore, 'tasks');
    const q = query(
      colRef, 
      where('orgId', '==', orgId), 
      where('dependencyId', '==', changedTaskId), 
      where('isDeleted', '==', false)
    );
    
    const dependents = await getDocs(q);
    for (const dDoc of dependents.docs) {
      const dep = dDoc.data() as Task;
      let newStart = dep.plannedStart;
      
      if (dep.dependencyType === DependencyType.FS) {
        // Finish-to-Start: Dependency ends, next one starts next workday
        newStart = addIsraelWorkdays(changedTask.plannedEnd, 1);
      } else if (dep.dependencyType === DependencyType.SS) {
        // Start-to-Start: Dependency starts, next one starts simultaneously
        newStart = changedTask.plannedStart;
      }

      if (newStart !== dep.plannedStart) {
        // Use the internal update logic to ensure recursion
        await this.tasks.update(dDoc.id, { plannedStart: newStart }, orgId);
      }
    }
  }
}

export const db = new FirestoreDatabase();
