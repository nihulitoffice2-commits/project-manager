import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TaskStatus, TaskPriority } from '../../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../constants';
import { AlertCircle, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import { formatDate } from '../../services/logic';
import Modal from '../UI/Modal';
import TaskForm from '../Forms/TaskForm';

const KanbanBoard: React.FC = () => {
  const { tasks, projects, updateTask } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const columns: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.STUCK,
    TaskStatus.DONE
  ];

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);
  
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'פרויקט לא ידוע';
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingId(taskId);
    try {
      await updateTask(taskId, { status: newStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">ניהול משימות</h2>
          <p className="text-slate-500 font-medium">מעקב אחר התקדמות שלבים וביצועים בזמן אמת</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          משימה חדשה +
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="יצירת משימה חדשה">
        <TaskForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(status => (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-[2.5rem] p-4">
            <div className="flex items-center justify-between px-3 mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800">{status}</h3>
                <span className="bg-white px-2 py-0.5 rounded-lg text-xs font-bold text-slate-400">
                  {getTasksByStatus(status).length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {getTasksByStatus(status).length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 font-bold text-xs italic">
                  אין משימות בסטטוס זה
                </div>
              ) : getTasksByStatus(status).map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative group ${
                    task.isRedFlag ? 'ring-2 ring-red-500 ring-offset-1' : ''
                  } ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Project Tag */}
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit max-w-full">
                    <Briefcase size={10} />
                    <span className="truncate">{getProjectName(task.projectId)}</span>
                  </div>

                  {task.isRedFlag && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-10">
                      <AlertCircle size={14} />
                    </div>
                  )}
                  
                  <div className="mb-3 flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    {updatingId === task.id && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                  </div>

                  <h4 className="font-bold text-slate-800 mb-2 leading-snug">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{task.description || 'אין תיאור למשימה'}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Calendar size={12} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-[10px]">
                      CF
                    </div>
                  </div>

                  {/* Status Switcher */}
                  <div className="pt-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">שנה סטטוס:</label>
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="w-full text-[10px] font-bold bg-slate-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  {task.isRedFlag && (
                    <div className="mt-3 p-2 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-[10px] font-black text-red-700 leading-tight flex items-center gap-1">
                        🚩 <span className="truncate">{task.redFlagReason}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
