
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  PieChart, 
  CreditCard, 
  Settings,
  Flag
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'projects', label: 'פרויקטים', icon: Briefcase },
    { id: 'tasks', label: 'משימות', icon: CheckSquare },
    { id: 'crm', label: 'אנשי קשר', icon: Users },
    { id: 'finance', label: 'פיננסים', icon: CreditCard },
    { id: 'reports', label: 'דוחות', icon: PieChart },
  ];

  return (
    <div className="w-64 h-screen bg-white border-l border-slate-200 sticky top-0 flex flex-col p-4">
      <div className="mb-12 flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Flag size={20} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">CampaignFlow</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        >
          <Settings size={20} />
          <span className="font-semibold">הגדרות</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
