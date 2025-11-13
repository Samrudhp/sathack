import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Input, Badge } from '../components/ReactBits';
import { recyclerSubmit } from '../api/api';
import { useRecyclerPendingStore } from '../stores';

const RecyclerItemScreen = () => {
  const navigate = useNavigate();
  const { scan_id } = useParams();
  const { t } = useTranslation();
  const { items, removeItem } = useRecyclerPendingStore();
  const [item, setItem] = useState(null);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const foundItem = items.find(i => i.scan_id === scan_id);
    setItem(foundItem);
  }, [scan_id, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await recyclerSubmit(scan_id, {
        weight: parseFloat(weight),
        material: item.predicted_material,
        cleanliness: item.cleanliness_score,
        is_hazardous: item.is_hazardous,
      });

      removeItem(scan_id);
      navigate('/recycler/token-issued', { state: { result, item } });
    } catch (err) {
      setError(err.response?.data?.message || t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-beige p-4 flex items-center justify-center">
        <Card>
          <p className="text-gray-600">Item not found</p>
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
    <div className="min-h-screen bg-beige p-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/recycler/dashboard')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← Dashboard
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">Process Item</h1>

        <form onSubmit={handleSubmit}>
          {/* Item Details (Auto-filled) */}
          <Card className="mb-6">
            <h3 className="text-xl font-bold text-forest mb-4">Item Information</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{getMaterialIcon(item.predicted_material)}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{item.user_name || 'User'}</h3>
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
                    <span className="text-gray-600">Scan ID:</span>{' '}
                    <span className="font-mono text-xs">{item.scan_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>{' '}
                    <span className="font-semibold">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                {item.is_hazardous && (
                  <Badge variant="danger" className="mt-2">
                    ⚠️ Hazardous Material
                  </Badge>
                )}
              </div>
            </div>

            {/* Location */}
            {item.location && (
              <div className="mt-4 p-3 bg-beige rounded-lg">
                <p className="text-sm text-gray-600">
                  📍 {item.location.address || `${item.location.lat}, ${item.location.lon}`}
                </p>
              </div>
            )}
          </Card>

          {/* Recycler Input */}
          <Card className="mb-6">
            <h3 className="text-xl font-bold text-forest mb-4">
              {t('recycler.weight')}
            </h3>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              label="Weight (kg)"
            />
            <p className="text-sm text-gray-600 mt-2">
              💡 Weigh the material accurately for correct token calculation
            </p>
          </Card>

          {error && (
            <div className="mb-4 bg-hazard text-white p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/recycler/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : t('recycler.submit')}
            </Button>
          </div>
        </form>
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

export default RecyclerItemScreen;
