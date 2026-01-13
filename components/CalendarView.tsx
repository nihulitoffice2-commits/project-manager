
import React, { useState } from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { TaskStatus } from '../types';

export const CalendarView: React.FC = () => {
  const { state } = useProjectSystem();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksForDay = (day: Date) => 
    state.tasks.filter(t => isSameDay(new Date(t.plannedEnd), day) && !t.isDeleted);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black text-slate-800">{format(currentDate, 'MMMM yyyy')}</h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all">➡️</button>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all">⬅️</button>
          </div>
        </div>
        <button onClick={() => setCurrentDate(new Date())} className="text-sm font-bold text-blue-600 hover:underline">היום</button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-7 auto-rows-fr">
        {/* Padding for month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`pad-${i}`} className="border-b border-l border-slate-50 bg-slate-50/20"></div>
        ))}

        {days.map(day => (
          <div key={day.toISOString()} className={`min-h-[120px] p-2 border-b border-l border-slate-100 flex flex-col gap-1 transition-colors ${
            isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''
          }`}>
            <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
               isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}>{format(day, 'd')}</span>
            
            <div className="space-y-1 overflow-y-auto flex-1">
              {tasksForDay(day).map(task => (
                <div key={task.id} className={`p-1.5 rounded-lg text-[9px] font-black border leading-tight ${
                  task.status === TaskStatus.DONE ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  task.hasIssue ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  <div className="truncate">{task.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
