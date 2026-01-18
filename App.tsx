
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Layout/Sidebar';
import MainDashboard from './components/Dashboard/MainDashboard';
import ProjectList from './components/Projects/ProjectList';
import KanbanBoard from './components/Tasks/KanbanBoard';
import FinanceModule from './components/Finance/FinanceModule';
import ContactHub from './components/CRM/ContactHub';
import GanttView from './components/Reports/GanttView';
import { Bell, Search } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <MainDashboard />;
      case 'projects': return <ProjectList />;
      case 'tasks': return <KanbanBoard />;
      case 'finance': return <FinanceModule />;
      case 'crm': return <ContactHub />;
      case 'reports': return <GanttView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <p className="text-xl font-bold">מודול "{activeTab}" בבנייה</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="חפש פרויקט, משימה או איש קשר..." 
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pr-12 pl-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="text-left flex flex-col items-end">
                <span className="text-sm font-black text-slate-800 leading-tight">{currentUser?.name}</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{currentUser?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-200 overflow-hidden shadow-inner">
                <img src={currentUser?.photoURL} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
