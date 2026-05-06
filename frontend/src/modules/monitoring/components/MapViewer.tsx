import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Truck, Crosshair } from 'lucide-react'; // Cambiamos Navigation por Crosshair para el centrado
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Componente para el botón de centrado flotante
const MapControls = ({ vehicles }: any) => {
  const map = useMap();
  const validVehicles = vehicles.filter((v: any) => Number.isFinite(v.latitud) && Number.isFinite(v.longitud));

  const handleCenterAll = () => {
    if (validVehicles.length === 0) return;

    // Creamos un "bound" (límite) que abarque a todos los vehículos
    const bounds = L.latLngBounds(validVehicles.map((v: any) => [v.latitud, v.longitud] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  return (
    <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleCenterAll}
        className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-blue-600 hover:bg-blue-50 transition-all group"
        title="Centrar todos los vehículos"
      >
        <Crosshair size={22} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

// Icono personalizado 
const carIcon = L.divIcon({
  html: renderToString(
    <div className="bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white text-white">
      <Truck size={20} />
    </div>
  ),
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

export const MapViewer = ({ vehicles }: any) => {
  const validVehicles = vehicles.filter((v: any) => Number.isFinite(v.latitud) && Number.isFinite(v.longitud));
  const center: [number, number] = validVehicles.length > 0
    ? [validVehicles[0].latitud, validVehicles[0].longitud]
    : [17.9895, -92.9475];

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full"
        zoomControl={false} // Desactivamos el default para poner los nuestros si queremos
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Renderizamos el botón sobre el mapa */}
        <MapControls vehicles={validVehicles} />

        {validVehicles.map((v: any) => (
          <Marker 
            key={v.rutaId} 
            position={[v.latitud, v.longitud]} 
            icon={carIcon}
          >
            <Popup>
              <div className="font-bold text-gray-800">{v.id}</div>
              <p className="text-xs text-gray-500">Chofer: {v.driverName}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};