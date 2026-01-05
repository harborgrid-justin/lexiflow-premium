
import React from 'react';
import { Palette, Copy, Check } from 'lucide-react';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

const ColorSwatch = ({ name, hex, className, textClass = "text-slate-500" }: { name: string, hex: string, className: string, textClass?: string }) => {
    const [copied, setCopied] = React.useState(false);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2 group cursor-pointer" onClick={copyToClipboard}>
            <div className={`h-16 w-full rounded-lg shadow-sm border border-black/5 flex items-center justify-center relative ${className}`}>
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg`}>
                    {copied ? <Check className="text-white h-5 w-5 drop-shadow-md"/> : <Copy className="text-white h-5 w-5 drop-shadow-md"/>}
                </div>
            </div>
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">{name}</span>
                    <span className={`text-[10px] uppercase font-mono ${textClass}`}>{hex}</span>
                </div>
            </div>
        </div>
    );
};

export const DesignColors = () => {
  return (
    <div className="space-y-12 animate-fade-in">
        <SectionHeading title="Color System" icon={Palette} count="Tailwind Palette" />

        <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-900 border-b pb-2">Brand & Structure</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DemoContainer>
                    <ComponentLabel id="COL-01" name="Primary Blue" />
                    <div className="grid grid-cols-5 gap-3">
                        <ColorSwatch name="50" hex="#eff6ff" className="bg-blue-50"/>
                        <ColorSwatch name="100" hex="#dbeafe" className="bg-blue-100"/>
                        <ColorSwatch name="500" hex="#3b82f6" className="bg-blue-500"/>
                        <ColorSwatch name="600" hex="#2563eb" className="bg-blue-600"/>
                        <ColorSwatch name="900" hex="#1e3a8a" className="bg-blue-900"/>
                    </div>
                </DemoContainer>

                <DemoContainer>
                    <ComponentLabel id="COL-02" name="Neutral Slate" />
                    <div className="grid grid-cols-5 gap-3">
                        <ColorSwatch name="50" hex="#f8fafc" className="bg-slate-50"/>
                        <ColorSwatch name="100" hex="#f1f5f9" className="bg-slate-100"/>
                        <ColorSwatch name="400" hex="#94a3b8" className="bg-slate-400"/>
                        <ColorSwatch name="600" hex="#475569" className="bg-slate-600"/>
                        <ColorSwatch name="900" hex="#0f172a" className="bg-slate-900"/>
                    </div>
                </DemoContainer>
            </div>
        </div>
    </div>
  );
};
