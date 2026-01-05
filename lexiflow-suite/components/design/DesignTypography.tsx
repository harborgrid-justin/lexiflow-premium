
import React from 'react';
import { Type } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignTypography = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        <SectionHeading title="Typography" icon={Type} count="TYP-01 to TYP-10" />
        
        <div className="grid grid-cols-1 gap-6">
            <DemoContainer>
                <ComponentLabel id="TYP-01" name="Headings Scale" />
                <div className="space-y-6">
                    <div className="flex items-baseline border-b border-slate-100 pb-2">
                        <span className="w-24 text-xs text-slate-400 font-mono">H1 / 3xl</span>
                        <h1 className="text-3xl font-bold text-slate-900">The quick brown fox jumps over the lazy dog</h1>
                    </div>
                    <div className="flex items-baseline border-b border-slate-100 pb-2">
                        <span className="w-24 text-xs text-slate-400 font-mono">H2 / 2xl</span>
                        <h2 className="text-2xl font-bold text-slate-900">The quick brown fox jumps over the lazy dog</h2>
                    </div>
                    <div className="flex items-baseline border-b border-slate-100 pb-2">
                        <span className="w-24 text-xs text-slate-400 font-mono">H3 / xl</span>
                        <h3 className="text-xl font-bold text-slate-900">The quick brown fox jumps over the lazy dog</h3>
                    </div>
                    <div className="flex items-baseline border-b border-slate-100 pb-2">
                        <span className="w-24 text-xs text-slate-400 font-mono">H4 / lg</span>
                        <h4 className="text-lg font-bold text-slate-900">The quick brown fox jumps over the lazy dog</h4>
                    </div>
                </div>
            </DemoContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DemoContainer>
                <ComponentLabel id="TYP-03" name="Font Families" />
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sans-Serif (Primary)</span>
                        <p className="font-sans text-2xl text-slate-800">Inter</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Serif (Formal / Legal)</span>
                        <p className="font-serif text-2xl text-slate-800">Merriweather</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Monospace (Code / Data)</span>
                        <p className="font-mono text-2xl text-slate-800">JetBrains Mono</p>
                    </div>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};
