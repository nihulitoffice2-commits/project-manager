
import React from 'react';
import { useData } from '../../context/DataContext';
import KpiCard from './KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, Briefcase } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { projects, tasks } = useData();

  const activeProjectsCount = projects.filter(p => p.status === 'פעיל').length;
  const overdueTasks = tasks.filter(t => t.status !== 'הושלם' && new Date(t.dueDate) < new Date()).length;
  const redFlags = tasks.filter(t => t.isRedFlag).length;
  const completedTasks = tasks.filter(t => t.status === 'הושלם').length;

  const barData = [
    { name: 'עובד 1', tasks: 5, overdue: 2 },
    { name: 'עובד 2', tasks: 8, overdue: 0 },
    { name: 'עובד 3', tasks: 3, overdue: 1 },
    { name: 'עובד 4', tasks: 6, overdue: 3 },
  ];

  const pieData = [
    { name: 'פעיל', value: activeProjectsCount },
    { name: 'הושלם', value: projects.filter(p => p.status === 'הושלם').length },
    { name: 'בתכנון', value: projects.filter(p => p.status === 'בתכנון').length },
  ];

  const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="פרויקטים פעילים" value={activeProjectsCount} icon={<Briefcase size={28} />} color="bg-blue-600" />
        <KpiCard title="משימות באיחור" value={overdueTasks} icon={<Clock size={28} />} color="bg-red-500" />
        <KpiCard title="תקלות קריטיות (🚩)" value={redFlags} icon={<AlertTriangle size={28} />} color="bg-orange-500" />
        <KpiCard title="משימות שהושלמו" value={completedTasks} icon={<CheckCircle2 size={28} />} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">ניתוח עומסי עבודה</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="משימות פעילות" />
                <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="באיחור" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 text-slate-800">סטטוס פרויקטים</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 text-slate-800">משימות דחופות ותקלות (🚩)</h3>
        <div className="space-y-4">
          {tasks.filter(t => t.isRedFlag || t.priority === 'דחוף').map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-r-4 border-red-500">
              <div className="flex items-center gap-4">
                {task.isRedFlag ? <AlertTriangle className="text-red-500" size={20} /> : <Clock className="text-orange-500" size={20} />}
                <div>
                  <h4 className="font-bold text-slate-800">{task.title}</h4>
                  <p className="text-sm text-slate-500">{task.redFlagReason || 'משימה דחופה לטיפול'}</p>
                </div>
              </div>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">טפל עכשיו</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
