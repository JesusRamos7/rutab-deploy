// /frontend/src/modules/optimizacion/components/VisorMapa.tsx

import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { useState, useMemo } from "react";
import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { Loader2 } from "lucide-react"; // Usamos el de la librería para consistencia

interface Props {
  clusters: ClusterResponse[];
  hoveredPedidoId: string | null;
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

export const VisorMapa = ({ clusters, hoveredPedidoId }: Props) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedPedido, setSelectedPedido] = useState<PuntoPedido | null>(
    null,
  );

  const markers = useMemo(() => {
    return clusters.flatMap((cluster, clusterIdx) =>
      cluster.pedidos.map((pedido) => ({
        ...pedido,
        clusterNumber: clusterIdx + 1,
        color: CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length],
      })),
    );
  }, [clusters]);

  const center = useMemo(() => {
    if (markers.length === 0) return { lat: 19.4326, lng: -99.1332 };
    const latSum = markers.reduce((acc, p) => acc + p.lat, 0);
    const lngSum = markers.reduce((acc, p) => acc + p.lng, 0);
    return { lat: latSum / markers.length, lng: lngSum / markers.length };
  }, [markers]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
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
        styles: silverMapStyle, // Restaurado al estilo Silver
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
            zIndex={isHovered ? 1000 : 10}
            label={{
              text: pedido.clusterNumber.toString(),
              color: "white",
              fontSize: "11px",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: pedido.color,
              fillOpacity: 1,
              strokeWeight: isHovered ? 3 : 2,
              strokeColor: isHovered ? "#000000" : "#ffffff",
              scale: isHovered ? 13 : 9,
            }}
          />
        );
      })}

      {selectedPedido && (
        <InfoWindowF
          position={{ lat: selectedPedido.lat, lng: selectedPedido.lng }}
          onCloseClick={() => setSelectedPedido(null)}
        >
          <div className="p-3 min-w-[200px] bg-white rounded-lg font-sans">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
              <span className="text-blue-600 text-[9px] font-black uppercase tracking-wider">
                Pedido Activo
              </span>
              <span className="text-slate-400 font-mono text-[9px]">
                #{selectedPedido.codigoRastreo}
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-2 leading-tight">
              {selectedPedido.cliente}
            </h4>

            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold text-slate-400 uppercase">
                  Lat
                </p>
                <p className="text-[10px] font-mono text-slate-700">
                  {selectedPedido.lat.toFixed(5)}
                </p>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold text-slate-400 uppercase">
                  Lng
                </p>
                <p className="text-[10px] font-mono text-slate-700">
                  {selectedPedido.lng.toFixed(5)}
                </p>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

// Estilo Silver Original
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
