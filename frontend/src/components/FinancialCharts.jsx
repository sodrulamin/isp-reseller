import React from 'react';

export function TrendBarChart({ trends = [] }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No trend data available
      </div>
    );
  }

  const maxValue = Math.max(
    ...trends.map(t => Math.max(t.revenue || 0, t.totalExpense || 0, t.netProfit || 0)),
    1000
  );

  const formatVal = (num) => {
    if (!num || num === 0) return '0';
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.round(num).toString();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">6-Month Financial Trend</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Revenue, Expenses and Net Profit</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-400"></span>
            <span className="text-slate-600 dark:text-slate-300">Total Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Net Profit</span>
          </div>
        </div>
      </div>

      <div className="h-72 flex items-end justify-between gap-3 pt-8 border-b border-slate-200 dark:border-slate-800 pb-2">
        {trends.map((item, idx) => {
          const revHeight = Math.min(100, Math.max(6, ((item.revenue || 0) / maxValue) * 100));
          const expHeight = Math.min(100, Math.max(6, ((item.totalExpense || 0) / maxValue) * 100));
          const profitHeight = Math.min(100, Math.max(6, ((Math.max(0, item.netProfit || 0)) / maxValue) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-2 sm:gap-2.5 h-full">
                {/* Revenue Bar */}
                <div className="flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 leading-none select-none">
                    ৳{formatVal(item.revenue)}
                  </span>
                  <div
                    style={{ height: `${revHeight}%` }}
                    title={`Revenue: ৳${Number(item.revenue || 0).toFixed(2)}`}
                    className="w-5 sm:w-6 bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600 relative cursor-pointer shadow-sm"
                  />
                </div>

                {/* Expense Bar */}
                <div className="flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 dark:text-rose-400 mb-1 leading-none select-none">
                    ৳{formatVal(item.totalExpense)}
                  </span>
                  <div
                    style={{ height: `${expHeight}%` }}
                    title={`Expenses: ৳${Number(item.totalExpense || 0).toFixed(2)}`}
                    className="w-5 sm:w-6 bg-rose-400 rounded-t-md transition-all group-hover:bg-rose-500 relative cursor-pointer shadow-sm"
                  />
                </div>

                {/* Profit Bar */}
                <div className="flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 leading-none select-none">
                    ৳{formatVal(item.netProfit)}
                  </span>
                  <div
                    style={{ height: `${profitHeight}%` }}
                    title={`Profit: ৳${Number(item.netProfit || 0).toFixed(2)}`}
                    className="w-5 sm:w-6 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600 relative cursor-pointer shadow-sm"
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 whitespace-nowrap">
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
        <h4 className="text-base font-bold text-slate-800 dark:text-white">Monthly Expense Composition</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution among mother ISP, equipment, and servicing</p>
      </div>

      {/* Progress Bar Stack */}
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
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
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mother ISP Reseller Packages</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900 dark:text-white">৳{Number(motherIsp).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({motherPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Equipment &amp; Components</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900 dark:text-white">৳{Number(equipment).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({eqPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Physical Service Operational Costs</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900 dark:text-white">৳{Number(service).toFixed(2)}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({svcPct}%)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">Total Recorded Expenses</span>
          <span className="text-rose-500 text-sm">৳{Number(total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
