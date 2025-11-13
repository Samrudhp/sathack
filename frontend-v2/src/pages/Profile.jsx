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
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-forest font-semibold flex items-center gap-2 hover:gap-4 transition-all"
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          👤 {language === 'en' ? 'My Profile' : 'मेरी प्रोफ़ाइल'}
        </h1>

        {/* Total Impact */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-forest mb-4">
            🌍 {language === 'en' ? 'Total Impact' : 'कुल प्रभाव'}
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-olive-light rounded-lg">
              <div className="text-3xl font-bold text-forest">{stats.total_co2_saved_kg.toFixed(1)}</div>
              <div className="text-sm text-olive-dark">kg CO₂</div>
            </div>
            <div className="text-center p-4 bg-olive-light rounded-lg">
              <div className="text-3xl font-bold text-forest">{stats.total_water_saved_liters.toFixed(0)}</div>
              <div className="text-sm text-olive-dark">{language === 'en' ? 'Liters Water' : 'लीटर पानी'}</div>
            </div>
            <div className="text-center p-4 bg-olive-light rounded-lg">
              <div className="text-3xl font-bold text-forest">{stats.total_landfill_saved_kg.toFixed(1)}</div>
              <div className="text-sm text-olive-dark">kg {language === 'en' ? 'Landfill' : 'लैंडफिल'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-beige rounded-lg border-2 border-olive-light">
              <div className="text-2xl font-bold text-forest">{stats.total_scans}</div>
              <div className="text-sm text-olive-dark">{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</div>
            </div>
            <div className="p-4 bg-forest rounded-lg">
              <div className="text-2xl font-bold text-beige">{stats.tokens_balance}</div>
              <div className="text-sm text-olive-light">{language === 'en' ? 'Tokens Available' : 'टोकन उपलब्ध'}</div>
            </div>
          </div>
        </div>

        {/* Redeem Code */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-forest mb-4">
            🎫 {language === 'en' ? 'Redeem Code' : 'कोड रिडीम करें'}
          </h2>
          <p className="text-olive-dark mb-4">
            {language === 'en' 
              ? 'Enter the 6-character code from the recycler to claim your tokens!' 
              : 'अपने टोकन प्राप्त करने के लिए रीसाइकलर से 6-अक्षर का कोड दर्ज करें!'}
          </p>

          {message.text && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
              className="flex-1 px-4 py-3 border-2 border-olive-light rounded-lg text-lg font-mono tracking-widest uppercase"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-primary px-8"
              disabled={loading || redeemCode.length !== 6}
            >
              {loading ? '⏳' : '✓'} {language === 'en' ? 'Redeem' : 'रिडीम करें'}
            </button>
          </form>

          <div className="mt-4 text-sm text-olive-dark">
            💡 {language === 'en' 
              ? 'Codes are provided by recyclers when you deliver your waste to them.' 
              : 'जब आप अपना कचरा रीसाइकलर को देते हैं तो कोड प्रदान किए जाते हैं।'}
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="card">
          <h2 className="text-2xl font-bold text-forest mb-4">
            📈 {language === 'en' ? 'Lifetime Stats' : 'आजीवन आंकड़े'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-beige rounded-lg">
              <span className="text-olive-dark">{language === 'en' ? 'Total Tokens Earned' : 'कुल अर्जित टोकन'}</span>
              <span className="font-bold text-forest">{stats.tokens_earned}</span>
            </div>
            <div className="flex justify-between p-3 bg-beige rounded-lg">
              <span className="text-olive-dark">{language === 'en' ? 'Current Balance' : 'वर्तमान शेष'}</span>
              <span className="font-bold text-forest">{stats.tokens_balance}</span>
            </div>
            <div className="flex justify-between p-3 bg-beige rounded-lg">
              <span className="text-olive-dark">{language === 'en' ? 'Total Scans' : 'कुल स्कैन'}</span>
              <span className="font-bold text-forest">{stats.total_scans}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
