import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Badge } from '../components/ReactBits';
import { useRecyclerStore, useRecyclerPendingStore } from '../stores';
import { getItemsPending } from '../api/api';

const RecyclerDashboardScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recycler, logout } = useRecyclerStore();
  const { items, setItems } = useRecyclerPendingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    setLoading(true);
    try {
      const result = await getItemsPending();
      setItems(result.items || []);
    } catch (error) {
      console.error('Error loading pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/recycler/login');
  };

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-forest">
              {t('recycler.dashboard')} ♻️
            </h1>
            <p className="text-olive">Welcome, {recycler?.name || 'Recycler'}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="px-4 py-2">
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-forest">{items.length}</div>
            <div className="text-sm text-gray-600">Pending Items</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-forest">
              {recycler?.processed_today || 0}
            </div>
            <div className="text-sm text-gray-600">Processed Today</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-forest">
              {recycler?.rating || 4.5}
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </Card>
        </div>

        {/* Pending Items */}
        <div>
          <h2 className="text-2xl font-bold text-forest mb-4">
            {t('recycler.pending_items')}
          </h2>

          {loading ? (
            <Card>
              <p className="text-center text-gray-600">Loading...</p>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">No pending items</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.scan_id} className="hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">
                      {getMaterialIcon(item.predicted_material)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-forest mb-2">
                        {item.user_name || 'User'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Material:</span>{' '}
                          <Badge variant="success">{item.predicted_material}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Cleanliness:</span>{' '}
                          <span className="font-semibold">{item.cleanliness_score}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>{' '}
                          <span className="font-semibold">{item.distance} km</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>{' '}
                          <span className="font-semibold">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {item.is_hazardous && (
                        <Badge variant="danger" className="mt-2">
                          ⚠️ Hazardous
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/recycler/item/${item.scan_id}`)}
                      className="px-6"
                    >
                      {t('recycler.view_item')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
  };
  return icons[material?.toLowerCase()] || '♻️';
};

export default RecyclerDashboardScreen;
