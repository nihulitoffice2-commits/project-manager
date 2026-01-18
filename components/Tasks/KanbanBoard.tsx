
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TaskStatus, TaskPriority } from '../../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../constants';
import { AlertCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../services/logic';
import Modal from '../UI/Modal';
import TaskForm from '../Forms/TaskForm';

const KanbanBoard: React.FC = () => {
  const { tasks } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.STUCK,
    TaskStatus.DONE
  ];

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

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
          <div key={status} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-[2rem] p-4">
            <div className="flex items-center justify-between px-3 mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800">{status}</h3>
                <span className="bg-white px-2 py-0.5 rounded-lg text-xs font-bold text-slate-400">
                  {getTasksByStatus(status).length}
                </span>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-slate-400 hover:text-slate-600">+</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {getTasksByStatus(status).length === 0 ? (
                <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-300 font-bold text-xs">
                  אין משימות
                </div>
              ) : getTasksByStatus(status).map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group ${
                    task.isRedFlag ? 'ring-2 ring-red-500 ring-offset-2' : ''
                  }`}
                >
                  {task.isRedFlag && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce z-10">
                      <AlertCircle size={16} />
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 mb-2">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Calendar size={12} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-[10px]">
                      CF
                    </div>
                  </div>

                  {task.isRedFlag && (
                    <div className="mt-3 p-2 bg-red-50 rounded-xl">
                      <p className="text-[10px] font-black text-red-700 leading-tight">🚩 {task.redFlagReason}</p>
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
