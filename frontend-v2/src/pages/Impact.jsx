import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';

const HARDCODED_USER_ID = '691642ec8c548b95117f24c1';

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
    <div className="min-h-screen p-6" style={{ background: '#faf8f3' }}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 font-semibold flex items-center gap-2 hover:gap-4 transition-all rounded-full px-6 py-3"
          style={{
            color: '#2d5016',
            background: 'white',
            border: '2px solid #e8dfd0'
          }}
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #a8c5dd 0%, #8b7355 100%)',
            boxShadow: '0 6px 16px rgba(168, 197, 221, 0.3)'
          }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'Your Environmental Impact' : 'आपका पर्यावरणीय प्रभाव'}
          </h1>
        </div>

        {loading ? (
          <div className="card text-center py-16">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full" style={{
                background: 'linear-gradient(135deg, #87a878 0%, #4a7c2c 100%)',
                animation: 'spin 2s linear infinite'
              }}></div>
              <div className="absolute inset-2 rounded-full" style={{ background: 'white' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🌍</div>
            </div>
            <p className="text-xl font-semibold" style={{ color: '#2d5016' }}>
              {language === 'en' ? 'Loading...' : 'लोड हो रहा है...'}
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl text-center font-semibold" style={{
            background: 'linear-gradient(135deg, #c14543 0%, #d87941 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(193, 69, 67, 0.2)'
          }}>
            ⚠️ {error}
          </div>
        ) : stats ? (
          <>
            {/* Total Impact */}
            <div className="card mb-6 relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #b4d4a5 0%, #87a878 100%)'
            }}>
              <div className="absolute top-0 right-0 text-9xl opacity-10">🌍</div>
              <h2 className="text-2xl font-bold text-white mb-4 relative z-10">
                {language === 'en' ? 'Total Impact' : 'कुल प्रभाव'}
              </h2>
              <div className="grid grid-cols-3 gap-4 relative z-10">
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                  <p className="text-4xl font-bold" style={{ color: '#2d5016' }}>{(stats.total_co2_saved_kg || 0).toFixed(1)}</p>
                  <p className="text-sm mt-1" style={{ color: '#5f7c4d' }}>kg CO₂</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                  <p className="text-4xl font-bold" style={{ color: '#2d5016' }}>{(stats.total_water_saved_liters || 0).toFixed(0)}</p>
                  <p className="text-sm mt-1" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Liters Water' : 'लीटर पानी'}</p>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                  <p className="text-4xl font-bold" style={{ color: '#2d5016' }}>{(stats.total_landfill_saved_kg || 0).toFixed(1)}</p>
                  <p className="text-sm mt-1" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'kg Landfill' : 'kg लैंडफिल'}</p>
                </div>
              </div>
            </div>

            {/* Scans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                <p className="mb-1" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</p>
                <p className="text-4xl font-bold" style={{ color: '#2d5016' }}>{stats.total_scans || 0}</p>
              </div>
              <div className="card" style={{ background: 'rgba(180, 212, 165, 0.15)' }}>
                <p className="mb-1" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Tokens Balance' : 'टोकन शेष'}</p>
                <p className="text-4xl font-bold" style={{ color: '#2d5016' }}>{stats.tokens_balance || 0}</p>
              </div>
            </div>

            {/* Equivalent Impact */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(180, 212, 165, 0.15) 0%, rgba(135, 168, 120, 0.1) 100%)'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'What This Means' : 'इसका क्या मतलब है'}
              </h3>
              <ul className="space-y-3 text-lg">
                <li style={{ color: '#5f7c4d' }}>🌳 {language === 'en' 
                  ? `Equivalent to planting ${Math.floor((stats.total_co2_saved_kg || 0) / 20)} trees` 
                  : `${Math.floor((stats.total_co2_saved_kg || 0) / 20)} पेड़ लगाने के बराबर`}
                </li>
                <li style={{ color: '#5f7c4d' }}>💧 {language === 'en' 
                  ? `Saved ${Math.floor((stats.total_water_saved_liters || 0))} liters of water` 
                  : `${Math.floor((stats.total_water_saved_liters || 0))} लीटर पानी बचाया`}
                </li>
                <li style={{ color: '#5f7c4d' }}>🗑️ {language === 'en' 
                  ? `Prevented ${(stats.total_landfill_saved_kg || 0).toFixed(1)} kg from landfills` 
                  : `${(stats.total_landfill_saved_kg || 0).toFixed(1)} kg को लैंडफिल से रोका`}
                </li>
                <li style={{ color: '#5f7c4d' }}>🎁 {language === 'en'
                  ? `Earned ${stats.tokens_earned || 0} tokens!`
                  : `${stats.tokens_earned || 0} टोकन अर्जित किए!`}
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="card text-center py-16">
            <p className="text-xl font-semibold mb-4" style={{ color: '#2d5016' }}>
              {language === 'en' ? 'No impact data yet' : 'अभी तक कोई प्रभाव डेटा नहीं'}
            </p>
            <button 
              onClick={() => navigate('/scan')} 
              className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                color: 'white',
                boxShadow: '0 6px 20px rgba(74, 124, 44, 0.3)'
              }}
            >
              {language === 'en' ? 'Start Scanning' : 'स्कैन शुरू करें'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
