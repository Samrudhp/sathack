import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserStore, useScanStore } from '../store';
import { useGeolocation } from '../hooks';
import { getRecyclersNearby } from '../api';

// Fix Leaflet default icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Map() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUserStore();
  const { currentScan } = useScanStore();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [recyclers, setRecyclers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if recyclers passed from Result page
    if (location.state?.recyclers) {
      console.log('Using recyclers from navigation state:', location.state.recyclers);
      setRecyclers(location.state.recyclers);
    } else if (latitude && longitude) {
      console.log('Loading recyclers for location:', latitude, longitude);
      loadRecyclers();
    }
  }, [latitude, longitude, location.state]);

  const loadRecyclers = async () => {
    if (!latitude || !longitude) {
      console.log('No location available, skipping recycler load');
      return;
    }
    
    setLoading(true);
    setError(null);
    console.log('Fetching recyclers near:', { latitude, longitude });
    
    try {
      // Use "Plastic" as default material when navigating from home
      const material = currentScan?.material || 'Plastic';
      const weight = currentScan?.weight_kg || 1.0;
      
      console.log('Calling getRecyclersNearby with:', { latitude, longitude, material, weight });
      const data = await getRecyclersNearby(latitude, longitude, material, weight);
      console.log('Received recyclers:', data);
      
      setRecyclers(data.recyclers || []);
    } catch (err) {
      console.error('Recycler load error:', err);
      console.error('Error details:', err.response?.data);
      setError(language === 'en' ? 'Failed to load recyclers' : 'रीसाइकलर लोड विफल रहा');
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-beige p-6 flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin text-4xl mb-4">🗺️</div>
          <p className="text-xl font-semibold text-forest">
            {language === 'en' ? 'Loading location...' : 'स्थान लोड हो रहा है...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-forest font-semibold flex items-center gap-2 hover:gap-4 transition-all"
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          🗺️ {language === 'en' ? 'Nearby Recyclers' : 'निकटतम रीसाइकलर'}
        </h1>

        {error && (
          <div className="bg-hazard text-white p-4 rounded-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Map */}
        <div className="card p-0 mb-6 overflow-hidden" style={{ height: '500px' }}>
          <MapContainer
            center={[latitude || 28.6139, longitude || 77.2090]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location */}
            {latitude && longitude && (
              <Marker position={[latitude, longitude]}>
                <Popup>
                  <b>{language === 'en' ? 'Your Location' : 'आपका स्थान'}</b>
                </Popup>
              </Marker>
            )}
            
            {/* Recyclers */}
            {recyclers.map((recycler, i) => {
              // Handle coordinates - check if it's in location.coordinates format or direct lat/lon
              const lat = recycler.location?.coordinates?.[1] || recycler.location_lat;
              const lon = recycler.location?.coordinates?.[0] || recycler.location_lon;
              
              if (!lat || !lon) return null;
              
              return (
                <Marker
                  key={recycler.recycler_id || i}
                  position={[lat, lon]}
                >
                  <Popup>
                    <div className="p-2">
                      <b className="text-forest">{recycler.name || recycler.recycler_name}</b>
                      {recycler.address && (
                        <p className="text-xs text-olive-dark mt-1">{recycler.address}</p>
                      )}
                      <p className="text-sm text-olive-dark mt-1">
                        📏 {recycler.distance_km?.toFixed(1)} km {language === 'en' ? 'away' : 'दूर'}
                      </p>
                      {recycler.estimated_travel_time_min && (
                        <p className="text-sm text-olive-dark">
                          ⏱️ ~{recycler.estimated_travel_time_min.toFixed(0)} min
                        </p>
                      )}
                      {recycler.phone && (
                        <p className="text-xs mt-1">
                          📞 {recycler.phone}
                        </p>
                      )}
                      {recycler.operating_hours && (
                        <p className="text-xs mt-1">
                          🕒 {recycler.operating_hours}
                        </p>
                      )}
                      {recycler.total_score && (
                        <p className="text-sm text-olive-dark mt-1">
                          {language === 'en' ? 'Score:' : 'स्कोर:'} {recycler.total_score.toFixed(1)}
                        </p>
                      )}
                      {recycler.materials_accepted && (
                        <p className="text-xs mt-1">
                          <b>{language === 'en' ? 'Accepts:' : 'स्वीकार:'}</b><br/>
                          {Array.isArray(recycler.materials_accepted) 
                            ? recycler.materials_accepted.join(', ')
                            : recycler.materials_accepted
                          }
                        </p>
                      )}
                      {i === 0 && (
                        <span className="inline-block bg-forest text-white px-2 py-1 rounded text-xs font-bold mt-2">
                          {language === 'en' ? 'NEAREST' : 'निकटतम'}
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Recycler List */}
        <div className="card">
          <h3 className="text-xl font-bold text-forest mb-4">
            {language === 'en' ? 'Recycler List' : 'रीसाइकलर सूची'} ({recyclers.length})
          </h3>
          
          {loading ? (
            <p className="text-center text-olive-dark py-4">
              {language === 'en' ? 'Loading...' : 'लोड हो रहा है...'}
            </p>
          ) : recyclers.length === 0 ? (
            <p className="text-center text-olive-dark py-4">
              {language === 'en' ? 'No recyclers found nearby' : 'पास में कोई रीसाइकलर नहीं मिला'}
            </p>
          ) : (
            <div className="space-y-3">
              {recyclers.slice(0, 10).map((recycler, i) => (
                <div key={recycler.recycler_id || i} className="p-4 bg-beige rounded-lg border-2 border-olive-light">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-forest text-lg">{recycler.name || recycler.recycler_name}</h4>
                        {i === 0 && (
                          <span className="bg-forest text-white px-2 py-1 rounded-full text-xs font-bold">
                            {language === 'en' ? 'NEAREST' : 'निकटतम'}
                          </span>
                        )}
                      </div>
                      {recycler.address && (
                        <p className="text-sm text-olive-dark mt-1">{recycler.address}</p>
                      )}
                      <div className="flex gap-4 text-sm mt-2">
                        <span>
                          � {recycler.distance_km?.toFixed(1)} km
                        </span>
                        {recycler.estimated_travel_time_min && (
                          <span>
                            ⏱️ ~{recycler.estimated_travel_time_min.toFixed(0)} min
                          </span>
                        )}
                        {recycler.rating && (
                          <span>
                            ⭐ {recycler.rating}/5
                          </span>
                        )}
                      </div>
                      {recycler.phone && (
                        <p className="text-sm mt-1">📞 {recycler.phone}</p>
                      )}
                      {recycler.operating_hours && (
                        <p className="text-sm mt-1">🕒 {recycler.operating_hours}</p>
                      )}
                      {recycler.materials_accepted && (
                        <p className="text-xs mt-2 text-forest">
                          <b>{language === 'en' ? 'Accepts:' : 'स्वीकार:'}</b> {
                            Array.isArray(recycler.materials_accepted)
                              ? recycler.materials_accepted.slice(0, 5).join(', ')
                              : recycler.materials_accepted
                          }
                        </p>
                      )}
                    </div>
                    {recycler.total_score && (
                      <div className="text-right ml-4">
                        <p className="text-sm text-olive-dark">{language === 'en' ? 'Score' : 'स्कोर'}</p>
                        <p className="text-2xl font-bold text-forest">{recycler.total_score.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
