import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Input, Badge } from '../components/ReactBits';
import { useTokenStore } from '../stores';
import { redeemToken } from '../api/api';

const TokenScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { balance, earnHistory, setBalance } = useTokenStore();
  const [tokenCode, setTokenCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!tokenCode) return;

    setRedeeming(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await redeemToken(tokenCode);
      setBalance(balance + result.credits);
      setSuccess(true);
      setTokenCode('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('error.generic'));
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          {t('tokens')} 🪙
        </h1>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-forest to-olive text-white text-center">
          <div className="text-7xl mb-3 coin-animation">🪙</div>
          <div className="text-sm font-semibold mb-2 opacity-90">
            {t('token.balance')}
          </div>
          <div className="text-6xl font-bold mb-4">{balance}</div>
          <p className="text-sm opacity-90">ReNova Tokens</p>
        </Card>

        {/* Redeem Token */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">
            {t('token.redeem')}
          </h3>
          <form onSubmit={handleRedeem} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter token code"
              value={tokenCode}
              onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
              label={t('token.code')}
              className="font-mono"
            />
            {error && (
              <div className="bg-hazard text-white p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500 text-white p-3 rounded-lg text-sm">
                {t('success.token')}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={redeeming || !tokenCode}
              className="w-full"
            >
              {redeeming ? 'Redeeming...' : t('token.redeem')}
            </Button>
          </form>
        </Card>

        {/* Earn History */}
        <div>
          <h3 className="text-xl font-bold text-forest mb-4">
            {t('token.earn_history')}
          </h3>
          {earnHistory.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">No transactions yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {earnHistory.map((earning, index) => (
                <Card key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {getMaterialIcon(earning.material)}
                    </div>
                    <div>
                      <div className="font-semibold text-forest">
                        {earning.material || 'Recycling'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(earning.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-lg">
                    +{earning.amount}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Rewards (Placeholder) */}
        <Card className="mt-6">
          <h3 className="text-xl font-bold text-forest mb-4">
            Redeem Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: '₹50 Amazon Voucher', tokens: 500, icon: '🎁' },
              { name: 'Plant a Tree', tokens: 200, icon: '🌳' },
              { name: '₹100 Grocery Credit', tokens: 1000, icon: '🛒' },
              { name: 'Premium Features', tokens: 300, icon: '⭐' },
            ].map((reward, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-2 ${
                  balance >= reward.tokens
                    ? 'border-forest bg-olive bg-opacity-10'
                    : 'border-gray-300 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{reward.icon}</div>
                <div className="font-semibold text-forest mb-1">{reward.name}</div>
                <div className="text-sm text-gray-600">{reward.tokens} tokens</div>
                <Button
                  variant={balance >= reward.tokens ? 'primary' : 'outline'}
                  disabled={balance < reward.tokens}
                  className="w-full mt-3 text-sm"
                >
                  {balance >= reward.tokens ? 'Redeem' : 'Locked'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
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
  };
  return icons[material?.toLowerCase()] || '♻️';
};

export default TokenScreen;
