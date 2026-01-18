
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatDate, formatCurrency } from '../../services/logic';
import { PROJECT_STATUS_COLORS } from '../../constants';
import { Phone, Mail, User, ArrowRight } from 'lucide-react';
import Modal from '../UI/Modal';
import ProjectForm from '../Forms/ProjectForm';

const ProjectList: React.FC = () => {
  const { projects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">מרכז פרויקטים</h2>
          <p className="text-slate-500 font-medium">ניהול ומעקב אחר כל הפעילות של העמותה</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          פרויקט חדש +
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="הקמת פרויקט חדש">
        <ProjectForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <div className="grid grid-cols-1 gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">אין פרויקטים להצגה. צור את הפרויקט הראשון שלך!</p>
          </div>
        ) : projects.map(project => (
          <div key={project.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col lg:flex-row gap-8 hover:shadow-xl transition-all duration-300">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${PROJECT_STATUS_COLORS[project.status]}`}>
                  {project.status}
                </span>
                <span className="text-slate-400 font-medium text-sm">#{project.id.slice(-4)}</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-800">{project.name}</h3>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{project.type}</p>
              </div>

              <div className="flex gap-10 items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-tighter">יעד פיננסי</p>
                  <p className="text-lg font-black text-slate-700">{formatCurrency(project.financialTarget)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-tighter">שולם</p>
                  <p className="text-lg font-black text-green-600">{formatCurrency(project.paidAmount || 0)}</p>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[150px] overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((project.paidAmount || 0) / (project.financialTarget || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:w-72 p-6 bg-slate-50 rounded-3xl space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <User size={16} /> מנהל עמותה
              </h4>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700">{project.managerName || 'לא הוזן'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={14} className="text-blue-500" />
                  <span>{project.managerPhone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={14} className="text-blue-500" />
                  <span className="truncate">{project.managerEmail || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:px-4">
              <button className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
