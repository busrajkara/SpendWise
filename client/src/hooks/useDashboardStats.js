import { useState, useEffect } from 'react';
import api from '../services/api';

const useDashboardStats = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [summaryRes, categoriesRes, trendsRes, forecastRes, budgetsRes] = await Promise.all([
          api.get('/stats/summary'),
          api.get('/stats/categories'),
          api.get('/stats/trends'),
          api.get('/stats/forecast'),
          api.get('/stats/budgets-status'),
        ]);

        setSummary(summaryRes.data);
        setCategoryBreakdown(categoriesRes.data);
        setDailyTrends(trendsRes.data);
        setForecast(forecastRes.data);
        setBudgetStatus(budgetsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { summary, categoryBreakdown, dailyTrends, forecast, budgetStatus, loading, error };
};

export default useDashboardStats;
