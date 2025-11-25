import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Image as ImageIcon, FileText } from 'lucide-react';

// Define Home Base (San Francisco) for the "Network" effect
const HOME_COORDS: [number, number] = [37.7749, -122.4194];

// Custom Holographic Radar Icon
const createRadarIcon = () => {
  return L.divIcon({
    className: 'custom-radar-icon',
    html: `
      <div class="radar-emitter">
        <div class="radar-wave"></div>
        <div class="radar-wave"></div>
        <div class="radar-core"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface MapProps {
  locations: { lat: number; lng: number; title: string; type: 'post' | 'photo'; avatars?: string[] }[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (loc: any) => void;
}

const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const InvalidateSizeOnLoad = () => {
  const map = useMap();
  React.useEffect(() => {
    const resize = () => map.invalidateSize();
    // ensure correct initial sizing after animations/layout
    setTimeout(resize, 0);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [map]);
  return null;
};

const Map: React.FC<MapProps> = ({ locations, center = [20, 0] as [number, number], zoom = 2, className, onMarkerClick }) => {
  const radarIcon = createRadarIcon();

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-zinc-950 ${className}`}>
       <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        keyboard={false}
        style={{ height: '100%', width: '100%', zIndex: 0, background: '#09090b' }}
      >
        <ChangeView center={center} zoom={zoom} />
        <InvalidateSizeOnLoad />
        
        {/* Clean Dark Mode Tiles with Labels */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Home Marker (Subtle Glow) */}
        <Marker position={HOME_COORDS} icon={L.divIcon({
            className: '',
            html: '<div style="width:8px;height:8px;background:white;border-radius:50%;box-shadow:0 0 15px 2px rgba(255,255,255,0.5);"></div>',
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        })}>
        </Marker>

        {/* Data Points */}
        {locations.map((loc, idx) => (
          <Marker 
            key={idx} 
            position={[loc.lat, loc.lng]} 
            icon={radarIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(loc)
            }}
          >
            <Popup className="custom-popup" minWidth={220} maxWidth={240} autoPan={false}>
               <div className="grid grid-cols-[56px_1fr] items-stretch gap-3 p-3 bg-zinc-900 font-sans select-none max-h-[160px]">
                  <div className="relative w-14 rounded-md overflow-hidden bg-zinc-800 shrink-0 self-stretch">
                    <img 
                      src={`https://picsum.photos/seed/${idx + loc.title}/200/200`} 
                      alt={loc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                      <div className="text-sm font-bold text-white leading-tight line-clamp-2">{loc.title}</div>
                      <div className="mt-1 flex items-center justify-between">
                         <span className={`text-[10px] font-medium uppercase tracking-wider ${
                           loc.type === 'photo' ? 'text-pink-300' : 'text-indigo-300'
                         }`}>{loc.type}</span>
                         <span className="text-[10px] text-zinc-500 font-mono">2024.03.15</span>
                      </div>
                      {Array.isArray(loc.avatars) && loc.avatars.length > 0 && (
                        <div className="mt-2 flex -space-x-2">
                           {loc.avatars.slice(0,4).map((src, i) => (
                             <img key={i} src={src} alt="avatar" className="w-5 h-5 rounded-full ring-1 ring-white/10 object-cover" />
                           ))}
                        </div>
                      )}
                  </div>
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Smooth Vignette Overlay (Removed Pixel Grid) */}
      <div className="pointer-events-none absolute inset-0 z-[400] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] rounded-xl" />
    </div>
  );
};

export default Map;
