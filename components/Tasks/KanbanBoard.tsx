import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TaskStatus, TaskPriority } from '../../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../constants';
import { AlertCircle, Calendar, Briefcase, RefreshCw, Layers } from 'lucide-react';
import { formatDate } from '../../services/logic';
import Modal from '../UI/Modal';
import TaskForm from '../Forms/TaskForm';

const KanbanBoard: React.FC = () => {
  const { tasks, projects, updateTask } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus>(TaskStatus.TODO);

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

  const activeTasks = getTasksByStatus(activeTab);

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">ניהול משימות</h2>
          <p className="text-slate-500 font-medium">מעקב אחר התקדמות וביצועים לפי שלבים</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          משימה חדשה +
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-2 bg-slate-100/80 rounded-[2rem] gap-2 overflow-x-auto no-scrollbar">
        {columns.map((status) => {
          const count = getTasksByStatus(status).length;
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
                isActive 
                ? 'bg-white text-blue-600 shadow-md scale-[1.02]' 
                : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                status === TaskStatus.TODO ? 'bg-slate-400' :
                status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' :
                status === TaskStatus.STUCK ? 'bg-red-500' : 'bg-green-500'
              }`} />
              {status}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="יצירת משימה חדשה">
        <TaskForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Active Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400">
            <Layers size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">אין משימות בסטטוס "{activeTab}"</p>
            <p className="text-sm">הוסף משימה חדשה או שנה סטטוס למשימה קיימת</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {activeTasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 relative group flex flex-col h-full ${
                  task.isRedFlag ? 'ring-2 ring-red-500 ring-offset-2' : ''
                } ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Header Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit max-w-[180px]">
                      <Briefcase size={12} />
                      <span className="truncate">{getProjectName(task.projectId)}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  {updatingId === task.id ? (
                    <RefreshCw size={20} className="animate-spin text-blue-500" />
                  ) : task.isRedFlag ? (
                    <div className="w-8 h-8 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                      <AlertCircle size={18} />
                    </div>
                  ) : null}
                </div>

                {/* Content */}
                <h4 className="text-xl font-black text-slate-800 mb-2 leading-tight">{task.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed flex-1">
                  {task.description || 'אין תיאור מפורט למשימה זו.'}
                </p>

                {/* Bottom Section */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                      <Calendar size={14} className="text-blue-500" />
                      <span>יעד: {formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500">CF</div>
                    </div>
                  </div>

                  {/* Red Flag Reason */}
                  {task.isRedFlag && (
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-xs font-bold text-red-700 leading-tight">
                        🚩 {task.redFlagReason}
                      </p>
                    </div>
                  )}

                  {/* Quick Status Update */}
                  <div className="pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">העבר לסטטוס:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {columns.filter(c => c !== activeTab).map(col => (
                        <button
                          key={col}
                          onClick={() => handleStatusChange(task.id, col)}
                          className="text-[10px] font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 py-2 rounded-xl transition-colors border border-slate-100"
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
