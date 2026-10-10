import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
