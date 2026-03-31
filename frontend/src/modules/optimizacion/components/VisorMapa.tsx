// /frontend/src/modules/optimizacion/components/VisorMapa.tsx

import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { useState, useMemo } from "react";
import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";

interface Props {
  clusters: ClusterResponse[];
}

const containerStyle = { width: "100%", height: "100%", borderRadius: "16px" };

const CLUSTER_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

export const VisorMapa = ({ clusters }: Props) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedPedido, setSelectedPedido] = useState<PuntoPedido | null>(
    null,
  );

  // 1. Aplanamos los clusters para tener una lista de marcadores estable
  const markers = useMemo(() => {
    return clusters.flatMap((cluster, clusterIdx) =>
      cluster.pedidos.map((pedido) => ({
        ...pedido,
        clusterId: cluster.clusterId,
        color: CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length],
      })),
    );
  }, [clusters]);

  // 2. Calculamos el centro dinámico
  const center = useMemo(() => {
    if (markers.length === 0) return { lat: 19.4326, lng: -99.1332 };
    const latSum = markers.reduce((acc, p) => acc + p.lat, 0);
    const lngSum = markers.reduce((acc, p) => acc + p.lng, 0);
    return { lat: latSum / markers.length, lng: lngSum / markers.length };
  }, [markers]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">
          Cargando cartografía...
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        styles: silverMapStyle,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* 3. IMPORTANTE: Usamos MarkerF en lugar de Marker para React 18 */}
      {markers.map((pedido) => (
        <MarkerF
          key={pedido.id}
          position={{ lat: pedido.lat, lng: pedido.lng }}
          onClick={() => setSelectedPedido(pedido)}
          label={{
            text: (pedido.clusterId + 1).toString(),
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
          }}
          icon={{
            // Accedemos a la constante solo cuando isLoaded es true
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: pedido.color,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
            scale: 10,
          }}
        />
      ))}

      {/* 4. IMPORTANTE: Usamos InfoWindowF para evitar bugs de cierre/apertura */}
      {selectedPedido && (
        <InfoWindowF
          position={{ lat: selectedPedido.lat, lng: selectedPedido.lng }}
          onCloseClick={() => setSelectedPedido(null)}
        >
          <div className="p-1 max-w-[200px] bg-white">
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              {selectedPedido.cliente}
            </h4>
            <p className="text-[10px] text-gray-500 font-mono">
              Lat: {selectedPedido.lat.toFixed(4)}
              <br />
              Lng: {selectedPedido.lng.toFixed(4)}
            </p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

const silverMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
];
