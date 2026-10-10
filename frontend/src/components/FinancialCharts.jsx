import React from 'react';

export function TrendBarChart({ trends = [] }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No trend data available
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...trends.map(t => Math.max(t.revenue || 0, t.totalExpense || 0, t.netProfit || 0)),
    1000
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">6-Month Financial Trend</h4>
          <p className="text-xs text-slate-500">Revenue, Expenses and Net Profit</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            <span className="text-slate-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-400"></span>
            <span className="text-slate-600">Total Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600">Net Profit</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 pb-2">
        {trends.map((item, idx) => {
          const revHeight = Math.min(100, Math.max(4, ((item.revenue || 0) / maxValue) * 100));
          const expHeight = Math.min(100, Math.max(4, ((item.totalExpense || 0) / maxValue) * 100));
          const profitHeight = Math.min(100, Math.max(4, ((Math.max(0, item.netProfit || 0)) / maxValue) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Revenue Bar */}
                <div
                  style={{ height: `${revHeight}%` }}
                  title={`Revenue: ৳${item.revenue?.toFixed(2)}`}
                  className="w-3.5 bg-blue-500 rounded-t transition-all group-hover:bg-blue-600 relative cursor-pointer"
                />
                {/* Expense Bar */}
                <div
                  style={{ height: `${expHeight}%` }}
                  title={`Expenses: ৳${item.totalExpense?.toFixed(2)}`}
                  className="w-3.5 bg-rose-400 rounded-t transition-all group-hover:bg-rose-500 relative cursor-pointer"
                />
                {/* Profit Bar */}
                <div
                  style={{ height: `${profitHeight}%` }}
                  title={`Profit: ৳${item.netProfit?.toFixed(2)}`}
                  className="w-3.5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600 relative cursor-pointer"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-2 whitespace-nowrap">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ExpenseBreakdownChart({ motherIsp = 0, equipment = 0, service = 0 }) {
  const total = (Number(motherIsp) || 0) + (Number(equipment) || 0) + (Number(service) || 0);

  const motherPct = total > 0 ? ((motherIsp / total) * 100).toFixed(1) : 0;
  const eqPct = total > 0 ? ((equipment / total) * 100).toFixed(1) : 0;
  const svcPct = total > 0 ? ((service / total) * 100).toFixed(1) : 0;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-800">Monthly Expense Composition</h4>
        <p className="text-xs text-slate-500">Distribution among mother ISP, equipment, and servicing</p>
      </div>

      {/* Progress Bar Stack */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${motherPct}%` }}
          className="bg-indigo-600 transition-all hover:opacity-90"
          title={`Mother ISP Packages: ৳${motherIsp} (${motherPct}%)`}
        />
        <div
          style={{ width: `${eqPct}%` }}
          className="bg-amber-500 transition-all hover:opacity-90"
          title={`Equipment Purchases: ৳${equipment} (${eqPct}%)`}
        />
        <div
          style={{ width: `${svcPct}%` }}
          className="bg-rose-500 transition-all hover:opacity-90"
          title={`Physical Service: ৳${service} (${svcPct}%)`}
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span className="font-medium text-slate-700">Mother ISP Reseller Packages</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900">৳{Number(motherIsp).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({motherPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="font-medium text-slate-700">Equipment &amp; Components</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900">৳{Number(equipment).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({eqPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="font-medium text-slate-700">Physical Service Operational Costs</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900">৳{Number(service).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({svcPct}%)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Total Recorded Expenses</span>
          <span className="text-rose-600 text-sm">৳{Number(total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
