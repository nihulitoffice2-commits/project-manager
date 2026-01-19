import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Project, Task, Transaction, Contact } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  arrayUnion
} from 'firebase/firestore';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  contacts: Contact[];
  addProject: (p: Partial<Project>) => Promise<void>;
  addTask: (t: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTransaction: (t: Partial<Transaction>) => Promise<void>;
  addContact: (c: Partial<Contact>) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isSysAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('isDeleted', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Projects snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(transactionsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      setContacts(contactsData);
    });
    return () => unsubscribe();
  }, []);

  const addProject = async (p: Partial<Project>) => {
    if (!currentUser) return;

    // 1. Create the project
    const docRef = await addDoc(collection(db, 'projects'), {
      ...p,
      isDeleted: false,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
      creatorId: currentUser.id
    });

    // 2. Add the project ID to user's accessible projects
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, {
      accessibleProjects: arrayUnion(docRef.id)
    });
  };

  const addTask = async (t: Partial<Task>) => {
    await addDoc(collection(db, 'tasks'), {
      ...t,
      createdAt: new Date().toISOString()
    });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  };

  const deleteProject = async (id: string) => {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, { isDeleted: true });
  };

  const addTransaction = async (t: Partial<Transaction>) => {
    await addDoc(collection(db, 'transactions'), {
      ...t,
      createdAt: new Date().toISOString()
    });
  };

  const addContact = async (c: Partial<Contact>) => {
    await addDoc(collection(db, 'contacts'), {
      ...c,
      createdAt: new Date().toISOString()
    });
  };

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    
    // If Admin, show everything
    if (isSysAdmin) return projects;
    
    // If not Admin, filter by accessibleProjects list
    const accessibleIds = currentUser.accessibleProjects || [];
    return projects.filter(p => accessibleIds.includes(p.id));
  }, [projects, currentUser, isSysAdmin]);

  return (
    <DataContext.Provider value={{ 
      projects: visibleProjects, 
      tasks, 
      transactions, 
      contacts, 
      addProject, 
      addTask,
      updateTask, 
      deleteProject,
      addTransaction,
      addContact,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within an DataProvider');
  return context;
};
