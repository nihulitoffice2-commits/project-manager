
import React, { useState } from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { Task, TaskStatus, Priority, TaskType, DependencyType, Project } from '../types';

interface TaskFormProps {
  task?: Task | null;
  projectId?: string;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, projectId: initialProjectId, onClose }) => {
  const { state, actions } = useProjectSystem();
  
  const activeProjects = state.projects.filter(p => !p.isDeleted);
  
  const [formData, setFormData] = useState<Partial<Task>>(task || {
    projectId: initialProjectId || activeProjects[0]?.id || '',
    name: '',
    type: TaskType.TASK,
    status: TaskStatus.NOT_STARTED,
    priority: Priority.MEDIUM,
    plannedStart: new Date().toISOString().split('T')[0],
    workDays: 1,
    ownerId: state.currentUser?.id || '',
    progressPct: 0,
    hasIssue: false,
    issueDescription: '',
    isDeleted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeProjects.length === 0) {
      alert('חובה ליצור פרויקט לפני הוספת משימה');
      return;
    }
    if (formData.hasIssue && !formData.issueDescription) {
      alert('חובה להזין פירוט עבור משימה עם בעיה');
      return;
    }
    await actions.upsertTask(formData);
    onClose();
  };

  const currentProjectTasks = state.tasks.filter(t => t.projectId === formData.projectId && t.id !== task?.id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h2 className="text-xl font-black text-slate-800">{task ? 'עריכת משימה' : 'משימה חדשה'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">✕</button>
        </div>
        
        {activeProjects.length === 0 ? (
          <div className="p-10 text-center space-y-4">
             <div className="text-5xl">📁</div>
             <p className="font-bold text-slate-700">לא נמצאו פרויקטים פעילים במערכת</p>
             <p className="text-sm text-slate-500">יש להקים פרויקט בטרם הוספת משימות</p>
             <button onClick={onClose} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">סגור</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">שם המשימה</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">פרויקט</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  disabled={!!task}
                >
                  {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">סוג</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                >
                  {Object.values(TaskType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">עדיפות</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                >
                  {Object.values(Priority).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">תאריך התחלה</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.plannedStart}
                  onChange={e => setFormData({...formData, plannedStart: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">ימי עבודה (א-ה)</label>
                <input 
                  type="number" min="1" required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.workDays}
                  onChange={e => setFormData({...formData, workDays: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1 opacity-60">
                <label className="text-xs font-bold text-slate-500 uppercase">סיום משוער (מחושב)</label>
                <div className="px-4 py-2.5 bg-slate-100 rounded-xl font-bold border border-slate-200">
                  {formData.plannedEnd || 'ייקבע בשמירה'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">תלות במשימה קודמת</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dependencyId || ''}
                  onChange={e => setFormData({...formData, dependencyId: e.target.value || undefined})}
                >
                  <option value="">ללא תלות</option>
                  {currentProjectTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">סוג תלות</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dependencyType || DependencyType.FS}
                  onChange={e => setFormData({...formData, dependencyType: e.target.value as DependencyType})}
                  disabled={!formData.dependencyId}
                >
                  <option value={DependencyType.FS}>סיום להתחלה (FS)</option>
                  <option value={DependencyType.SS}>התחלה להתחלה (SS)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" id="hasIssue"
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  checked={formData.hasIssue}
                  onChange={e => setFormData({...formData, hasIssue: e.target.checked})}
                />
                <label htmlFor="hasIssue" className="font-bold text-amber-900 cursor-pointer">יש בעיה במשימה זו</label>
              </div>
              {formData.hasIssue && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold text-amber-700 uppercase">פירוט הבעיה (חובה)</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-20"
                    placeholder="תאר את המחסום או הבעיה..."
                    value={formData.issueDescription}
                    onChange={e => setFormData({...formData, issueDescription: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                {task ? 'עדכן משימה' : 'צור משימה'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
