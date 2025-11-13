import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';

const HARDCODED_USER_ID = '673fc7f4f1867ab46b0a8c01';

export default function Impact() {
  const navigate = useNavigate();
  const { language } = useUserStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImpact();
  }, []);

  const loadImpact = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/user/stats/${HARDCODED_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Impact load error:', err);
      setError(language === 'en' ? 'Failed to load impact' : 'प्रभाव लोड विफल रहा');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-forest font-semibold flex items-center gap-2 hover:gap-4 transition-all"
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          🌍 {language === 'en' ? 'Your Environmental Impact' : 'आपका पर्यावरणीय प्रभाव'}
        </h1>

        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin text-4xl mb-4">🌍</div>
            <p className="text-xl font-semibold text-forest">
              {language === 'en' ? 'Loading...' : 'लोड हो रहा है...'}
            </p>
          </div>
        ) : error ? (
          <div className="bg-hazard text-white p-4 rounded-lg">
            ⚠️ {error}
          </div>
        ) : stats ? (
          <>
            {/* Total Impact */}
            <div className="card bg-forest text-white mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {language === 'en' ? 'Total Impact' : 'कुल प्रभाव'}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">{(stats.total_co2_saved_kg || 0).toFixed(1)}</p>
                  <p className="text-sm opacity-90 mt-1">kg CO₂</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{(stats.total_water_saved_liters || 0).toFixed(0)}</p>
                  <p className="text-sm opacity-90 mt-1">{language === 'en' ? 'Liters Water' : 'लीटर पानी'}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{(stats.total_landfill_saved_kg || 0).toFixed(1)}</p>
                  <p className="text-sm opacity-90 mt-1">{language === 'en' ? 'kg Landfill' : 'kg लैंडफिल'}</p>
                </div>
              </div>
            </div>

            {/* Scans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card bg-olive-light">
                <p className="text-olive-dark mb-1">{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</p>
                <p className="text-4xl font-bold text-forest">{stats.total_scans || 0}</p>
              </div>
              <div className="card bg-olive-light">
                <p className="text-olive-dark mb-1">{language === 'en' ? 'Tokens Balance' : 'टोकन शेष'}</p>
                <p className="text-4xl font-bold text-forest">{stats.tokens_balance || 0}</p>
              </div>
            </div>

            {/* Equivalent Impact */}
            <div className="card bg-forest text-white">
              <h3 className="text-xl font-bold mb-4">
                {language === 'en' ? 'What This Means' : 'इसका क्या मतलब है'}
              </h3>
              <ul className="space-y-3 text-lg">
                <li>🌳 {language === 'en' 
                  ? `Equivalent to planting ${Math.floor((stats.total_co2_saved_kg || 0) / 20)} trees` 
                  : `${Math.floor((stats.total_co2_saved_kg || 0) / 20)} पेड़ लगाने के बराबर`}
                </li>
                <li>💧 {language === 'en' 
                  ? `Saved ${Math.floor((stats.total_water_saved_liters || 0))} liters of water` 
                  : `${Math.floor((stats.total_water_saved_liters || 0))} लीटर पानी बचाया`}
                </li>
                <li>🗑️ {language === 'en' 
                  ? `Prevented ${(stats.total_landfill_saved_kg || 0).toFixed(1)} kg from landfills` 
                  : `${(stats.total_landfill_saved_kg || 0).toFixed(1)} kg को लैंडफिल से रोका`}
                </li>
                <li>🎁 {language === 'en'
                  ? `Earned ${stats.tokens_earned || 0} tokens!`
                  : `${stats.tokens_earned || 0} टोकन अर्जित किए!`}
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="card text-center py-16">
            <p className="text-xl font-semibold text-forest mb-4">
              {language === 'en' ? 'No impact data yet' : 'अभी तक कोई प्रभाव डेटा नहीं'}
            </p>
            <button onClick={() => navigate('/scan')} className="btn-primary">
              {language === 'en' ? 'Start Scanning' : 'स्कैन शुरू करें'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
