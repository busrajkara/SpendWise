import { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    limit: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get('/stats/budgets-status'),
        api.get('/categories')
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      await api.post('/budgets', {
        ...formData,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setIsModalOpen(false);
      setFormData({ categoryId: '', limit: '' });
      fetchData();
    } catch (err) {
      alert('Bütçe oluşturulurken bir hata oluştu');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage) => {
    if (percentage < 70) return 'text-emerald-500';
    if (percentage < 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Bütçeler</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Bütçe Belirle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => (
          <div key={budget.category} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{budget.category}</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Harcanan: <span className="text-white">₺{budget.spent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  {' / '}
                  <span className="text-slate-500">₺{budget.limit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
              <div className={`text-xl font-bold ${getTextColor(budget.percentage)}`}>
                %{budget.percentage.toFixed(0)}
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
            
            <p className="text-sm text-slate-500 mt-3 text-right">
              Kalan: ₺{Math.max(budget.remaining, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}

        {budgets.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            Henüz belirlenmiş bir bütçe yok.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Bütçe Belirle</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Seçiniz</option>
                  {categories
                    .filter(c => c.type === 'EXPENSE')
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Limit (₺)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
