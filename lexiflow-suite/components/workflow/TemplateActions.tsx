
import React from 'react';
import { Copy, Edit3, Trash2, MoreHorizontal } from 'lucide-react';

export const TemplateActions: React.FC = () => {
  return (
    <div className="relative group inline-block">
      <button className="p-2 hover:bg-slate-100 rounded text-slate-500">
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20 py-1">
        <button className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center text-slate-700">
          <Edit3 className="h-3 w-3 mr-2" /> Edit
        </button>
        <button className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center text-slate-700">
          <Copy className="h-3 w-3 mr-2" /> Clone
        </button>
        <div className="border-t border-slate-100 my-1"></div>
        <button className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-center text-red-600">
          <Trash2 className="h-3 w-3 mr-2" /> Delete
        </button>
      </div>
    </div>
  );
};
