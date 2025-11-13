import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Badge } from '../components/ReactBits';
import HazardBanner from '../components/HazardBanner';
import RecyclerCard from '../components/RecyclerCard';
import ImpactCard from '../components/ImpactCard';
import { useScanStore, useTokenStore } from '../stores';
import { getRecyclersNearby } from '../api/api';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentScan } = useScanStore();
  const { addEarning } = useTokenStore();
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(false);

  const scan = location.state?.scan || currentScan;

  useEffect(() => {
    if (scan) {
      loadRecyclers();
      if (scan.tokens_earned) {
        addEarning({
          amount: scan.tokens_earned,
          date: new Date().toISOString(),
          material: scan.material,
        });
      }
    }
  }, [scan]);

  const loadRecyclers = async () => {
    if (!scan?.user_location) return;
    setLoading(true);
    try {
      const { lat, lon } = scan.user_location;
      const result = await getRecyclersNearby(lat, lon, scan.material);
      setRecyclers(result.recyclers || []);
    } catch (error) {
      console.error('Error loading recyclers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!scan) {
    return (
      <div className="min-h-screen bg-beige p-4 flex items-center justify-center">
        <Card>
          <p className="text-gray-600">No scan data available</p>
          <Button variant="primary" onClick={() => navigate('/home')} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">{t('result')}</h1>

        {/* Hazard Warning */}
        {scan.is_hazardous && (
          <HazardBanner
            hazardType={scan.hazard_type}
            instructions={scan.hazard_instructions}
          />
        )}

        {/* Item Summary */}
        <Card className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">
              {getMaterialIcon(scan.material)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-forest">{scan.material}</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="success">
                  {t('cleanliness')}: {scan.cleanliness_score}/100
                </Badge>
                {scan.is_hazardous && (
                  <Badge variant="danger">Hazardous</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Disposal Instructions */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-3">
            {t('disposal_instruction')}
          </h3>
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-gray-700 mb-1">Quick Guide:</div>
              <p className="text-gray-600">{scan.disposal_short}</p>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">Detailed:</div>
              <p className="text-gray-600">{scan.disposal_long}</p>
            </div>
            <div className="flex gap-2 mt-3">
              {scan.bin_type && (
                <Badge variant="primary">
                  Bin: {scan.bin_type}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Environmental Impact */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-3">
            {t('environmental_impact')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImpactCard
              icon="🌱"
              label={t('impact.co2')}
              value={scan.impact?.co2_saved || 0}
              unit="kg"
            />
            <ImpactCard
              icon="💧"
              label={t('impact.water')}
              value={scan.impact?.water_saved || 0}
              unit="L"
            />
            <ImpactCard
              icon="🗑️"
              label={t('impact.landfill')}
              value={scan.impact?.landfill_diverted || 0}
              unit="kg"
            />
          </div>
        </div>

        {/* Tokens Earned */}
        {scan.tokens_earned && (
          <Card className="mb-6 text-center bg-gradient-to-r from-forest to-olive text-white">
            <div className="text-5xl mb-3 coin-animation">🪙</div>
            <h3 className="text-2xl font-bold mb-2">{t('tokens_earned')}</h3>
            <div className="text-4xl font-bold">{scan.tokens_earned}</div>
          </Card>
        )}

        {/* Recycler Matches */}
        {recyclers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-forest mb-3">
              {t('recycler_matches')}
            </h3>
            <div className="space-y-3">
              {recyclers.map((recycler, index) => (
                <RecyclerCard
                  key={index}
                  recycler={recycler}
                  onViewRoute={(r) => navigate('/map', { state: { recycler: r, scan } })}
                  onSchedule={(r) => navigate('/pickup', { state: { recycler: r, scan } })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/map', { state: { scan } })}
            className="flex-1"
          >
            🗺️ View Map
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/home')}
            className="flex-1"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

const getMaterialIcon = (material) => {
  const icons = {
    plastic: '🧴',
    paper: '📄',
    metal: '🔩',
    glass: '🫙',
    ewaste: '📱',
    organic: '🥬',
    cardboard: '📦',
    textile: '👕',
  };
  return icons[material?.toLowerCase()] || '♻️';
};

export default ResultScreen;
