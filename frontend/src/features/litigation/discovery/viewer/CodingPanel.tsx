
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

export const CodingPanel: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-80 border-l flex flex-col shrink-0 shadow-xl animate-in slide-in-from-right duration-200 z-10", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default, theme.surface.highlight)}>
            <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.primary)}>Coding & Metadata</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Review Status</label>
                <div className="space-y-2">
                    <label className={cn("flex items-center p-2 border rounded cursor-pointer", theme.border.default, `hover:${theme.surface.highlight}`)}>
                        <input type="radio" name="status" className="mr-2"/> 
                        <span className={theme.text.primary}>Responsive</span>
                    </label>
                    <label className={cn("flex items-center p-2 border rounded cursor-pointer", theme.border.default, `hover:${theme.surface.highlight}`)}>
                        <input type="radio" name="status" className="mr-2"/> 
                        <span className={theme.text.primary}>Non-Responsive</span>
                    </label>
                    <label className="flex items-center p-2 border rounded hover:bg-amber-50 cursor-pointer bg-amber-50/50 border-amber-200">
                        <input type="radio" name="status" className="mr-2"/> 
                        <span className="text-amber-800">Needs Further Review</span>
                    </label>
                </div>
            </div>

            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Privilege</label>
                <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="priv" className="rounded text-blue-600"/>
                    <label htmlFor="priv" className={cn("text-sm font-medium", theme.text.primary)}>Mark as Privileged</label>
                </div>
                <select className={cn("w-full text-sm rounded-md p-2 border", theme.border.default, theme.surface.highlight, theme.text.secondary)} disabled>
                    <option>Attorney-Client</option>
                    <option>Work Product</option>
                </select>
            </div>

            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Issue Tags</label>
                <div className="flex flex-wrap gap-2">
                    {['Damages', 'Liability', 'Key Witness', 'Timeline'].map(tag => (
                        <span key={tag} className={cn("px-2 py-1 rounded text-xs border cursor-pointer transition-colors", theme.surface.highlight, theme.border.default, theme.text.secondary, "hover:bg-blue-50 hover:text-blue-600")}>
                            {tag}
                        </span>
                    ))}
                    <button className={cn("px-2 py-1 border border-dashed rounded text-xs hover:text-blue-500", theme.border.default, theme.text.tertiary)}>+ Add</button>
                </div>
            </div>

            <div className={cn("pt-4 border-t", theme.border.default)}>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Notes</label>
                <textarea className={cn("w-full border rounded-md p-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none", theme.border.default, theme.surface.default, theme.text.primary)} placeholder="Reviewer comments..."></textarea>
            </div>
        </div>

        <div className={cn("p-4 border-t flex justify-between", theme.border.default, theme.surface.highlight)}>
            <Button variant="ghost" size="sm" icon={ChevronLeft}>Prev Doc</Button>
            <Button variant="primary" size="sm">Save & Next <ChevronRight className="h-4 w-4 ml-1"/></Button>
        </div>
    </div>
  );
};

export default CodingPanel;
