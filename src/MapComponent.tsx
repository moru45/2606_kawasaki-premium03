import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { type StoreData } from './StoreCard';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface MapComponentProps {
  stores: StoreData[];
  selectedStore: StoreData | null;
}

// Component to handle map centering when a store is selected
const MapUpdater: React.FC<{ selectedStore: StoreData | null }> = ({ selectedStore }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedStore && selectedStore.lat && selectedStore.lng) {
      map.flyTo([selectedStore.lat, selectedStore.lng], 16, { animate: true });
    }
  }, [selectedStore, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ stores, selectedStore }) => {
  // Kawasaki city rough center
  const center: [number, number] = [35.5308, 139.7029];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
      >
        {stores.map((store, i) => {
          if (!store.lat || !store.lng) return null;
          
          const title = store.店舗名 || store.屋号 || '店舗名不明';
          const mapQuery = encodeURIComponent(`${title} 神奈川県川崎市${store.区}${store.所在地}`);
          
          return (
            <Marker key={`${i}-${store.lat}`} position={[store.lat, store.lng]}>
              <Popup className="custom-popup">
                <h3>{title}</h3>
                <p>{store.区} {store.所在地}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-map"
                >
                  <MapPin size={16} /> Googleマップで開く
                </a>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
      
      <MapUpdater selectedStore={selectedStore} />
    </MapContainer>
  );
};
