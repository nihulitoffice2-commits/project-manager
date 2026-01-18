
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl transition-shadow duration-300">
      <div className={`w-16 h-16 rounded-3xl ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        {trend && <p className="text-green-500 text-xs mt-1 font-bold">{trend}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
