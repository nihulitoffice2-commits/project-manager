
import React, { useState, useEffect } from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { Project, ProjectStatus, UserRole } from '../types';

export const ProjectManagement: React.FC = () => {
  const { state, actions } = useProjectSystem();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    actions.refresh();
  }, [actions]);

  const activeProjects = state.projects.filter(p => !p.isDeleted && (showCompleted ? true : p.status !== ProjectStatus.COMPLETED));
  const canManageProjects = state.currentUser?.role === UserRole.SYS_ADMIN || state.currentUser?.role === UserRole.PROJECT_MANAGER;
  const isAdmin = state.currentUser?.role === UserRole.SYS_ADMIN;

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט? (מחיקה לוגית בלבד)')) {
      await actions.deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-slate-800">ניהול פרויקטים</h2>
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showCompleted ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showCompleted ? '📂 הסתר פרויקטים שהושלמו' : '📂 הצג הכל (כולל הושלמו)'}
          </button>
        </div>
        <button 
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          disabled={!canManageProjects}
          className={`px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
            canManageProjects 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
          }`}
          title={!canManageProjects ? 'אין לך הרשאות ליצירת פרויקטים' : 'צור פרויקט חדש'}
        >
          ➕ פרויקט חדש
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeProjects.length === 0 ? (
          <div className="p-32 text-center space-y-4">
            <div className="text-7xl">📂</div>
            <h3 className="text-xl font-black text-slate-800">אין פרויקטים פעילים להצגה</h3>
            <p className="text-slate-500">התחל ביצירת פרויקט חדש כדי לנהל קמפיינים ותקציבים.</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black border-b border-slate-100 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">שם הפרויקט</th>
                <th className="px-6 py-5">לקוח / עמותה</th>
                <th className="px-6 py-5">סטטוס</th>
                <th className="px-6 py-5">תקציב כולל</th>
                <th className="px-6 py-5 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeProjects.map(p => {
                const isCompleted = p.status === ProjectStatus.COMPLETED;
                const readOnly = !canManageProjects || isCompleted;
                
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors group ${isCompleted ? 'bg-slate-50/30 opacity-80' : ''}`}>
                    <td className="px-6 py-4 font-black text-slate-800">
                      {p.name}
                      {isCompleted && <span className="mr-2 text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">READ ONLY</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{p.clientName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black ${
                        p.status === ProjectStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                        p.status === ProjectStatus.COMPLETED ? 'bg-slate-200 text-slate-600' :
                        p.status === ProjectStatus.PAUSED ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700">₪{p.totalBudget.toLocaleString()}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingProject(p); setShowForm(true); }}
                          disabled={readOnly}
                          className={`p-2 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm transition-all ${readOnly ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                          title={isCompleted ? "פרויקט סגור לעריכה" : "עריכה"}
                        >✏️</button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-red-600 hover:bg-red-50 shadow-sm transition-all"
                            title="מחיקה"
                          >🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ProjectForm 
          project={editingProject} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

const ProjectForm: React.FC<{ project: Project | null; onClose: () => void }> = ({ project, onClose }) => {
  const { state, actions } = useProjectSystem();
  const [formData, setFormData] = useState<Partial<Project>>(project || {
    name: '',
    clientName: '',
    status: ProjectStatus.PLANNING,
    plannedStart: new Date().toISOString().split('T')[0],
    plannedEnd: new Date().toISOString().split('T')[0],
    totalBudget: 0,
    managerId: state.currentUser?.id || '',
    isDeleted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actions.upsertProject(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black text-slate-800">{project ? 'עריכת פרויקט' : 'פרויקט חדש'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">שם הפרויקט</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">לקוח / עמותה</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">סטטוס</label>
              <select 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}
              >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">תקציב כולל (₪)</label>
              <input 
                type="number" required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.totalBudget}
                onChange={e => setFormData({...formData, totalBudget: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">תאריך התחלה</label>
              <input 
                type="date" required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.plannedStart}
                onChange={e => setFormData({...formData, plannedStart: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase">תאריך סיום</label>
              <input 
                type="date" required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.plannedEnd}
                onChange={e => setFormData({...formData, plannedEnd: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-6 flex gap-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">שמור פרויקט</button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
};
