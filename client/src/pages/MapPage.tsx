import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

interface LocationType {
  _id: string;
  name: string;
  address: string;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentQueueNo: number;
  currentlyServing: number;
  estimatedWaitTime: number;
  crowdDensity: number;
}

const CATEGORIES = [
  'Hospital',
  'Bank',
  'Passport Office',
  'Government Office',
  'University',
  'Railway Center',
  'Restaurant',
  'Service Center'
];

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Fetch locations
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get('/locations');
      setLocations(res.data);
      setFilteredLocations(res.data);
    } catch {
      // Mock locations for standalone client mode
      const mockLocations: LocationType[] = [
        {
          _id: 'seed-kolkata-passport',
          name: 'Passport Office Kolkata',
          address: 'Regional Head Office, Kolkata, WB',
          category: 'Passport Office',
          coordinates: { lat: 22.5726, lng: 88.3639 },
          currentQueueNo: 185,
          currentlyServing: 127,
          estimatedWaitTime: 245,
          crowdDensity: 85
        },
        {
          _id: 'seed-central-hospital',
          name: 'Central Gen Hospital ER',
          address: 'Central District Municipal Sq, Kolkata, WB',
          category: 'Hospital',
          coordinates: { lat: 22.5696, lng: 88.3589 },
          currentQueueNo: 402,
          currentlyServing: 382,
          estimatedWaitTime: 105,
          crowdDensity: 80
        },
        {
          _id: 'seed-first-bank',
          name: 'First National Bank',
          address: 'Financial Hub Sector V, Salt Lake, Kolkata',
          category: 'Bank',
          coordinates: { lat: 22.5786, lng: 88.3689 },
          currentQueueNo: 48,
          currentlyServing: 42,
          estimatedWaitTime: 25,
          crowdDensity: 50
        },
        {
          _id: 'seed-city-tax',
          name: 'City Tax Office',
          address: 'Municipal Square Building, Kolkata, WB',
          category: 'Government Office',
          coordinates: { lat: 22.5826, lng: 88.3529 },
          currentQueueNo: 15,
          currentlyServing: 14,
          estimatedWaitTime: 5,
          crowdDensity: 20
        },
        {
          _id: 'seed-kspk',
          name: 'Kolkata Passport Seva Kendra',
          address: 'Ritchie Road Service Hub, Kolkata, WB',
          category: 'Passport Office',
          coordinates: { lat: 22.5716, lng: 88.3629 },
          currentQueueNo: 510,
          currentlyServing: 482,
          estimatedWaitTime: 56,
          crowdDensity: 85
        },
        {
          _id: 'seed-westside-medical',
          name: 'Westside Medical Center',
          address: 'West Side Bypass Road, Kolkata, WB',
          category: 'Hospital',
          coordinates: { lat: 22.5656, lng: 88.3429 },
          currentQueueNo: 120,
          currentlyServing: 110,
          estimatedWaitTime: 30,
          crowdDensity: 60
        }
      ];
      setLocations(mockLocations);
      setFilteredLocations(mockLocations);
    }
  };

  // Filter locations on search query or category check
  useEffect(() => {
    let result = locations;
    
    if (selectedCategories.length > 0) {
      result = result.filter(loc => selectedCategories.includes(loc.category));
    } else {
      result = [];
    }

    if (searchQuery.trim()) {
      result = result.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLocations(result);
  }, [selectedCategories, searchQuery, locations]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const getSemanticColorClass = (wait: number) => {
    if (wait <= 15) return 'marker-green';
    if (wait <= 45) return 'marker-amber';
    return 'marker-red';
  };

  // Custom pulsing Leaflet DivIcon
  const createMarkerIcon = (waitMins: number) => {
    const colorClass = getSemanticColorClass(waitMins);
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full opacity-40 pulse-marker ${colorClass}"></div>
          <div class="absolute w-3.5 h-3.5 rounded-full border border-white map-marker ${colorClass}"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const formatWaitTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col md:flex-row relative">
      {/* 1. FILTER SIDE PANEL */}
      <aside className="w-full md:w-80 bg-surface border-b md:border-b-0 md:border-r border-outline-variant p-md flex flex-col gap-md z-20 shrink-0 glass-panel overflow-y-auto max-h-[40vh] md:max-h-full">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Queue Map</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Filter lines by category and density overlays.</p>
        </div>

        {/* Heatmap Layer Toggle */}
        <div className="flex items-center justify-between p-sm bg-surface-container rounded-xl border border-outline-variant">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Heatmap Density Overlay</span>
          </div>
          <button
            onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              heatmapEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                heatmapEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Filter Categories</h3>
          <div className="flex flex-col gap-xs">
            {CATEGORIES.map(cat => (
              <label
                key={cat}
                className="flex items-center gap-sm p-xs hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer select-none font-body-sm text-body-sm text-on-surface"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant bg-surface-container-lowest"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Info Legend */}
        <div className="mt-auto pt-sm border-t border-outline-variant flex flex-col gap-xs font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-low-queue"></span>
            <span>Low Wait (&lt; 15 mins)</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-medium-queue"></span>
            <span>Medium Wait (15 - 45 mins)</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-3 h-3 rounded-full bg-high-queue"></span>
            <span>High Delay (&gt; 45 mins)</span>
          </div>
        </div>
      </aside>

      {/* 2. MAP CANVAS CONTROLLER */}
      <div className="flex-1 h-full z-10 relative">
        <MapContainer
          center={[22.5726, 88.3639]} // Centered on Kolkata Passport Area
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Map Tile Layers */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Heatmap overlay circles if toggled */}
          {heatmapEnabled &&
            filteredLocations.map(loc => (
              <Circle
                key={`heat-${loc._id}`}
                center={[loc.coordinates.lat, loc.coordinates.lng]}
                radius={loc.crowdDensity * 3.5} // Scale radius based on crowd capacity
                pathOptions={{
                  fillColor:
                    loc.estimatedWaitTime <= 15
                      ? '#22C55E'
                      : loc.estimatedWaitTime <= 45
                      ? '#F59E0B'
                      : '#EF4444',
                  fillOpacity: 0.25,
                  stroke: false
                }}
              />
            ))}

          {/* Render location pins */}
          {filteredLocations.map(loc => (
            <Marker
              key={loc._id}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={createMarkerIcon(loc.estimatedWaitTime)}
            >
              <Popup className="custom-map-popup">
                <div className="p-xs min-w-[200px] flex flex-col gap-sm text-on-surface">
                  <div>
                    <h3 className="font-label-md text-label-md font-bold leading-tight">{loc.name}</h3>
                    <p className="font-label-sm text-[10px] text-on-surface-variant">{loc.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-sm border-y border-outline-variant py-xs">
                    <div>
                      <div className="font-label-sm text-[9px] text-outline uppercase font-semibold">Live Wait</div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">{formatWaitTime(loc.estimatedWaitTime)}</div>
                    </div>
                    <div>
                      <div className="font-label-sm text-[9px] text-outline uppercase font-semibold">Serving</div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">#{loc.currentlyServing}</div>
                    </div>
                  </div>

                  <div className="flex gap-sm">
                    <button
                      onClick={() => navigate(`/app/location/${loc._id}`)}
                      className="flex-1 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low text-center py-xs rounded font-label-sm text-[11px] font-bold cursor-pointer"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => navigate(`/app/report?loc=${loc._id}`)}
                      className="flex-1 bg-primary text-on-primary hover:bg-primary-container text-center py-xs rounded font-label-sm text-[11px] font-bold cursor-pointer"
                    >
                      Report
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
export default MapPage;
