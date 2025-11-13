import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Badge } from '../components/ReactBits';
import { useUserStore, useTokenStore, useImpactStore, useScanStore, useLanguageStore } from '../stores';
import { getImpactStats, getTokenBalance } from '../api/api';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useUserStore();
  const { balance } = useTokenStore();
  const { stats } = useImpactStore();
  const { scanHistory } = useScanStore();
  const { language, setLanguage } = useLanguageStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load impact and token data
      const [impactData, tokenData] = await Promise.all([
        getImpactStats(user.id).catch(() => null),
        getTokenBalance(user.id).catch(() => null),
      ]);
      // Store in state
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-forest">
            {t('app_name')} 🍃
          </h1>
          <p className="text-olive text-sm">{t('tagline')}</p>
        </div>
        <Button variant="outline" onClick={toggleLanguage} className="px-4 py-2">
          {language === 'en' ? 'हिं' : 'EN'}
        </Button>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/scan')}>
          <div className="text-6xl mb-3">📷</div>
          <h2 className="text-xl font-bold text-forest">{t('scan_now')}</h2>
        </Card>
        <Card className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/voice')}>
          <div className="text-6xl mb-3">🎤</div>
          <h2 className="text-xl font-bold text-forest">{t('voice_query')}</h2>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-3xl mb-2">🪙</div>
          <div className="text-2xl font-bold text-forest">{balance || 0}</div>
          <div className="text-sm text-gray-600">{t('token_balance')}</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">🌍</div>
          <div className="text-2xl font-bold text-forest">
            {stats?.total_co2_saved?.toFixed(1) || 0} kg
          </div>
          <div className="text-sm text-gray-600">{t('my_impact')}</div>
        </Card>
      </div>

      {/* Recent Scans */}
      {scanHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-3">{t('recent_scans')}</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {scanHistory.slice(0, 5).map((scan, index) => (
                <Card
                  key={index}
                  className="min-w-[150px] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate('/result', { state: { scan } })}
                >
                  <div className="text-3xl mb-2">{getMaterialIcon(scan.material)}</div>
                  <div className="text-sm font-semibold truncate">{scan.material}</div>
                  <Badge variant="success" className="mt-2 text-xs">
                    +{scan.tokens_earned || 0} tokens
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => navigate('/impact')} className="py-4">
          📊 {t('impact_nav')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/community')} className="py-4">
          👥 {t('community_nav')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/map')} className="py-4">
          🗺️ {t('map')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/settings')} className="py-4">
          ⚙️ {t('settings_nav')}
        </Button>
      </div>

      {/* Floating Action Hint */}
      <div className="fixed bottom-24 right-4 text-4xl animate-bounce">
        ♻️
      </div>
    </div>
  );
};

// Helper function
const getMaterialIcon = (material) => {
  const icons = {
    plastic: '🧴',
    paper: '📄',
    metal: '🔩',
    glass: '🫙',
    ewaste: '📱',
    organic: '🥬',
  };
  return icons[material?.toLowerCase()] || '♻️';
};

export default HomeScreen;
