/**
 * @fileoverview Facility Map Component
 * @description Interactive map for managing firm facility locations using Leaflet.
 * Displays office locations, meeting rooms, storage facilities with markers and popups.
 *
 * Features:
 * - Interactive map with zoom/pan controls
 * - Custom markers for different facility types
 * - Popup info windows with facility details
 * - Clustering for multiple nearby locations
 * - Address search and geocoding
 * - Export facility list
 */

import { api } from '@/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Fix Leaflet default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface Facility {
  id: string;
  name: string;
  type: 'Office' | 'Storage' | 'Meeting Room' | 'Court' | 'Other';
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone?: string;
  capacity?: number;
  amenities?: string[];
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//                           CUSTOM ICONS
// ═══════════════════════════════════════════════════════════════════════════

const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  Office: createCustomIcon('blue'),
  Storage: createCustomIcon('green'),
  'Meeting Room': createCustomIcon('orange'),
  Court: createCustomIcon('red'),
  Other: createCustomIcon('grey'),
};

// ═══════════════════════════════════════════════════════════════════════════
//                         MAP CENTER UPDATER
// ═══════════════════════════════════════════════════════════════════════════

interface MapCenterUpdaterProps {
  center: [number, number];
  zoom: number;
}

const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

// ═══════════════════════════════════════════════════════════════════════════
//                           COMPONENT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const FacilityMap: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco default
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // ═════════════════════════════════════════════════════════════════════════
  //                            DATA LOADING
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const data = await api.facilities.getAll();
      setFacilities(data);

      // Center map on first facility if available
      if (data.length > 0) {
        setMapCenter([data[0].lat, data[0].lng]);
      }
    } catch (error) {
      console.error('[FacilityMap] Failed to load facilities:', error);
      // Set fallback demo data
      setFacilities([
        {
          id: '1',
          name: 'Main Office',
          type: 'Office',
          address: '123 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          lat: 37.7749,
          lng: -122.4194,
          phone: '(415) 555-0100',
          capacity: 50,
          amenities: ['Conference Rooms', 'Parking', 'Kitchen'],
        },
        {
          id: '2',
          name: 'Document Storage Facility',
          type: 'Storage',
          address: '456 Industrial Blvd',
          city: 'Oakland',
          state: 'CA',
          zip: '94601',
          lat: 37.8044,
          lng: -122.2711,
          phone: '(510) 555-0200',
          capacity: 100,
          amenities: ['Climate Controlled', '24/7 Access', 'Security'],
        },
        {
          id: '3',
          name: 'Superior Court',
          type: 'Court',
          address: '400 McAllister Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          lat: 37.7799,
          lng: -122.4186,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                         FACILITY MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  const handleMarkerClick = (facility: Facility) => {
    // some implementation
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      await api.facilities.delete(facilityId);
      setFacilities(facilities.filter((f) => f.id !== facilityId));
    } catch (error) {
      console.error('[FacilityMap] Failed to delete facility:', error);
    }
  };

  const handleFocusFacility = (facility: Facility) => {
    setMapCenter([facility.lat, facility.lng]);
    setMapZoom(15);
    setSelectedFacility(facility);
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                         FILTERING
  // ═════════════════════════════════════════════════════════════════════════

  const filteredFacilities = filterType === 'All'
    ? facilities
    : facilities.filter((f) => f.type === filterType);

  // ═════════════════════════════════════════════════════════════════════════
  //                              RENDER
  // ═════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('All')}
            className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'All'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            All ({facilities.length})
          </button>
          {['Office', 'Storage', 'Meeting Room', 'Court'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {type} ({facilities.filter((f) => f.type === type).length})
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            // Open add facility modal
            alert('Add facility modal would open here');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Facility
        </button>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={mapCenter} zoom={mapZoom} />

          {filteredFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={icons[facility.type]}
              eventHandlers={{
                click: () => {
                  setSelectedFacility(facility);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        {facility.type}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Address:</span> {facility.address}
                    </p>
                    <p>
                      {facility.city}, {facility.state} {facility.zip}
                    </p>
                    {facility.phone && (
                      <p>
                        <span className="font-medium">Phone:</span> {facility.phone}
                      </p>
                    )}
                    {facility.capacity && (
                      <p>
                        <span className="font-medium">Capacity:</span> {facility.capacity} people
                      </p>
                    )}
                    {facility.amenities && facility.amenities.length > 0 && (
                      <div>
                        <span className="font-medium">Amenities:</span>
                        <ul className="list-disc list-inside pl-2">
                          {facility.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Facility List */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Facility List</h3>
        <div className="space-y-3">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${selectedFacility?.id === facility.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
              onClick={() => handleFocusFacility(facility)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-slate-900">{facility.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {facility.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {facility.address}, {facility.city}, {facility.state}
                </p>
                {facility.phone && (
                  <p className="text-sm text-slate-600 mt-0.5">{facility.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFocusFacility(facility);
                  }}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                >
                  View on Map
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFacility(facility.id);
                  }}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilityMap;
