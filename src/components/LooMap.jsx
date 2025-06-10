import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const LooMap = ({ onSelectLoo }) => {
  const [toilets, setToilets] = useState([]);
  const [currentPosition, setCurrentPosition] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);
        fetchToilets(latitude, longitude);
      },
      () => {
        // Fallback if location access is denied
        fetchToilets(currentPosition[0], currentPosition[1]);
      }
    );
  }, []);

  const fetchToilets = async (lat, lng) => {
    try {
        // Replace with your actual backend API URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/toilets?lat=${lat}&lng=${lng}&radius=10000`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setToilets(data);
    } catch (error) {
      console.error("Failed to fetch toilets:", error);
    }
  };
  
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  return (
    <MapContainer center={currentPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
      <MapUpdater center={currentPosition} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {toilets.map(loo => (
        <Marker
          key={loo.toilet_id}
          position={[loo.latitude, loo.longitude]}
          eventHandlers={{
            click: () => {
              onSelectLoo(loo.toilet_id);
            },
          }}
        >
          <Popup>
            <h3 className="font-bold">{loo.name}</h3>
            <p>{loo.address}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LooMap;