
import React from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { TaskStatus, Task, Priority } from '../types';

export const KanbanView: React.FC = () => {
  const { state, actions } = useProjectSystem();
  
  const tasksByStatus = (status: TaskStatus) => 
    state.tasks.filter(t => t.status === status && !t.isDeleted);

  const moveTask = async (task: Task, newStatus: TaskStatus) => {
    await actions.upsertTask({ ...task, status: newStatus });
  };

  const statuses = [
    { id: TaskStatus.NOT_STARTED, label: 'טרם החל', color: 'bg-slate-200' },
    { id: TaskStatus.IN_PROGRESS, label: 'בתהליך', color: 'bg-blue-500' },
    { id: TaskStatus.STUCK, label: 'תקוע', color: 'bg-amber-500' },
    { id: TaskStatus.DONE, label: 'הושלם', color: 'bg-emerald-500' },
  ];

  const totalVisibleTasks = state.tasks.filter(t => !t.isDeleted).length;

  if (totalVisibleTasks === 0) {
    return (
      <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="text-6xl mb-6">🧱</div>
        <h3 className="text-xl font-black text-slate-800">לוח המשימות ריק</h3>
        <p className="text-slate-500 mt-2 mb-6">לא נמצאו משימות פעילות להצגה בלוח.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4" dir="rtl">
      {statuses.map(status => {
        const tasks = tasksByStatus(status.id);
        return (
          <div key={status.id} className="flex flex-col min-w-[320px] w-1/4 bg-slate-100/50 rounded-2xl border border-slate-200/60 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                <h3 className="font-black text-slate-800">{status.label}</h3>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                {tasks.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {tasks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-300 text-xs font-bold">
                  אין משימות בסטטוס זה
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-r-4 border-r-blue-100">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                          task.priority === Priority.CRITICAL ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                       }`}>
                         {task.priority}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold">{task.plannedEnd}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{task.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-3 truncate">{state.projects.find(p => p.id === task.projectId)?.name}</p>
                    
                    {task.hasIssue && (
                      <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100 text-[10px] text-red-700 font-bold">
                        ⚠️ {task.issueDescription}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      <div className="flex gap-1">
                        {statuses.filter(s => s.id !== status.id).map(s => (
                          <button 
                            key={s.id}
                            onClick={() => moveTask(task, s.id)}
                            className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-400 hover:text-blue-600 border border-slate-100 transition-colors"
                            title={`העבר ל-${s.label}`}
                          >
                            {s.id === TaskStatus.DONE ? '✅' : '➡️'}
                          </button>
                        ))}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {state.currentUser?.name[0]}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
