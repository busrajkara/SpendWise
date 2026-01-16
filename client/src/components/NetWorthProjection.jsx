import { TrendingUp } from 'lucide-react';

const NetWorthProjection = ({ currentBalance, monthlySavings }) => {
  const projectedBalance = currentBalance + (monthlySavings * 6);
  const isPositive = projectedBalance >= currentBalance;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
          <TrendingUp className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">6-Month Projection</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Projected Balance</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₺{projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Based on your current monthly savings rate of <span className={monthlySavings >= 0 ? 'text-emerald-500 font-medium' : 'text-red-500 font-medium'}>₺{monthlySavings.toLocaleString()}</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetWorthProjection;
