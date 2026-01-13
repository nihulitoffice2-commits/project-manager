
import React from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { UserRole } from '../types';

interface NavItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode; currentView: string; setView: (v: string) => void }> = ({ children, currentView, setView }) => {
  const { state, actions } = useProjectSystem();

  const handleLogout = () => {
    actions.logout();
  };

  if (!state.currentUser) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-extrabold text-blue-600 flex items-center gap-2">
            <span>📊</span> CampaignFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">ניהול פרויקטים לעמותות</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem label="דאשבורד" icon="🏠" active={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem label="פרויקטים" icon="📁" active={currentView === 'projects'} onClick={() => setView('projects')} />
          <NavItem label="טבלת משימות" icon="📋" active={currentView === 'tasks'} onClick={() => setView('tasks')} />
          <NavItem label="לוח גאנט" icon="📉" active={currentView === 'gantt'} onClick={() => setView('gantt')} />
          <NavItem label="קנבן" icon="🧱" active={currentView === 'kanban'} onClick={() => setView('kanban')} />
          <NavItem label="לוח שנה" icon="📅" active={currentView === 'calendar'} onClick={() => setView('calendar')} />
          <NavItem label="תשלומים" icon="💰" active={currentView === 'payments'} onClick={() => setView('payments')} />
          <NavItem label="יומן פעילות" icon="📝" active={currentView === 'audit'} onClick={() => setView('audit')} />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {state.currentUser.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{state.currentUser.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{state.currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-right text-sm text-red-500 hover:text-red-600 font-medium px-2 py-1 transition-colors"
          >
            🚪 יציאה מהמערכת
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {currentView === 'dashboard' && 'סקירת מערכת'}
            {currentView === 'projects' && 'ניהול פרויקטים'}
            {currentView === 'tasks' && 'פירוט משימות'}
            {currentView === 'gantt' && 'לוח גאנט (תכנון מול ביצוע)'}
            {currentView === 'kanban' && 'ניהול משימות חזותי'}
            {currentView === 'calendar' && 'יומן משימות'}
            {currentView === 'payments' && 'תקציב ותשלומים'}
            {currentView === 'audit' && 'יומן שינויים במערכת'}
          </h2>
          <div className="flex items-center gap-4">
             <button 
                disabled
                className="p-2 text-slate-300 cursor-not-allowed opacity-50"
                title="התראות מערכת יהיו זמינות בגרסה הבאה"
             >🔔</button>
             <button 
                disabled
                className="p-2 text-slate-300 cursor-not-allowed opacity-50"
                title="הגדרות ארגון יהיו זמינות למנהלי מערכת בלבד"
             >⚙️</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
