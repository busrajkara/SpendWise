import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, AlertTriangle } from 'lucide-react';
import useDashboardStats from '../hooks/useDashboardStats';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6'];

const Dashboard = () => {
  const { summary, categoryBreakdown, dailyTrends, forecast, loading, error } = useDashboardStats();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hoş geldin, {user?.username} 👋</h1>
        <p className="text-slate-400">İşte finansal genel bakışın</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Toplam Gelir</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                ${summary.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-500 mt-1">
                ${summary.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <ArrowDownCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Mevcut Bakiye</p>
              <p className={`text-2xl font-bold mt-1 ${summary.netBalance >= 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                ${summary.netBalance.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Analiz Section */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm col-span-2 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-2">Akıllı Analiz</h2>
            <p className="text-sm text-slate-400 mb-4">Ay sonu tahmini ve harcama karşılaştırması</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Şu anki harcama</p>
                <p className="text-xl font-bold text-red-400">
                  ₺{forecast.currentSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Ay sonu tahmini</p>
                <p className="text-xl font-bold text-indigo-400">
                  ₺{forecast.predictedSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Tahmini kalan bütçe</p>
                <p className={`text-xl font-bold ${forecast.remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ₺{forecast.remainingBudget.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {forecast.predictedSpending > summary.totalIncome ? (
                <div className="flex items-start space-x-3 text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Dikkat! Bu ay bütçenizi aşabilirsiniz.</p>
                    <p className="text-sm text-red-300">
                      Tahmini harcamanız, bu ayki toplam gelirinizden yüksek görünüyor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 text-emerald-400 bg-emerald-500/5 border border-emerald-500/30 rounded-lg px-4 py-3">
                  <Wallet className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">İyi gidiyorsunuz! Bütçeniz kontrol altında.</p>
                    <p className="text-sm text-emerald-300">
                      Tahmini harcamanız, bu ayki toplam gelirinizin altında kalıyor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-3">Geçen Ay Karşılaştırma</h3>
            <p className="text-sm text-slate-400 mb-4">
              Bu ayın şu ana kadarki harcaması ile geçen ayın aynı dönemi karşılaştırması.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Bu ay (şu ana kadar)</span>
                <span className="font-semibold text-slate-100">
                  ₺{forecast.currentSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Geçen ay aynı dönem</span>
                <span className="font-semibold text-slate-100">
                  ₺{forecast.lastPeriodSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-4">
              {forecast.lastPeriodSpending === 0 ? (
                <p className="text-sm text-slate-400">
                  Geçen ayın aynı dönemi için harcama verisi bulunamadı.
                </p>
              ) : (
                <p
                  className={`text-sm font-medium ${
                    forecast.percentageChange > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {forecast.percentageChange > 0
                    ? `Geçen aya göre %${Math.abs(forecast.percentageChange).toFixed(
                        1
                      )} daha fazla harcıyorsunuz.`
                    : `Geçen aya göre %${Math.abs(forecast.percentageChange).toFixed(
                        1
                      )} daha az harcadınız.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Harcama Trendleri (Son 30 Gün)</h2>
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
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value) => [`$${value}`, 'Harcanan']}
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

        {/* Category Breakdown Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Kategoriye Göre Giderler</h2>
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
                        formatter={(value) => `$${value.toFixed(2)}`}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="w-full md:w-1/2 mt-4 md:mt-0 overflow-y-auto max-h-60 pr-2">
                <div className="space-y-3">
                    {categoryBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-slate-300">{item.category}</span>
                            </div>
                            <span className="font-medium text-slate-100">${item.total.toFixed(2)}</span>
                        </div>
                    ))}
                    {categoryBreakdown.length === 0 && (
                        <div className="text-center text-slate-500 py-4">
                            Gider verisi bulunamadı
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
