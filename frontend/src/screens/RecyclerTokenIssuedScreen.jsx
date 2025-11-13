import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button } from '../components/ReactBits';

const RecyclerTokenIssuedScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const result = location.state?.result;
  const item = location.state?.item;

  if (!result) {
    return (
      <div className="min-h-screen bg-beige p-4 flex items-center justify-center">
        <Card>
          <p className="text-gray-600">No token data available</p>
          <Button
            variant="primary"
            onClick={() => navigate('/recycler/dashboard')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Card className="text-center">
          <div className="text-6xl mb-4 coin-animation">🪙</div>
          <h1 className="text-3xl font-bold text-forest mb-2">
            {t('recycler.token_issued')}
          </h1>
          <p className="text-olive mb-6">{t('recycler.give_token')}</p>

          {/* Token Code Display */}
          <div className="bg-gradient-to-r from-forest to-olive text-white p-8 rounded-xl mb-6">
            <div className="text-sm font-semibold mb-2 opacity-90">
              {t('token.code')}
            </div>
            <div className="text-5xl font-bold tracking-wider font-mono">
              {result.token}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-beige p-4 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Credits Earned</div>
              <div className="text-2xl font-bold text-forest">{result.credits}</div>
            </div>
            <div className="bg-beige p-4 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Weight</div>
              <div className="text-2xl font-bold text-forest">{result.weight} kg</div>
            </div>
            <div className="bg-beige p-4 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Material</div>
              <div className="text-xl font-bold text-forest">{result.final_material}</div>
            </div>
            <div className="bg-beige p-4 rounded-lg">
              <div className="text-gray-600 text-sm mb-1">Cleanliness</div>
              <div className="text-2xl font-bold text-forest">{result.cleanliness}/100</div>
            </div>
          </div>

          {/* User Info */}
          {item && (
            <div className="bg-olive bg-opacity-20 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>User:</strong> {item.user_name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Scan ID: {item.scan_id}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <strong>📋 Instructions:</strong>
              <br />
              1. Show this token code to the user
              <br />
              2. User can redeem it in their app
              <br />
              3. Credits will be added to their wallet
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1"
            >
              🖨️ Print
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/recycler/dashboard')}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecyclerTokenIssuedScreen;
