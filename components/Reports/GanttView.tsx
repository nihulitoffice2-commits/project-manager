
import React from 'react';
import { useData } from '../../context/DataContext';
import { addDays, format, isWithinInterval } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const GanttView: React.FC = () => {
  const { tasks } = useData();
  
  // Fix: Replacing startOfDay(new Date()) with native Date manipulation to fix export error
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Fix: Replacing subDays(today, 10) with addDays(today, -10) to fix export error
  const startDate = addDays(today, -10);
  const days = Array.from({ length: 90 }, (_, i) => addDays(startDate, i));

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">ציר זמן (Gantt)</h2>
        <p className="text-slate-500 font-medium">פריסת משימות ל-90 יום קדימה</p>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <div className="w-64 flex-shrink-0 p-4 font-black text-slate-400 text-[10px] uppercase border-l border-slate-100">
            משימה
          </div>
          <div className="flex-1 overflow-x-auto flex custom-scrollbar">
            {days.map(day => (
              <div 
                key={day.toISOString()} 
                className={`w-12 flex-shrink-0 flex flex-col items-center justify-center py-4 border-l border-slate-100/30 text-[9px] font-black ${
                  day.toDateString() === today.toDateString() ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                <span>{format(day, 'MM')}</span>
                <span className="text-[12px]">{format(day, 'dd')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tasks.map(task => {
            // Fix: Replacing startOfDay with native Date manipulation to fix export error
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            const dayOffset = days.findIndex(d => d.toDateString() === taskDate.toDateString());

            return (
              <div key={task.id} className="flex border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                <div className="w-64 flex-shrink-0 p-4 border-l border-slate-50 flex flex-col">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate">{task.title}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">שלב: {task.phase}</span>
                </div>
                <div className="flex-1 relative h-16 overflow-x-auto overflow-y-hidden flex">
                  {dayOffset !== -1 && (
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-full flex items-center justify-center px-4 shadow-sm border-r-4 ${
                        task.isRedFlag ? 'bg-red-500 border-red-700 text-white' : 'bg-blue-100 border-blue-500 text-blue-700'
                      }`}
                      style={{ 
                        left: `${dayOffset * 48}px`,
                        width: 'auto',
                        minWidth: '40px'
                      }}
                    >
                      {task.isRedFlag ? <AlertCircle size={14} className="animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  )}
                  {/* Grid background */}
                  {days.map(d => (
                    <div key={d.toISOString()} className="w-12 h-full border-l border-slate-100/10 flex-shrink-0" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttView;