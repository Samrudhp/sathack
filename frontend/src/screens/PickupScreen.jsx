import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Input } from '../components/ReactBits';
import { schedulePickup } from '../api/api';

const PickupScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recycler = location.state?.recycler;
  const scan = location.state?.scan;

  const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pickupData = {
        ...formData,
        recyclerId: recycler?.id,
        scanId: scan?.scan_id,
        material: scan?.material,
      };
      await schedulePickup(pickupData);
      alert(t('success.pickup'));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">{t('pickup_nav')}</h1>

        {recycler && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">♻️</div>
              <div>
                <h3 className="font-bold text-forest">{recycler.name}</h3>
                <p className="text-sm text-gray-600">
                  {recycler.distance} km • {recycler.eta} mins
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Pickup Details</h3>

            {/* Date */}
            <Input
              type="date"
              label={t('pickup.select_date')}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Time Slot */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('pickup.select_time')} <span className="text-hazard">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.timeSlot === slot
                        ? 'border-forest bg-forest text-white'
                        : 'border-gray-300 hover:border-forest'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <Input
              type="text"
              label={t('pickup.address')}
              placeholder="Enter your pickup address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('pickup.notes')}
              </label>
              <textarea
                placeholder="Any special instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-forest focus:outline-none transition-colors"
                rows="3"
              />
            </div>

            {error && (
              <div className="mb-4 bg-hazard text-white p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Scheduling...' : t('pickup.confirm')}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PickupScreen;
