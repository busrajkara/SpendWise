import { motion } from 'framer-motion';

const SpendingHeatmap = ({ dailyTrends }) => {
  // Normalize data for last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const trendMap = dailyTrends.reduce((acc, item) => {
    acc[item.date] = item.total;
    return acc;
  }, {});

  const getIntensity = (amount) => {
    if (!amount) return 'bg-slate-100 dark:bg-slate-800';
    if (amount < 100) return 'bg-emerald-200 dark:bg-emerald-900/40';
    if (amount < 500) return 'bg-emerald-300 dark:bg-emerald-700/60';
    if (amount < 1000) return 'bg-emerald-400 dark:bg-emerald-600/80';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Spending Intensity (30 Days)</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const amount = trendMap[date] || 0;
          return (
            <motion.div
              key={date}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`aspect-square rounded-md ${getIntensity(amount)} relative group cursor-pointer`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {new Date(date).toLocaleDateString()}: ₺{amount.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm" />
        <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900/40 rounded-sm" />
        <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600/80 rounded-sm" />
        <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded-sm" />
        <span>More</span>
      </div>
    </div>
  );
};

export default SpendingHeatmap;
