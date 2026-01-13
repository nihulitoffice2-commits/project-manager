
import React, { useMemo } from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { parseISO, format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { isIsraelWorkday } from '../utils/dateUtils';
import { TaskStatus } from '../types';

export const GanttView: React.FC = () => {
  const { state } = useProjectSystem();
  
  // Timeline setup: 4 weeks range starting from current Sunday
  const timelineStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const timelineEnd = addDays(timelineStart, 27);
  const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });

  const tasksToDisplay = useMemo(() => {
    return state.tasks.filter(t => {
      const p = state.projects.find(proj => proj.id === t.projectId);
      return p && !p.isDeleted;
    });
  }, [state.tasks, state.projects]);

  const tasksInRangeCount = useMemo(() => {
    return tasksToDisplay.filter(t => {
        const start = parseISO(t.plannedStart);
        const end = parseISO(t.plannedEnd);
        return (start <= timelineEnd && end >= timelineStart);
    }).length;
  }, [tasksToDisplay, timelineStart, timelineEnd]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
        <div className="font-bold text-slate-600 flex items-center gap-2">
            <span>📅</span> טווח תצוגה: {format(timelineStart, 'dd/MM/yy')} - {format(timelineEnd, 'dd/MM/yy')}
        </div>
        {tasksToDisplay.length > tasksInRangeCount && (
            <div className="text-amber-600 font-black animate-pulse">
                ⚠️ {tasksToDisplay.length - tasksInRangeCount} משימות מחוץ לטווח התצוגה
            </div>
        )}
      </div>
      
      <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10 shadow-sm">
        <div className="w-64 p-5 font-black text-slate-800 border-l border-slate-100 shrink-0 bg-slate-50/50">משימה / פרויקט</div>
        <div className="flex-1 overflow-x-auto flex no-scrollbar">
          {days.map(day => (
            <div 
              key={day.toISOString()} 
              className={`w-10 h-16 border-l border-slate-50 flex flex-col items-center justify-center text-[10px] shrink-0 ${
                !isIsraelWorkday(day) ? 'bg-slate-100/50 text-slate-300' : 'text-slate-500'
              } ${isSameDay(day, new Date()) ? 'bg-blue-50/50' : ''}`}
            >
              <span className="font-bold">{format(day, 'dd/MM')}</span>
              <span className="font-black text-[9px] mt-0.5">{['א','ב','ג','ד','ה','ו','ש'][day.getDay()]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tasksToDisplay.length === 0 ? (
          <div className="p-32 text-center text-slate-400 font-medium">אין משימות להצגה בטווח התאריכים הנוכחי</div>
        ) : (
          tasksToDisplay.map(task => {
            const start = parseISO(task.plannedStart);
            const end = parseISO(task.plannedEnd);
            const project = state.projects.find(p => p.id === task.projectId);
            
            return (
              <div key={task.id} className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <div className="w-64 p-4 border-l border-slate-50 shrink-0 flex flex-col justify-center">
                   <span className="text-sm font-black text-slate-800 truncate" title={task.name}>{task.name}</span>
                   <span className="text-[10px] text-slate-400 font-bold truncate">{project?.name}</span>
                </div>
                <div className="flex-1 relative h-16 flex items-center shrink-0">
                  {days.map((day, idx) => {
                    const isStart = isSameDay(day, start);
                    const isTaskDay = (isSameDay(day, start) || day > start) && (isSameDay(day, end) || day < end);
                    
                    return (
                      <div key={idx} className={`w-10 h-full border-l border-slate-50/30 shrink-0 flex items-center justify-center ${isSameDay(day, new Date()) ? 'bg-blue-50/20' : ''}`}>
                        {isTaskDay && (
                          <div 
                            className={`h-7 w-full shadow-sm relative z-0 transition-all ${isStart ? 'rounded-r-full' : ''} ${isSameDay(day, end) ? 'rounded-l-full' : ''} ${
                               task.status === TaskStatus.DONE ? 'bg-emerald-500 shadow-emerald-100' : 
                               task.hasIssue ? 'bg-red-500 shadow-red-100' : 
                               task.status === TaskStatus.STUCK ? 'bg-amber-500 shadow-amber-100' : 'bg-blue-500 shadow-blue-100'
                            }`}
                          >
                            {isStart && <div className="absolute -top-5 right-0 text-[8px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">התחלה</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-lg shadow-sm"></div> בביצוע</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-lg shadow-sm"></div> הושלם</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded-lg shadow-sm"></div> תקוע</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-lg shadow-sm"></div> בעיה / איחור</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-lg"></div> סוף שבוע</div>
      </div>
    </div>
  );
};
