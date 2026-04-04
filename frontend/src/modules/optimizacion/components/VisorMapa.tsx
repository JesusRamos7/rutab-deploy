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
  hoveredPedidoId: string | null; // Nueva prop para el efecto focus
}

const containerStyle = { width: "100%", height: "100%", borderRadius: "16px" };

const CLUSTER_COLORS = [
  "#3B82F6", // Azul
  "#EF4444", // Rojo
  "#10B981", // Esmeralda
  "#F59E0B", // Ámbar
  "#8B5CF6", // Violeta
  "#EC4899", // Rosa
  "#06B6D4", // Cian
];

export const VisorMapa = ({ clusters, hoveredPedidoId }: Props) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedPedido, setSelectedPedido] = useState<PuntoPedido | null>(
    null,
  );

  // 1. Mapeo de marcadores con sus colores de cluster
  const markers = useMemo(() => {
    return clusters.flatMap((cluster, clusterIdx) =>
      cluster.pedidos.map((pedido) => ({
        ...pedido,
        clusterId: cluster.clusterId,
        color: CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length],
      })),
    );
  }, [clusters]);

  // 2. Cálculo del centro dinámico del mapa
  const center = useMemo(() => {
    if (markers.length === 0) return { lat: 19.4326, lng: -99.1332 };
    const latSum = markers.reduce((acc, p) => acc + p.lat, 0);
    const lngSum = markers.reduce((acc, p) => acc + p.lng, 0);
    return { lat: latSum / markers.length, lng: lngSum / markers.length };
  }, [markers]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          Cargando Cartografía...
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        styles: silverMapStyle,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
      }}
    >
      {markers.map((pedido) => {
        const isHovered = hoveredPedidoId === pedido.id;

        return (
          <MarkerF
            key={pedido.id}
            position={{ lat: pedido.lat, lng: pedido.lng }}
            onClick={() => setSelectedPedido(pedido)}
            // Si está hovered, el marcador se dibuja por encima de todos (zIndex alto)
            zIndex={isHovered ? 1000 : 10}
            label={{
              text: (pedido.clusterId + 1).toString(),
              color: "white",
              fontSize: isHovered ? "12px" : "10px",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: pedido.color,
              fillOpacity: 1,
              strokeWeight: isHovered ? 4 : 2,
              strokeColor: isHovered ? "#000000" : "#FFFFFF",
              // Aumentamos la escala si el usuario tiene el mouse sobre la tarjeta
              scale: isHovered ? 14 : 10,
            }}
          />
        );
      })}

      {selectedPedido && (
        <InfoWindowF
          position={{ lat: selectedPedido.lat, lng: selectedPedido.lng }}
          onCloseClick={() => setSelectedPedido(null)}
        >
          <div className="p-2 min-w-[180px]">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">
                Detalle del Pedido
              </p>
              {/* Badge de Rastreo en el Mapa */}
              <span className="bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                #{selectedPedido.codigoRastreo}
              </span>
            </div>

            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2">
              {selectedPedido.cliente}
            </h4>

            <div className="flex gap-2 border-t border-gray-100 pt-2 mt-1">
              <div className="text-[9px] text-gray-400 font-mono">
                LAT: {selectedPedido.lat.toFixed(5)}
              </div>
              <div className="text-[9px] text-gray-400 font-mono">
                LNG: {selectedPedido.lng.toFixed(5)}
              </div>
            </div>
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
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];
