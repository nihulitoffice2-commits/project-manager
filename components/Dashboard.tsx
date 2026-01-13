
import React from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { isTaskOverdue } from '../utils/dateUtils';
import { TaskStatus, ProjectStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { state } = useProjectSystem();
  
  const activeProjects = state.projects.filter(p => !p.isDeleted && p.status === ProjectStatus.ACTIVE);
  const totalTasks = state.tasks.filter(t => !t.isDeleted).length;
  const doneTasks = state.tasks.filter(t => !t.isDeleted && t.status === TaskStatus.DONE).length;
  const overdueTasks = state.tasks.filter(t => !t.isDeleted && isTaskOverdue(t.plannedEnd, t.status));
  const problemTasks = state.tasks.filter(t => !t.isDeleted && t.hasIssue);

  const statusData = [
    { name: 'בוצע', value: doneTasks, color: '#10b981' },
    { name: 'בביצוע', value: state.tasks.filter(t => !t.isDeleted && t.status === TaskStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'תקוע', value: state.tasks.filter(t => !t.isDeleted && t.status === TaskStatus.STUCK).length, color: '#f59e0b' },
    { name: 'טרם החל', value: state.tasks.filter(t => !t.isDeleted && t.status === TaskStatus.NOT_STARTED).length, color: '#94a3b8' },
  ];

  const financialData = state.projects.filter(p => !p.isDeleted).slice(0, 5).map(p => ({
    name: p.name,
    budget: p.totalBudget,
    paid: state.payments
        .filter(pay => pay.projectId === p.id && pay.type === 'INCOME' && pay.status === 'PAID')
        .reduce((sum, pay) => sum + pay.actualAmount, 0)
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="פרויקטים פעילים" value={activeProjects.length} icon="📁" color="blue" />
        <StatCard title="משימות באיחור" value={overdueTasks.length} icon="⚠️" color="red" />
        <StatCard title="משימות עם בעיות" value={problemTasks.length} icon="🚫" color="amber" />
        <StatCard title="התקדמות כללית" value={`${totalTasks ? Math.round((doneTasks/totalTasks)*100) : 0}%`} icon="📈" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">התפלגות סטטוס משימות</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Tracking */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">מעקב תקציבי (₪)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="budget" name="תקציב" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="paid" name="שולם" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Critical Updates Feed */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">עדכונים אחרונים ופעולות דחופות</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <h4 className="text-xs font-black text-red-500 uppercase tracking-tighter flex items-center gap-2">
               <span>⚠️</span> משימות באיחור קריטי
             </h4>
             {overdueTasks.length === 0 ? (
               <p className="text-xs text-slate-400 font-bold italic">אין משימות באיחור - מצוין!</p>
             ) : (
               overdueTasks.slice(0, 3).map(task => (
                 <div key={task.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                   <div>
                     <p className="text-sm font-black text-red-800">{task.name}</p>
                     <p className="text-[10px] text-red-600 font-bold">היה אמור להסתיים ב-{task.plannedEnd}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-black text-xs">!</div>
                 </div>
               ))
             )}
          </div>
          <div className="space-y-3">
             <h4 className="text-xs font-black text-blue-500 uppercase tracking-tighter flex items-center gap-2">
               <span>📝</span> יומן פעילות אחרון
             </h4>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 max-h-48 overflow-y-auto">
               {state.auditLogs.slice(0, 6).map(log => (
                 <div key={log.id} className="text-[10px] text-slate-600 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                   <span className="font-black text-slate-800">{log.userName}</span> {log.details}
                   <div className="text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString('he-IL')}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: 'blue' | 'red' | 'amber' | 'emerald' }> = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50',
    red: 'bg-red-50 text-red-600 border-red-100 shadow-red-50',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
  };
  return (
    <div className={`p-8 rounded-3xl border shadow-sm flex items-center gap-6 transition-all hover:scale-105 ${colors[color]}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
};
