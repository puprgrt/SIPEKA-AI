import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Navigation, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  category?: string;
  severity?: 'Rusak Berat' | 'Rusak Sedang' | 'Rusak Ringan' | string;
  status?: string;
  address?: string;
  yearBuilt?: number;
  faultDistanceKm?: number;
  damagePercentage?: number;
}

export interface LeafletMapProps {
  markers?: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  tileStyle?: 'osm' | 'satellite' | 'dark' | 'hot';
  onTileStyleChange?: (style: 'osm' | 'satellite' | 'dark' | 'hot') => void;
  activeDataLayer?: 'severity' | 'building_age' | 'fault_risk' | 'all';
  onDataLayerChange?: (layer: 'severity' | 'building_age' | 'fault_risk' | 'all') => void;
  selectedMarkerId?: string | null;
  onMarkerSelect?: (id: string) => void;
  showGeofenceRadius?: number | null; // in meters
  geofenceCenter?: [number, number] | null;
  pickupLocation?: boolean;
  onLocationPick?: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

const TILE_PROVIDERS = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | SIPEKA PUPR',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | OpenStreetMap',
    maxZoom: 18
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  hot: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
    maxZoom: 19
  }
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [-7.2144, 107.9015], // Garut Regency default center
  zoom = 12,
  height = '100%',
  tileStyle = 'osm',
  onTileStyleChange,
  activeDataLayer = 'severity',
  onDataLayerChange,
  selectedMarkerId,
  onMarkerSelect,
  showGeofenceRadius,
  geofenceCenter,
  pickupLocation = false,
  onLocationPick,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  const [currentTileStyle, setCurrentTileStyle] = useState<'osm' | 'satellite' | 'dark' | 'hot'>(tileStyle);
  const [currentDataLayer, setCurrentDataLayer] = useState<'severity' | 'building_age' | 'fault_risk' | 'all'>(activeDataLayer || 'severity');
  const [activeLayerMenu, setActiveLayerMenu] = useState(false);
  const [layerTab, setLayerTab] = useState<'basemap' | 'datalayer'>('datalayer');

  // Sync state with parent props if provided
  useEffect(() => {
    if (tileStyle) setCurrentTileStyle(tileStyle);
  }, [tileStyle]);

  useEffect(() => {
    if (activeDataLayer) setCurrentDataLayer(activeDataLayer);
  }, [activeDataLayer]);

  // Helper to create custom HTML markers matching PUPR themes & active data layer
  const createCustomIcon = (item: MapMarkerItem, isSelected: boolean) => {
    let bgColor = '#0284c7'; // Default blue (PUPR Blue)
    let ringColor = '#38bdf8';
    let label = '🏢';
    let badgeText = '';

    const currentYear = new Date().getFullYear();
    const age = item.yearBuilt ? currentYear - item.yearBuilt : undefined;

    if (currentDataLayer === 'building_age') {
      if (age !== undefined && age >= 20) {
        bgColor = '#7e22ce'; // Purple (Tua >20th)
        ringColor = '#c084fc';
        label = '🏚️';
        badgeText = `${age}th`;
      } else if (age !== undefined && age >= 10) {
        bgColor = '#2563eb'; // Blue (Sedang 10-20th)
        ringColor = '#60a5fa';
        label = '🏛️';
        badgeText = `${age}th`;
      } else {
        bgColor = '#0d9488'; // Teal (Baru <10th)
        ringColor = '#2dd4bf';
        label = '✨';
        badgeText = age !== undefined ? `${age}th` : 'Baru';
      }
    } else if (currentDataLayer === 'fault_risk') {
      const dist = item.faultDistanceKm !== undefined ? item.faultDistanceKm : 5;
      if (dist < 2.0) {
        bgColor = '#ef4444'; // Red (<2km)
        ringColor = '#f87171';
        label = '⚠️';
        badgeText = `${dist}km`;
      } else if (dist <= 5.0) {
        bgColor = '#f59e0b'; // Amber (2-5km)
        ringColor = '#fbbf24';
        label = '⚡';
        badgeText = `${dist}km`;
      } else {
        bgColor = '#10b981'; // Green (>5km)
        ringColor = '#34d399';
        label = '🛡️';
        badgeText = `${dist}km`;
      }
    } else {
      // Default / Severity layer
      if (item.severity === 'Rusak Berat') {
        bgColor = '#dc2626'; // Red
        ringColor = '#f87171';
        label = '⚠️';
        badgeText = item.damagePercentage ? `${item.damagePercentage.toFixed(0)}%` : 'Berat';
      } else if (item.severity === 'Rusak Sedang') {
        bgColor = '#d97706'; // Amber
        ringColor = '#fbbf24';
        label = '⚡';
        badgeText = item.damagePercentage ? `${item.damagePercentage.toFixed(0)}%` : 'Sedang';
      } else if (item.severity === 'Rusak Ringan') {
        bgColor = '#16a34a'; // Green
        ringColor = '#4ade80';
        label = '✓';
        badgeText = item.damagePercentage ? `${item.damagePercentage.toFixed(0)}%` : 'Ringan';
      }
    }

    const size = isSelected ? 44 : 36;
    const isPulsing = isSelected || item.severity === 'Rusak Berat' || (currentDataLayer === 'fault_risk' && (item.faultDistanceKm || 99) < 2);

    const html = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${bgColor};
        border: 2.5px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isSelected ? '16px' : '13px'};
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${label}
        ${badgeText ? `
          <div style="
            position: absolute;
            bottom: -8px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.3);
            white-space: nowrap;
          ">${badgeText}</div>
        ` : ''}
        ${isPulsing ? `
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px solid ${ringColor};
            opacity: 0.75;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker-pin',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: L.latLng(center[0], center[1]),
        zoom,
        zoomControl: false // custom controls
      });

      // Add Tile Layer
      const provider = TILE_PROVIDERS[currentTileStyle];
      const tileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: provider.maxZoom
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map resize observer for dynamic containers
      let resizeObserver: ResizeObserver | null = null;
      try {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      } catch (e) {
        console.warn('ResizeObserver not supported or threw error', e);
      }

      return () => {
        if (resizeObserver) resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // Handle tile style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[currentTileStyle];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [currentTileStyle]);

  // Handle markers & popup binding
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const currentYear = new Date().getFullYear();

    markers.forEach((item) => {
      const isSelected = selectedMarkerId === item.id;
      const icon = createCustomIcon(item, isSelected);
      const marker = L.marker([item.lat, item.lng], { icon });

      const age = item.yearBuilt ? currentYear - item.yearBuilt : null;

      // Popup Content HTML
      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 210px; max-width: 250px;">
          <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
            ${item.category || 'Aset PUPR Garut'}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px; leading: 1.2;">
            ${item.title}
          </div>
          ${item.address ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">📍 ${item.address}</div>` : ''}
          
          <div style="margin-top: 8px; border-t: 1px solid #e2e8f0; pt: 6px; display: flex; flex-direction: column; gap: 4px;">
            ${item.severity ? `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #64748b;">Kondisi Fisik:</span>
                <span style="padding: 1px 7px; border-radius: 999px; font-size: 10px; font-weight: bold; background-color: ${
                  item.severity === 'Rusak Berat' ? '#fee2e2' : item.severity === 'Rusak Sedang' ? '#fef3c7' : '#dcfce7'
                }; color: ${
                  item.severity === 'Rusak Berat' ? '#991b1b' : item.severity === 'Rusak Sedang' ? '#92400e' : '#166534'
                };">
                  ${item.severity} ${item.damagePercentage ? `(${item.damagePercentage.toFixed(1)}%)` : ''}
                </span>
              </div>
            ` : ''}
            
            ${age !== null ? `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #64748b;">Tahun & Umur:</span>
                <span style="font-weight: bold; color: ${age >= 20 ? '#7e22ce' : age >= 10 ? '#2563eb' : '#0d9488'}; font-size: 11px;">
                  ${item.yearBuilt} (${age} Tahun)
                </span>
              </div>
            ` : ''}

            ${item.faultDistanceKm !== undefined ? `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #64748b;">Jarak Sesar Garsela:</span>
                <span style="font-weight: bold; color: ${item.faultDistanceKm < 2 ? '#dc2626' : item.faultDistanceKm <= 5 ? '#d97706' : '#16a34a'}; font-size: 11px;">
                  ⚡ ${item.faultDistanceKm} km
                </span>
              </div>
            ` : ''}
          </div>

          <div style="font-size: 10px; font-family: monospace; color: #94a3b8; margin-top: 8px; border-t: 1px dashed #e2e8f0; padding-top: 4px;">
            GPS: ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}
          </div>
          
          <div style="margin-top: 8px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; text-align: center; background-color: #0284c7; color: white; text-decoration: none; padding: 6px 0; border-radius: 6px; font-size: 11px; font-weight: bold;">
              Navigasi Lokasi
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onMarkerSelect) {
          onMarkerSelect(item.id);
        }
      });

      markersGroup.addLayer(marker);
    });

    // If selected marker exists, fly to it
    if (selectedMarkerId) {
      const found = markers.find(m => m.id === selectedMarkerId);
      if (found && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([found.lat, found.lng] as [number, number], 15, { duration: 1.2 });
      }
    }
  }, [markers, selectedMarkerId, currentDataLayer]);

  // Handle Geofence circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (geofenceCircleRef.current) {
      map.removeLayer(geofenceCircleRef.current);
      geofenceCircleRef.current = null;
    }

    if (showGeofenceRadius && (geofenceCenter || center)) {
      const gCenter = (geofenceCenter || center) as [number, number];
      const circle = L.circle(gCenter, {
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.18,
        radius: showGeofenceRadius,
        weight: 2,
        dashArray: '4, 6'
      }).addTo(map);

      geofenceCircleRef.current = circle;
    }
  }, [showGeofenceRadius, geofenceCenter, center]);

  // Handle Location Pickup mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!pickupLocation || !onLocationPick) return;

      const { lat, lng } = e.latlng;
      onLocationPick({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      });

      if (pickMarkerRef.current) {
        pickMarkerRef.current.setLatLng(e.latlng);
      } else {
        const pinIcon = L.divIcon({
          html: `<div style="background:#0284c7; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-center; color:white; font-size:12px; font-weight:bold;">📍</div>`,
          className: 'pick-pin-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        pickMarkerRef.current = L.marker(e.latlng, { icon: pinIcon }).addTo(map);
      }
    };

    if (pickupLocation) {
      map.on('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [pickupLocation, onLocationPick]);

  const [userLocLoading, setUserLocLoading] = useState(false);
  const userLocMarkerRef = useRef<L.Marker | null>(null);

  const handleRealGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation HTML5 tidak didukung oleh browser Anda.');
      return;
    }
    setUserLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocLoading(false);

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 16, { duration: 1.2 });

          if (userLocMarkerRef.current) {
            userLocMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              html: `
                <div style="position:relative; display:flex; align-items:center; justify-content:center; width:28px; height:28px;">
                  <span style="position:absolute; width:28px; height:28px; background:rgba(37,99,235,0.4); border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
                  <div style="width:16px; height:16px; background:#2563eb; border:3px solid white; border-radius:50%; box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>
                </div>
              `,
              className: 'user-real-gps-marker',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            userLocMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
            userLocMarkerRef.current.bindPopup(`<b>📍 Lokasi Real GPS Device</b><br/>Akurasi: ±${accuracy.toFixed(1)} meter`).openPopup();
          }

          if (onLocationPick) {
            onLocationPick({
              lat: Number(latitude.toFixed(6)),
              lng: Number(longitude.toFixed(6))
            });
          }
        }
      },
      (err) => {
        setUserLocLoading(false);
        console.warn('Real GPS Error:', err);
        alert(`Gagal memperoleh Real GPS (${err.message}). Pastikan izin lokasi diaktifkan pada peramban/HP Anda.`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Center view controller
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(L.latLng(center[0], center[1]), zoom, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[350px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm ${className}`} style={{ height }}>
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control Overlay Top Left: OpenStreetMap Indicator */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-slate-200">OpenStreetMap Live Engine</span>
        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/50">
          Garut GIS
        </span>
      </div>

      {/* Map Control Overlay Top Right: Layer & Basemap Switcher */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setActiveLayerMenu(!activeLayerMenu)}
          className="bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800 text-xs shadow-xl flex items-center gap-1.5 h-8 font-semibold"
        >
          <Layers size={14} className="text-pupr-yellow" />
          <span>Kontrol Layer Map</span>
        </Button>

        {activeLayerMenu && (
          <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white text-xs space-y-3 shadow-2xl w-64 animate-in fade-in zoom-in-95">
            {/* Header Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLayerTab('datalayer')}
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  layerTab === 'datalayer' ? 'bg-pupr-blue text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Layer Data
              </button>
              <button
                type="button"
                onClick={() => setLayerTab('basemap')}
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  layerTab === 'basemap' ? 'bg-pupr-blue text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ Basemap
              </button>
            </div>

            {/* Data Layer Options */}
            {layerTab === 'datalayer' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pilih Overlay Visual:</span>
                {[
                  { id: 'severity', label: 'Tingkat Kerusakan Fisik', desc: 'Warna berdasarkan Rusak Berat, Sedang, Ringan' },
                  { id: 'building_age', label: 'Umur Bangunan (Tahun)', desc: 'Visualisasi usia struktur (>20 thn, 10-20th, <10th)' },
                  { id: 'fault_risk', label: 'Jarak ke Sesar Garsela', desc: 'Pemetaan buffer kerentanan gempa sesar' },
                  { id: 'all', label: 'Tampilkan Semua Atribut', desc: 'Mode komprehensif' },
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setCurrentDataLayer(layer.id as any);
                      if (onDataLayerChange) onDataLayerChange(layer.id as any);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all ${
                      currentDataLayer === layer.id
                        ? 'bg-pupr-blue/20 border-pupr-blue text-white font-bold ring-1 ring-pupr-blue'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{layer.label}</span>
                      {currentDataLayer === layer.id && <span className="text-pupr-yellow font-extrabold text-xs">✓</span>}
                    </div>
                    <p className="text-[9px] text-slate-400 font-normal mt-0.5 leading-tight">{layer.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Basemap Options */}
            {layerTab === 'basemap' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pilih Peta Dasar:</span>
                {[
                  { id: 'osm', label: 'OpenStreetMap Standard', desc: 'Vektor peta jalan resmi' },
                  { id: 'satellite', label: 'Citra Satelit Hybrid (Esri)', desc: 'Foto udara resolusi tinggi' },
                  { id: 'hot', label: 'Humanitarian OSM', desc: 'Detail kontur & fasum kebencanaan' },
                  { id: 'dark', label: 'Night Command Mode', desc: 'Latar gelap kontras tinggi' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentTileStyle(b.id as any);
                      if (onTileStyleChange) onTileStyleChange(b.id as any);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all ${
                      currentTileStyle === b.id
                        ? 'bg-pupr-blue/20 border-pupr-blue text-white font-bold ring-1 ring-pupr-blue'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{b.label}</span>
                      {currentTileStyle === b.id && <span className="text-pupr-yellow font-extrabold text-xs">✓</span>}
                    </div>
                    <p className="text-[9px] text-slate-400 font-normal mt-0.5 leading-tight">{b.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Map Legend Overlay (Bottom Left) */}
      <div className="absolute left-3 bottom-4 z-[400] max-w-[210px] hidden sm:block">
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 text-white shadow-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pupr-yellow">
              {currentDataLayer === 'building_age' ? 'Legenda Umur Bangunan' : currentDataLayer === 'fault_risk' ? 'Legenda Risiko Sesar' : 'Legenda Kerusakan GIS'}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            {currentDataLayer === 'building_age' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600 border border-white shrink-0" />
                  <span className="text-slate-200">Bangunan Tua (&gt; 20 Thn)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shrink-0" />
                  <span className="text-slate-200">Usia Sedang (10 - 20 Thn)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-600 border border-white shrink-0" />
                  <span className="text-slate-200">Bangunan Baru (&lt; 10 Thn)</span>
                </div>
              </>
            ) : currentDataLayer === 'fault_risk' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 border border-white shrink-0 animate-pulse" />
                  <span className="text-slate-200">Zona Bahaya (&lt; 2 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shrink-0" />
                  <span className="text-slate-200">Zona Waspada (2 - 5 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0" />
                  <span className="text-slate-200">Zona Aman (&gt; 5 km)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 border border-white shrink-0 animate-pulse" />
                  <span className="text-slate-200">Rusak Berat (&gt; 45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shrink-0" />
                  <span className="text-slate-200">Rusak Sedang (30 - 45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0" />
                  <span className="text-slate-200">Rusak Ringan (&lt; 30%)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Control Overlay Bottom Right: Zoom, Real GPS & Center Navigation */}
      <div className="absolute bottom-4 right-3 z-[400] flex flex-col gap-1.5 shadow-lg">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRealGPS}
          disabled={userLocLoading}
          className="bg-blue-600 border-blue-400 text-white hover:bg-blue-700 h-8 w-8 p-0"
          title="Lokasi Real GPS Saya"
        >
          <MapPin size={16} className={userLocLoading ? "animate-spin" : "animate-bounce"} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800 h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800 h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecenter}
          className="bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800 h-8 w-8 p-0"
          title="Pusatkan Lokasi"
        >
          <Compass size={16} className="text-pupr-yellow" />
        </Button>
      </div>

      {pickupLocation && (
        <div className="absolute bottom-3 left-3 z-[400] bg-pupr-blue/90 text-white text-xs px-3 py-1.5 rounded-xl border border-blue-400 font-medium shadow-md">
          👉 Klik di mana saja pada peta untuk memilih koordinat GPS
        </div>
      )}
    </div>
  );
};
