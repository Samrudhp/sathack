import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Badge } from '../components/ReactBits';
import ImpactCard, { ImpactGraph } from '../components/ImpactCard';
import { useUserStore, useImpactStore } from '../stores';
import { getImpactStats } from '../api/api';

const ImpactScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { stats, setStats } = useImpactStore();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getImpactStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading impact stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for graphs
  const weeklyData = [
    { label: 'Mon', value: 2.5 },
    { label: 'Tue', value: 3.2 },
    { label: 'Wed', value: 1.8 },
    { label: 'Thu', value: 4.1 },
    { label: 'Fri', value: 2.9 },
    { label: 'Sat', value: 5.2 },
    { label: 'Sun', value: 3.7 },
  ];

  const monthlyData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 48 },
    { label: 'Apr', value: 61 },
    { label: 'May', value: 55 },
    { label: 'Jun', value: 68 },
  ];

  const categoryData = [
    { label: 'Plastic', value: 35 },
    { label: 'Paper', value: 25 },
    { label: 'Metal', value: 20 },
    { label: 'Glass', value: 15 },
    { label: 'E-waste', value: 5 },
  ];

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          {t('my_impact')} 🌍
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ImpactCard
            icon="🌱"
            label={t('impact.co2')}
            value={stats?.total_co2_saved || 0}
            unit="kg"
          />
          <ImpactCard
            icon="💧"
            label={t('impact.water')}
            value={stats?.total_water_saved || 0}
            unit="L"
          />
          <ImpactCard
            icon="🗑️"
            label={t('impact.landfill')}
            value={stats?.total_landfill_diverted || 0}
            unit="kg"
          />
        </div>

        {/* Top Material Badge */}
        {stats?.top_material && (
          <Card className="mb-6 bg-gradient-to-r from-forest to-olive text-white text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold mb-2">{t('impact.top_material')}</h3>
            <div className="text-2xl font-bold">{stats.top_material}</div>
            <p className="text-sm opacity-90 mt-2">
              {stats.top_material_count || 0} items recycled
            </p>
          </Card>
        )}

        {/* Period Selector */}
        <div className="flex gap-2 mb-4">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedPeriod === period
                  ? 'bg-forest text-white'
                  : 'bg-white text-forest'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Graphs */}
        <div className="space-y-6">
          {/* Bar Chart */}
          <ImpactGraph data={weeklyData} type="bar" />

          {/* Line Chart */}
          <ImpactGraph data={monthlyData} type="line" />

          {/* Donut Chart */}
          <ImpactGraph data={categoryData} type="donut" />
        </div>

        {/* Achievement Badges */}
        <Card className="mt-6">
          <h3 className="text-xl font-bold text-forest mb-4">Achievements</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { emoji: '🌟', label: 'First Scan', achieved: true },
              { emoji: '🔥', label: '10 Items', achieved: true },
              { emoji: '💯', label: '100 Tokens', achieved: true },
              { emoji: '🌳', label: 'Eco Warrior', achieved: false },
              { emoji: '👑', label: 'Top Recycler', achieved: false },
            ].map((badge, i) => (
              <div
                key={i}
                className={`text-center p-4 rounded-lg ${
                  badge.achieved ? 'bg-olive' : 'bg-gray-200 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.emoji}</div>
                <div className="text-xs font-semibold">{badge.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Carbon Wrapped Summary */}
        <Card className="mt-6 bg-gradient-to-br from-forest via-olive to-forest text-white">
          <h3 className="text-2xl font-bold mb-4 text-center">
            🎁 Your 2025 Carbon Wrapped
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{stats?.total_items || 0}</div>
              <div className="text-sm opacity-90">Items Recycled</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats?.total_co2_saved || 0} kg</div>
              <div className="text-sm opacity-90">CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold">#{stats?.global_rank || 'N/A'}</div>
              <div className="text-sm opacity-90">Global Rank</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats?.streak_days || 0}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImpactScreen;
