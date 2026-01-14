/**
 * @module components/exhibits/StickerDesigner
 * @category Exhibits - Design Tools
 * @description Interactive tool for designing and previewing digital exhibit stickers.
 * Allows customization of color, prefix, numbering, and shape.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border for consistent theming. Custom colors for sticker background.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ExternalLink, RefreshCw, Save } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';
import { useWindow } from '@/providers';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================

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
            <div className={cn("flex items-center justify-center h-full p-10", theme.surface.default)}>
                <div className={cn("relative w-full max-w-md shadow-2xl border p-8 aspect-[3/4]", theme.surface.raised, theme.border.default)}>
                    <div className={cn("absolute inset-0 p-8 text-xs leading-loose select-none pointer-events-none", theme.text.tertiary)}>
                        {/* Document Content Placeholder */}
                        <div className="space-y-4 opacity-10">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-2 bg-current rounded" style={{ width: `${Math.max(40, Math.random() * 100)}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div
                        className={cn(
                            "absolute bottom-8 right-8 w-32 h-20 flex flex-col items-center justify-center shadow-md border select-none cursor-move",
                            config.shape,
                            theme.border.subtle
                        )}
                        style={{ backgroundColor: config.color, borderColor: 'rgba(0,0,0,0.1)' }}
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
                                    onClick={() => setConfig({ ...config, color: '#fbbf24', prefix: 'PX', party: 'Plaintiff' })}
                                    className={cn("p-2 border rounded text-center text-xs font-bold transition-all", theme.border.default, config.color === '#fbbf24' ? "ring-2 border-transparent ring-blue-500" : "")}
                                >
                                    <div className="w-4 h-4 bg-amber-400 mx-auto mb-1 rounded-sm"></div>
                                    Plaintiff
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, color: '#60a5fa', prefix: 'DX', party: 'Defense' })}
                                    className={cn("p-2 border rounded text-center text-xs font-bold transition-all", theme.border.default, config.color === '#60a5fa' ? "ring-2 border-transparent ring-blue-500" : "")}
                                >
                                    <div className="w-4 h-4 bg-blue-400 mx-auto mb-1 rounded-sm"></div>
                                    Defense
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, color: '#ffffff', prefix: 'JX', party: 'Joint' })}
                                    className={cn("p-2 border rounded text-center text-xs font-bold transition-all", theme.border.default, config.color === '#ffffff' ? "ring-2 border-transparent ring-blue-500" : "")}
                                >
                                    <div className={cn("w-4 h-4 bg-white border mx-auto mb-1 rounded-sm", theme.border.default)}></div>
                                    White
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Prefix</label>
                                <input
                                    className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                                    value={config.prefix}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, prefix: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Start #</label>
                                <input
                                    type="number"
                                    className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                                    value={config.startNumber}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, startNumber: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Case / Footer Text</label>
                            <input
                                className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                                value={config.footer}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, footer: e.target.value })}
                            />
                        </div>

                        <Button className="w-full mt-4" icon={Save}>Save Preset</Button>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <div className={cn("h-full rounded-xl border flex flex-col items-center justify-center p-10", theme.border.default, theme.surface.default)}>
                    <div className="mb-8 text-center">
                        <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>Live Preview</h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Digital overlay as it will appear on documents.</p>
                    </div>

                    {/* Sticker Visualization */}
                    <div className={cn("relative w-64 h-80 shadow-xl border p-8 flex items-end justify-end", theme.surface.default, theme.border.default)}>
                        <div className={cn("absolute inset-0 p-4 text-[8px] pointer-events-none select-none", theme.text.tertiary)}>
                            lorem ipsum dolor sit amet... (document content)
                        </div>

                        {/* The Sticker */}
                        <div
                            className={cn(
                                "w-24 h-16 flex flex-col items-center justify-center shadow-md border select-none cursor-move",
                                config.shape
                            )}
                            style={{ backgroundColor: config.color, borderColor: 'rgba(0,0,0,0.1)' }}
                        >
                            <div className="text-[8px] uppercase font-bold tracking-wider opacity-80 mb-0.5">{config.party || 'EXHIBIT'}</div>
                            <div className="text-xl font-bold leading-none font-mono tracking-tight">{config.prefix}-{config.startNumber}</div>
                            <div className="text-[6px] mt-1 font-medium opacity-70">{config.footer}</div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Button variant="secondary" icon={RefreshCw} onClick={() => setConfig(prev => ({ ...prev, startNumber: prev.startNumber + 1 }))}>Test Increment</Button>
                        <Button variant="outline" icon={ExternalLink} onClick={handlePopOutPreview}>Detach Preview</Button>
                        <Button variant="primary">Apply to Selection</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
