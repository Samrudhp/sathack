import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import OSMMap from '../components/OSMMap';
import { Card, Button } from '../components/ReactBits';
import { getRecyclersNearby } from '../api/api';

const MapScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState(null);
  const [recyclers, setRecyclers] = useState([]);
  const [selectedRecycler, setSelectedRecycler] = useState(null);
  const [route, setRoute] = useState(null);

  const scan = location.state?.scan;
  const initialRecycler = location.state?.recycler;

  useEffect(() => {
    getUserLocation();
    if (initialRecycler) {
      setSelectedRecycler(initialRecycler);
    }
  }, []);

  useEffect(() => {
    if (userLocation && scan) {
      loadRecyclers();
    }
  }, [userLocation, scan]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a location if geolocation fails
          setUserLocation([28.6139, 77.2090]); // Delhi
        }
      );
    }
  };

  const loadRecyclers = async () => {
    try {
      const [lat, lon] = userLocation;
      const result = await getRecyclersNearby(lat, lon, scan?.material);
      setRecyclers(result.recyclers || []);
    } catch (error) {
      console.error('Error loading recyclers:', error);
    }
  };

  const handleRecyclerClick = (recycler) => {
    setSelectedRecycler(recycler);
    // Generate simple route (straight line for now)
    if (userLocation) {
      setRoute([
        userLocation,
        [recycler.lat, recycler.lon]
      ]);
    }
  };

  const handleSchedulePickup = () => {
    navigate('/pickup', { state: { recycler: selectedRecycler, scan } });
  };

  return (
    <div className="min-h-screen bg-beige p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">{t('map')}</h1>

        {/* Map */}
        <OSMMap
          userLocation={userLocation}
          recyclers={recyclers}
          route={route}
          onRecyclerClick={handleRecyclerClick}
          className="h-[500px] mb-6"
        />

        {/* Selected Recycler Info */}
        {selectedRecycler && (
          <Card>
            <div className="flex items-center gap-4">
              <div className="text-5xl">♻️</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-forest mb-2">
                  {selectedRecycler.name}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">{t('distance')}:</span>{' '}
                    <span className="font-semibold">{selectedRecycler.distance} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('eta')}:</span>{' '}
                    <span className="font-semibold">{selectedRecycler.eta} mins</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('price')}:</span>{' '}
                    <span className="font-semibold">₹{selectedRecycler.price}/kg</span>
                  </div>
                  {selectedRecycler.rating && (
                    <div>
                      <span className="text-gray-600">Rating:</span>{' '}
                      <span className="font-semibold">⭐ {selectedRecycler.rating}</span>
                    </div>
                  )}
                </div>
                {selectedRecycler.address && (
                  <p className="text-sm text-gray-600 mt-2">
                    📍 {selectedRecycler.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedRecycler.lat},${selectedRecycler.lon}`, '_blank')}
                className="flex-1"
              >
                🧭 Navigate
              </Button>
              <Button
                variant="primary"
                onClick={handleSchedulePickup}
                className="flex-1"
              >
                {t('schedule')}
              </Button>
            </div>
          </Card>
        )}

        {/* Recycler List */}
        {!selectedRecycler && recyclers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-forest">
              {t('recycler_matches')} ({recyclers.length})
            </h3>
            {recyclers.map((recycler, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-2xl"
                onClick={() => handleRecyclerClick(recycler)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">♻️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-forest">{recycler.name}</h4>
                    <p className="text-sm text-gray-600">
                      {recycler.distance} km • {recycler.eta} mins • ₹{recycler.price}/kg
                    </p>
                  </div>
                  <div className="text-2xl">→</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;
