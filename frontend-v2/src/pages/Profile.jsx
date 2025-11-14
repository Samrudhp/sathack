import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';

const HARDCODED_USER_ID = '673fc7f4f1867ab46b0a8c01';

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useUserStore();
  const [stats, setStats] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('Fetching stats for userId:', HARDCODED_USER_ID);
      const response = await fetch(`http://localhost:8000/api/user/stats/${HARDCODED_USER_ID}`);
      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Loaded stats:', data);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default stats on error so page still renders
      setStats({
        total_scans: 0,
        tokens_earned: 0,
        tokens_balance: 0,
        total_co2_saved_kg: 0,
        total_water_saved_liters: 0,
        total_landfill_saved_kg: 0
      });
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('user_id', HARDCODED_USER_ID);
      formData.append('code', redeemCode.toUpperCase());

      const response = await fetch('http://localhost:8000/api/user/redeem', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to redeem code');
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: `✅ Success! You earned ${result.tokens_awarded} tokens!`
      });
      setRedeemCode('');
      
      // Reload stats after 1 second
      setTimeout(() => {
        loadStats();
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-beige p-6 flex items-center justify-center">
        <div className="card text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-2xl text-forest">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
            background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
            boxShadow: '0 6px 16px rgba(74, 124, 44, 0.3)'
          }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'My Profile' : 'मेरी प्रोफ़ाइल'}
          </h1>
        </div>

        {/* Total Impact */}
        <div className="card mb-6 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #b4d4a5 0%, #87a878 100%)'
        }}>
          <div className="absolute top-0 right-0 text-9xl opacity-10">🌍</div>
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">
            {language === 'en' ? 'Total Impact' : 'कुल प्रभाव'}
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4 relative z-10">
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <div className="text-3xl font-bold" style={{ color: '#2d5016' }}>{stats.total_co2_saved_kg.toFixed(1)}</div>
              <div className="text-sm" style={{ color: '#5f7c4d' }}>kg CO₂</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <div className="text-3xl font-bold" style={{ color: '#2d5016' }}>{stats.total_water_saved_liters.toFixed(0)}</div>
              <div className="text-sm" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Liters Water' : 'लीटर पानी'}</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <div className="text-3xl font-bold" style={{ color: '#2d5016' }}>{stats.total_landfill_saved_kg.toFixed(1)}</div>
              <div className="text-sm" style={{ color: '#5f7c4d' }}>kg {language === 'en' ? 'Landfill' : 'लैंडफिल'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.9)', border: '2px solid #e8dfd0' }}>
              <div className="text-2xl font-bold" style={{ color: '#2d5016' }}>{stats.total_scans}</div>
              <div className="text-sm" style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)' }}>
              <div className="text-2xl font-bold text-white">{stats.tokens_balance}</div>
              <div className="text-sm text-white/80">{language === 'en' ? 'Tokens Available' : 'टोकन उपलब्ध'}</div>
            </div>
          </div>
        </div>

        {/* Redeem Code */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2d5016' }}>
            🎫 {language === 'en' ? 'Redeem Code' : 'कोड रिडीम करें'}
          </h2>
          <p className="mb-4" style={{ color: '#5f7c4d' }}>
            {language === 'en' 
              ? 'Enter the 6-character code from the recycler to claim your tokens!' 
              : 'अपने टोकन प्राप्त करने के लिए रीसाइकलर से 6-अक्षर का कोड दर्ज करें!'}
          </p>

          {message.text && (
            <div className={`p-4 rounded-2xl mb-4 font-semibold ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRedeem} className="flex gap-3">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder={language === 'en' ? 'Enter code (e.g. ABC123)' : 'कोड दर्ज करें'}
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl text-lg font-mono tracking-widest uppercase"
              style={{
                border: '2px solid #e8dfd0',
                background: 'white',
                color: '#2d5016'
              }}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: loading || redeemCode.length !== 6 
                  ? '#e8dfd0' 
                  : 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                color: loading || redeemCode.length !== 6 ? '#5f7c4d' : 'white',
                boxShadow: loading || redeemCode.length !== 6 ? 'none' : '0 6px 20px rgba(74, 124, 44, 0.3)'
              }}
              disabled={loading || redeemCode.length !== 6}
            >
              {loading ? '⏳' : '✓'} {language === 'en' ? 'Redeem' : 'रिडीम करें'}
            </button>
          </form>

          <div className="mt-4 text-sm p-3 rounded-xl" style={{ 
            background: 'rgba(180, 212, 165, 0.1)',
            color: '#5f7c4d'
          }}>
            💡 {language === 'en' 
              ? 'Codes are provided by recyclers when you deliver your waste to them.' 
              : 'जब आप अपना कचरा रीसाइकलर को देते हैं तो कोड प्रदान किए जाते हैं।'}
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2d5016' }}>
            📈 {language === 'en' ? 'Lifetime Stats' : 'आजीवन आंकड़े'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 rounded-xl" style={{ background: 'rgba(180, 212, 165, 0.1)' }}>
              <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Total Tokens Earned' : 'कुल अर्जित टोकन'}</span>
              <span className="font-bold" style={{ color: '#2d5016' }}>{stats.tokens_earned}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl" style={{ background: 'rgba(180, 212, 165, 0.1)' }}>
              <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Current Balance' : 'वर्तमान शेष'}</span>
              <span className="font-bold" style={{ color: '#2d5016' }}>{stats.tokens_balance}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl" style={{ background: 'rgba(180, 212, 165, 0.1)' }}>
              <span style={{ color: '#5f7c4d' }}>{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</span>
              <span className="font-bold" style={{ color: '#2d5016' }}>{stats.total_scans}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
