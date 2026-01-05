
import React from 'react';
import { Map, MapPin } from 'lucide-react';

export const JurisdictionGeoMap: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 flex items-center"><Map className="h-5 w-5 mr-2 text-blue-600"/> Jurisdiction Map</h3>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Federal Circuit</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> State Court</span>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-100 relative flex items-center justify-center">
        {/* Placeholder for an actual interactive map library like Leaflet or Google Maps */}
        <div className="text-center text-slate-400">
          <Map className="h-24 w-24 mx-auto mb-4 opacity-20"/>
          <p className="text-lg font-medium">Interactive Venue Map</p>
          <p className="text-sm">Visualizing Circuit Boundaries and District Divisions.</p>
        </div>

        {/* Mock Pins */}
        <div className="absolute top-1/3 left-1/4 flex flex-col items-center group cursor-pointer">
          <MapPin className="h-8 w-8 text-blue-600 drop-shadow-md group-hover:-translate-y-1 transition-transform"/>
          <span className="bg-white px-2 py-1 rounded shadow text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">9th Circuit (SF)</span>
        </div>
        <div className="absolute top-1/2 right-1/3 flex flex-col items-center group cursor-pointer">
          <MapPin className="h-8 w-8 text-blue-600 drop-shadow-md group-hover:-translate-y-1 transition-transform"/>
          <span className="bg-white px-2 py-1 rounded shadow text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">2nd Circuit (NY)</span>
        </div>
        <div className="absolute bottom-1/3 left-1/2 flex flex-col items-center group cursor-pointer">
          <MapPin className="h-8 w-8 text-green-600 drop-shadow-md group-hover:-translate-y-1 transition-transform"/>
          <span className="bg-white px-2 py-1 rounded shadow text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Texas District Court</span>
        </div>
      </div>
    </div>
  );
};
