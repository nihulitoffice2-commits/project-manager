
import React, { useState, useMemo } from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { Task, TaskStatus, Priority, UserRole } from '../types';
import { isTaskOverdue, isPlannedUntilTodayNotDone } from '../utils/dateUtils';
import { TaskForm } from './TaskForm';

export const TaskTable: React.FC = () => {
  const { state, actions } = useProjectSystem();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
      const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      if (filter === 'overdue') matchesFilter = isTaskOverdue(task.plannedEnd, task.status);
      if (filter === 'plannedTodayNotDone') matchesFilter = isPlannedUntilTodayNotDone(task.plannedEnd, task.status);
      if (filter === 'withIssue') matchesFilter = task.hasIssue;
      if (filter === 'overdueWithIssue') matchesFilter = isTaskOverdue(task.plannedEnd, task.status) && task.hasIssue;
      if (filter === 'notDone') matchesFilter = task.status !== TaskStatus.DONE;
      if (filter === 'done') matchesFilter = task.status === TaskStatus.DONE;
      
      return matchesProject && matchesSearch && matchesFilter && !task.isDeleted;
    });
  }, [state.tasks, filter, search, selectedProjectId]);

  const resetFilters = () => {
    setFilter('all');
    setSearch('');
    setSelectedProjectId('all');
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (state.currentUser?.role === UserRole.VIEWER) return;
    await actions.upsertTask({ ...task, status: newStatus });
  };

  const canEdit = state.currentUser?.role !== UserRole.VIEWER;
  const isAdmin = state.currentUser?.role === UserRole.SYS_ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">ניהול משימות</h2>
        <button 
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          disabled={!canEdit}
          className={`bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          title={!canEdit ? "אין לך הרשאות ליצירת משימות" : ""}
        >
          ➕ משימה חדשה
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <span className="absolute right-4 top-3 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="חפש משימה לפי שם..." 
              className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 font-bold text-slate-700"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="all">כל הפרויקטים</option>
            {state.projects.filter(p => !p.isDeleted).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'כל המשימות' },
            { id: 'plannedTodayNotDone', label: 'להיום' },
            { id: 'overdue', label: 'באיחור' },
            { id: 'withIssue', label: 'עם בעיה' },
            { id: 'overdueWithIssue', label: 'באיחור + בעיה' },
            { id: 'notDone', label: 'בביצוע' },
            { id: 'done', label: 'שהושלמו' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === f.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-32 text-center space-y-6">
            <div className="text-7xl">🔍</div>
            <div>
              <p className="text-xl font-black text-slate-800">לא נמצאו משימות תואמות</p>
              <p className="text-slate-500 mt-1">נסה לשנות את הסינון או החיפוש</p>
            </div>
            <button 
              onClick={resetFilters}
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              נקה את כל הפילטרים
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-100 tracking-widest">
                <tr>
                  <th className="px-6 py-5">משימה</th>
                  <th className="px-6 py-5">פרויקט</th>
                  <th className="px-6 py-5">סטטוס</th>
                  <th className="px-6 py-5">עדיפות</th>
                  <th className="px-6 py-5">סיום מתוכנן</th>
                  <th className="px-6 py-5">בעיה</th>
                  <th className="px-6 py-5 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const project = state.projects.find(p => p.id === task.projectId);
                  const isOverdue = isTaskOverdue(task.plannedEnd, task.status);
                  const isProjectCompleted = project?.status === 'הושלם';
                  const disabled = !canEdit || isProjectCompleted;

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800">{task.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{task.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{project?.name || 'נמחק'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={task.status}
                          disabled={disabled}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`text-[11px] font-black px-4 py-1.5 rounded-full border-0 focus:ring-4 focus:ring-blue-100 transition-all ${
                            task.status === TaskStatus.DONE ? 'bg-emerald-100 text-emerald-700' :
                            task.status === TaskStatus.STUCK ? 'bg-amber-100 text-amber-700' :
                            task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                          {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tight ${
                          task.priority === Priority.CRITICAL ? 'bg-red-600 text-white shadow-sm shadow-red-200' :
                          task.priority === Priority.HIGH ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                          {task.plannedEnd}
                        </div>
                        {isOverdue && <div className="text-[9px] font-black text-red-400 uppercase">איחור ⚠️</div>}
                      </td>
                      <td className="px-6 py-4">
                        {task.hasIssue ? (
                          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 cursor-help group/issue relative">
                            🚫
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/issue:opacity-100 transition-opacity z-10 pointer-events-none text-center">
                              {task.issueDescription}
                            </div>
                          </div>
                        ) : <span className="text-slate-200">-</span>}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingTask(task); setShowForm(true); }}
                            disabled={disabled}
                            className={`p-2 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                            title={disabled ? "אין הרשאה או פרויקט סגור" : "עריכה"}
                          >✏️</button>
                          {isAdmin && (
                            <button 
                              onClick={() => actions.deleteTask(task.id)}
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
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm 
          task={editingTask} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};
