import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2f5233">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const recyclerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#afc3a2">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
      <circle cx="12" cy="12" r="3" fill="#2f5233"/>
    </svg>
  `),
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const OSMMap = ({
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 13,
  userLocation,
  recyclers = [],
  route = null,
  onRecyclerClick,
  className = '',
}) => {
  const displayCenter = userLocation || center;

  return (
    <div className={`h-96 rounded-xl overflow-hidden shadow-lg ${className}`}>
      <MapContainer
        center={displayCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={displayCenter} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recycler Markers */}
        {recyclers.map((recycler, index) => (
          <Marker
            key={recycler.id || index}
            position={[recycler.lat, recycler.lon]}
            icon={recyclerIcon}
            eventHandlers={{
              click: () => onRecyclerClick && onRecyclerClick(recycler),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-forest mb-2">{recycler.name}</h3>
                <p className="text-sm mb-1">
                  <strong>Distance:</strong> {recycler.distance} km
                </p>
                <p className="text-sm mb-1">
                  <strong>ETA:</strong> {recycler.eta} mins
                </p>
                <p className="text-sm mb-2">
                  <strong>Price:</strong> ₹{recycler.price}/kg
                </p>
                {recycler.materials && (
                  <p className="text-xs text-gray-600">
                    Accepts: {recycler.materials.join(', ')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polyline */}
        {route && route.length > 0 && (
          <Polyline
            positions={route}
            color="#2f5233"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default OSMMap;
