import { useState, useEffect } from 'react';
import api from '../services/api';

const useDashboardStats = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [summaryRes, categoriesRes, trendsRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/stats/categories'),
          api.get('/stats/trends'),
        ]);

        setSummary(summaryRes.data);
        setCategoryBreakdown(categoriesRes.data);
        setDailyTrends(trendsRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { summary, categoryBreakdown, dailyTrends, loading, error };
};

export default useDashboardStats;