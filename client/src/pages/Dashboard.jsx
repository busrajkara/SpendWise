import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, AlertTriangle, Info, Sparkles, PlusCircle, MinusCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardStats from '../hooks/useDashboardStats';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import SavingsGoals from '../components/SavingsGoals';
import SpendingHeatmap from '../components/SpendingHeatmap';
import NetWorthProjection from '../components/NetWorthProjection';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6'];

const Dashboard = () => {
  const { summary, categoryBreakdown, dailyTrends, forecast, budgetStatus, loading, error } = useDashboardStats();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrint = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0f172a' });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `SpendWise-Dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      toast.success('Dashboard snapshot saved!');
    } catch (err) {
      toast.error('Failed to capture dashboard');
    }
  };

  // Financial Health Calculation

  // Financial Health Calculation
  const savingsRate = summary.totalIncome > 0 
    ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 
    : 0;
  
  const budgetAdherence = budgetStatus.length > 0
    ? 100 - (budgetStatus.filter(b => b.percentage > 100).length / budgetStatus.length) * 100
    : 100;

  const financialScore = Math.min(100, Math.max(0, (savingsRate * 0.6) + (budgetAdherence * 0.4)));

  // Advice Logic
  const foodCategory = categoryBreakdown.find(c => c.category.toLowerCase().includes('food') || c.category.toLowerCase().includes('market') || c.category.toLowerCase().includes('yemek'));
  const foodPercentage = foodCategory && summary.totalExpenses > 0 
    ? (foodCategory.total / summary.totalExpenses) * 100 
    : 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const hasAnyActivity =
    summary.totalIncome !== 0 ||
    summary.totalExpenses !== 0 ||
    dailyTrends.length > 0;

  const isEmpty = !hasAnyActivity;

  const hasBudgetData = Array.isArray(budgetStatus) && budgetStatus.length > 0;

  const alertBudget = hasBudgetData
    ? budgetStatus.reduce((max, item) => {
        if (!max) return item;
        return item.percentage > max.percentage ? item : max;
      }, null)
    : null;

  const hasCriticalBudget = alertBudget && alertBudget.percentage > 90;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing your finances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div 
      id="dashboard-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, {user?.username || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here is your financial summary in TL (₺).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user?.username}</p>
              <p className="text-xs text-slate-500 leading-none mt-1">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Snapshot</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-semibold text-white">
              Your financial journey starts here!
            </h2>
            <p className="text-slate-400">
              Add your first income or expense to see the magic.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigate('/transactions?quick=income')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <PlusCircle className="w-6 h-6 mr-2" />
              Add Income
            </button>
            <button
              onClick={() => navigate('/transactions?quick=expense')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-lg shadow-lg shadow-red-500/20 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <MinusCircle className="w-6 h-6 mr-2" />
              Add Expense
            </button>
          </div>
        </div>
      ) : (
        <>
      <div
        className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
          hasCriticalBudget
            ? 'border-red-500/40 bg-red-500/10 text-red-100'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
        }`}
      >
        {hasCriticalBudget ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="leading-snug">
                ⚠️ Alert: You have exceeded 90% of your {alertBudget.category} budget!
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 flex-shrink-0" />
              <span className="leading-snug">✅ Your finances are on track. Keep it up!</span>
            </div>
          </div>
        )}
      </div>
      {/* Pro Features: Advice & Health Score */}
      {!isEmpty && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Financial Coach
                </h2>
                <div className="space-y-3">
                  {foodPercentage > 40 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="flex items-start gap-2">
                        <span className="text-xl">💡</span>
                        <span>
                          <strong>Pro Tip:</strong> Your food expenses are high ({foodPercentage.toFixed(0)}%) this month. Consider meal prepping to save!
                        </span>
                      </p>
                    </div>
                  )}
                  {summary.netBalance > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="flex items-start gap-2">
                        <span className="text-xl">⭐</span>
                        <span>
                          <strong>Great job!</strong> You are in the green (+₺{summary.netBalance.toFixed(2)}). Want to invest your surplus?
                        </span>
                      </p>
                    </div>
                  )}
                  {foodPercentage <= 40 && summary.netBalance <= 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <p className="flex items-start gap-2">
                        <span className="text-xl">📊</span>
                        <span>
                          Keep tracking your expenses to unlock more personalized insights!
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Financial Health Score</h3>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className={`transition-all duration-1000 ease-out ${
                      financialScore >= 80 ? 'stroke-emerald-500' : financialScore >= 50 ? 'stroke-indigo-500' : 'stroke-orange-500'
                    }`}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="351.86"
                    strokeDashoffset={351.86 - (351.86 * financialScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${
                      financialScore >= 80 ? 'text-emerald-500' : financialScore >= 50 ? 'text-indigo-500' : 'text-orange-500'
                    }`}>
                    {financialScore.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 uppercase font-bold">/ 100</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Based on budget adherence & savings rate
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SavingsGoals currentBalance={summary.netBalance} />
            <div className="space-y-6">
              <NetWorthProjection 
                currentBalance={summary.netBalance} 
                monthlySavings={summary.totalIncome - summary.totalExpenses} 
              />
              <SpendingHeatmap dailyTrends={dailyTrends} />
            </div>
          </div>
        </>
      )}

      {/* Existing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                ₺{summary.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                ₺{summary.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <ArrowDownCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Balance</p>
                <div className="relative group">
                  <Info className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 cursor-pointer" />
                  <div className="absolute left-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20">
                    <p>Total Income: ₺{summary.totalIncome.toFixed(2)}</p>
                    <p>Total Expenses: ₺{summary.totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <p className={`text-2xl font-bold mt-1 ${summary.netBalance >= 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                ₺{summary.netBalance.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg col-span-2 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Smart Insights</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">End-of-month forecast and spending comparison</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Current spending</p>
                <p className="text-xl font-bold text-red-500 dark:text-red-400">
                  ₺{forecast.currentSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">End-of-month forecast</p>
                <p className="text-xl font-bold text-indigo-500 dark:text-indigo-400">
                  ₺{forecast.predictedSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Estimated remaining budget</p>
                <p className={`text-xl font-bold ${forecast.remainingBudget < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                  ₺{forecast.remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {forecast.predictedSpending > summary.totalIncome ? (
                <div className="flex items-start space-x-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Warning: You may exceed your budget this month.</p>
                    <p className="text-sm text-red-500 dark:text-red-300">
                      Your projected spending is higher than your total income for this month.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-4 py-3">
                  <Wallet className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">You are on track. Your budget is under control.</p>
                    <p className="text-sm text-emerald-500 dark:text-emerald-300">
                      Your projected spending remains below your total income for this month.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Last Month Comparison</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Compare your spending so far this month with the same period last month.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">This month (so far)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ₺{forecast.currentSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Same period last month</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ₺{forecast.lastPeriodSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-4">
              {forecast.lastPeriodSpending === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No spending data is available for the same period last month.
                </p>
              ) : (
                <p
                  className={`text-sm font-medium ${
                    forecast.percentageChange > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'
                  }`}
                >
                  {forecast.percentageChange > 0
                    ? `You are spending ${Math.abs(forecast.percentageChange).toFixed(
                        1
                      )}% more than last month.`
                    : `You are spending ${Math.abs(forecast.percentageChange).toFixed(
                        1
                      )}% less than last month.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {hasBudgetData && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Budget Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetStatus.map((budget, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{budget.category}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    ₺{budget.spent.toFixed(2)} / ₺{budget.limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-right text-slate-500">
                  {budget.percentage.toFixed(0)}% used
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Spending Trends (Last 30 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `₺${value}`} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value) => [`₺${value}`, 'Spent']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Expenses by Category</h2>
          <div className="flex flex-col md:flex-row items-center h-80">
            <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    >
                    {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value) => `₺${value.toFixed(2)}`}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 mt-4 md:mt-0 overflow-y-auto max-h-60 pr-2">
                <div className="space-y-3">
                    {categoryBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-slate-600 dark:text-slate-300">{item.category}</span>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">₺{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                    {categoryBreakdown.length === 0 && (
                        <div className="text-center text-slate-500 py-4">
                            No expense data found
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </motion.div>
  );
};

export default Dashboard;
