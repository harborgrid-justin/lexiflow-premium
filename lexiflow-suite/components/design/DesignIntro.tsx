
import React from 'react';
import { Palette, Box, LayoutTemplate, Scale, Zap, ArrowRight } from 'lucide-react';
import { MetricCard } from '../common/Primitives.tsx';

export const DesignIntro = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Palette className="h-8 w-8 text-blue-300" />
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">LexiFlow DS <span className="text-blue-400">v3.1</span></h1>
            </div>
            <p className="text-blue-100 text-xl leading-relaxed max-w-2xl font-light">
            The definitive enterprise design system for high-density legal applications. 
            Contains <strong>115+</strong> atomic components, molecular patterns, and advanced data visualizations tailored for the legal industry.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
                <button onClick={() => onNavigate('colors')} className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center">
                    Explore Tokens <ArrowRight className="ml-2 h-4 w-4"/>
                </button>
            </div>
        </div>
        <div className="absolute -right-20 -top-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute right-40 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute right-10 top-10 text-white/5"><LayoutTemplate size={300} strokeWidth={0.5}/></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Total Assets" value="450+" icon={Box} className="border-l-4 border-l-blue-500"/>
        <MetricCard label="Layouts" value="75" icon={LayoutTemplate} className="border-l-4 border-l-indigo-500"/>
        <MetricCard label="Legal Patterns" value="110" icon={Scale} className="border-l-4 border-l-purple-500"/>
        <MetricCard label="Tokens" value="1.4k" icon={Zap} className="border-l-4 border-l-emerald-500"/>
      </div>
    </div>
  );
};
