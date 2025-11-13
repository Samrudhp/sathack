import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Badge } from '../components/ReactBits';
import { useTokenStore } from '../stores';

const TokensScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { balance, earnHistory } = useTokenStore();

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">{t('tokens')} 🪙</h1>

        {/* Balance Card */}
        <Card className="mb-6 text-center bg-gradient-to-r from-forest to-olive text-white">
          <div className="text-6xl mb-3 coin-animation">🪙</div>
          <h2 className="text-xl font-bold mb-2">{t('token.balance')}</h2>
          <div className="text-5xl font-bold">{balance}</div>
          <p className="text-sm opacity-90 mt-2">tokens</p>
        </Card>

        {/* Redeem Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-3">{t('token.redeem')}</h3>
          <p className="text-gray-600 mb-4">
            Use your tokens for rewards, discounts, or exchange with recyclers
          </p>
          <Button variant="primary" className="w-full" disabled>
            Coming Soon
          </Button>
        </Card>

        {/* Earn History */}
        <div>
          <h3 className="text-xl font-bold text-forest mb-4">{t('token.earn_history')}</h3>
          {earnHistory.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">
                No earnings yet. Start scanning items!
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/scan')}
                className="mx-auto block mt-4"
              >
                Scan Now
              </Button>
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
                      <div className="font-bold text-forest">{earning.material}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(earning.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-lg">
                    +{earning.amount} 🪙
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-6 bg-olive bg-opacity-20">
          <h4 className="font-bold text-forest mb-2">💡 How to Earn More Tokens?</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Clean items earn more tokens</li>
            <li>• Scan regularly for streak bonuses</li>
            <li>• Refer friends for bonus rewards</li>
            <li>• Complete weekly challenges</li>
          </ul>
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

export default TokensScreen;
