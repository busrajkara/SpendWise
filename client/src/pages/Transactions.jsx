import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, X, Loader2, Download } from 'lucide-react';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
  });
  const [modalError, setModalError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const quick = params.get('quick');
    if (quick && !isModalOpen) {
      setIsModalOpen(true);
      navigate('/transactions', { replace: true });
    }
  }, [location.search, isModalOpen, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, categoriesRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(t => t.id !== id));
      } catch (err) {
        alert('İşlem silinemedi');
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get('/transactions/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Rapor indirilemedi');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      await api.post('/transactions', {
        ...formData,
        recurringInterval: formData.isRecurring ? 'MONTHLY' : null,
      });
      setIsModalOpen(false);
      setFormData({
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        isRecurring: false,
      });
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.warning || err.response?.data?.error || 'İşlem oluşturulamadı');
      if (err.response?.status === 201 && err.response?.data?.warning) {
        alert(`İşlem eklendi ancak: ${err.response.data.warning}`);
        setIsModalOpen(false);
        fetchData();
      }
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white">İşlemler</h1>
        <div className="flex space-x-3">
            <button 
              onClick={handleDownload}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Download className="w-5 h-5" />
              <span>Rapor İndir</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni İşlem Ekle</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category.type === 'INCOME' ? '#10b981' : '#ef4444' }}></span>
                      <span>{t.category.name}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span>{t.description || '-'}</span>
                      {t.isRecurring && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                          Otomatik
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-medium ${t.category.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.category.type === 'INCOME' ? '+' : '-'}₺{Math.abs(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-slate-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    İşlem bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md p-6 shadow-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6">Yeni İşlem Ekle</h2>
            
            {modalError && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tutar</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Seçiniz</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'INCOME' ? 'Gelir' : 'Gider'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isRecurring: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Her ay tekrarla?</span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
