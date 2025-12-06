import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Palette, Type, Layout, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';

export const StickerDesigner: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [config, setConfig] = useState({
    color: '#fbbf24', // Amber-400 default (Yellow sticker)
    prefix: 'PX',
    startNumber: 101,
    footer: 'C-2024-001',
    shape: 'rounded-md',
    party: 'Plaintiff'
  });

  const handlePopOutPreview = () => {
      const winId = `sticker-preview-${Date.now()}`;
      openWindow(
          winId,
          'Sticker Preview',
          <div className="flex items-center justify-center h-full bg-slate-100 p-10">
              <div className="relative w-full max-w-md bg-white shadow-2xl border p-8 aspect-[3/4]">
                  <div className="absolute inset-0 p-8 text-slate-300 text-xs leading-loose select-none pointer-events-none">
                       LOREM IPSUM DOLOR SIT AMET... (MOCK DOC CONTENT)
                  </div>
                   <div 
                        className={cn(
                            "absolute bottom-8 right-8 w-32 h-20 flex flex-col items-center justify-center shadow-md border border-black/10 select-none cursor-move",
                            config.shape
                        )}
                        style={{ backgroundColor: config.color }}
                    >
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-0.5">{config.party || 'EXHIBIT'}</div>
                        <div className="text-2xl font-bold leading-none font-mono tracking-tight">{config.prefix}-{config.startNumber}</div>
                        <div className="text-[8px] mt-1 font-medium opacity-70">{config.footer}</div>
                    </div>
              </div>
          </div>
      );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-1 space-y-6">
            <Card title="Sticker Configuration">
                <div className="space-y-4">
                    <div>
                        <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Sticker Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setConfig({...config, color: '#fbbf24', prefix: 'PX', party: 'Plaintiff'})}
                                className={cn("p-2 border rounded text-center text-xs font-bold hover:bg-slate-50", config.color === '#fbbf24' ? "ring-2 ring-blue-500 border-transparent" : "")}
                            >
                                <div className="w-4 h-4 bg-amber-400 mx-auto mb-1 rounded-sm"></div>
                                Plaintiff
                            </button>
                            <button 
                                onClick={() => setConfig({...config, color: '#60a5fa', prefix: 'DX', party: 'Defense'})}
                                className={cn("p-2 border rounded text-center text-xs font-bold hover:bg-slate-50", config.color === '#60a5fa' ? "ring-2 ring-blue-500 border-transparent" : "")}
                            >
                                <div className="w-4 h-4 bg-blue-400 mx-auto mb-1 rounded-sm"></div>
                                Defense
                            </button>
                            <button 
                                onClick={() => setConfig({...config, color: '#ffffff', prefix: 'JX', party: 'Joint'})}
                                className={cn("p-2 border rounded text-center text-xs font-bold hover:bg-slate-50", config.color === '#ffffff' ? "ring-2 ring-blue-500 border-transparent" : "")}
                            >
                                <div className="w-4 h-4 bg-white border border-slate-300 mx-auto mb-1 rounded-sm"></div>
                                White
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Prefix</label>
                            <input 
                                className={cn("w-full p-2 border rounded text-sm", theme.surface, theme.border.default)}
                                value={config.prefix}
                                onChange={e => setConfig({...config, prefix: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Start #</label>
                            <input 
                                type="number"
                                className={cn("w-full p-2 border rounded text-sm", theme.surface, theme.border.default)}
                                value={config.startNumber}
                                onChange={e => setConfig({...config, startNumber: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Case / Footer Text</label>
                        <input 
                            className={cn("w-full p-2 border rounded text-sm", theme.surface, theme.border.default)}
                            value={config.footer}
                            onChange={e => setConfig({...config, footer: e.target.value})}
                        />
                    </div>

                    <Button className="w-full mt-4" icon={Save}>Save Preset</Button>
                </div>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <div className={cn("h-full rounded-xl border flex flex-col items-center justify-center p-10 bg-slate-100/50", theme.border.default)}>
                <div className="mb-8 text-center">
                    <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>Live Preview</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Digital overlay as it will appear on documents.</p>
                </div>

                {/* Sticker Visualization */}
                <div className="relative w-64 h-80 bg-white shadow-xl border border-slate-200 p-8 flex items-end justify-end">
                    <div className="absolute inset-0 p-4 text-[8px] text-slate-300 pointer-events-none select-none">
                        lorem ipsum dolor sit amet... (document content)
                    </div>
                    
                    {/* The Sticker */}
                    <div 
                        className={cn(
                            "w-24 h-16 flex flex-col items-center justify-center shadow-md border border-black/10 select-none cursor-move",
                            config.shape
                        )}
                        style={{ backgroundColor: config.color }}
                    >
                        <div className="text-[8px] uppercase font-bold tracking-wider opacity-80 mb-0.5">{config.party || 'EXHIBIT'}</div>
                        <div className="text-xl font-bold leading-none font-mono tracking-tight">{config.prefix}-{config.startNumber}</div>
                        <div className="text-[6px] mt-1 font-medium opacity-70">{config.footer}</div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <Button variant="secondary" icon={RefreshCw} onClick={() => setConfig({...config, startNumber: config.startNumber + 1})}>Test Increment</Button>
                    <Button variant="outline" icon={ExternalLink} onClick={handlePopOutPreview}>Detach Preview</Button>
                    <Button variant="primary">Apply to Selection</Button>
                </div>
            </div>
        </div>
    </div>
  );
};
