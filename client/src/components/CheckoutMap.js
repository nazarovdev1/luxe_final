import React from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ position, setPosition }) {
  const { t } = useLanguage();
  const map = useMapEvents({
    click(event) {
      setPosition(event.latlng);
      map.flyTo(event.latlng, map.getZoom());
    },
    locationfound(event) {
      setPosition(event.latlng);
      map.flyTo(event.latlng, map.getZoom());
    },
    locationerror() {
      toast.error(t('checkoutPage.locationError'));
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function LocationButton() {
  const map = useMap();

  const handleLocate = (event) => {
    event.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar !border-0 !bg-transparent !shadow-none">
        <button
          onClick={handleLocate}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2130] text-[#f4f1eb] shadow-[0_8px_20px_rgba(8,10,18,0.45)] transition-colors hover:bg-[#232b3e]"
          title="Mening manzilim"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const CheckoutMap = ({ position, onPositionChange, className = '', style }) => (
  <div className={className} style={style}>
    <MapContainer center={[41.2995, 69.2401]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={onPositionChange} />
      <LocationButton />
    </MapContainer>
  </div>
);

export default CheckoutMap;
