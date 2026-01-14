import { TextArea } from '@/shared/ui/atoms/TextArea/TextArea';
import { useTheme } from '@/theme';
import { PleadingSection } from '@/types';
import { cn } from '@/shared/lib/cn';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold } from 'lucide-react';
interface PropertyPanelProps {
    section?: PleadingSection;
    onUpdate: (updates: Partial<PleadingSection>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ section, onUpdate }) => {
    const { theme } = useTheme();

    if (!section) {
        return <div className="text-center text-slate-400 mt-10 text-sm">Select a section to configure properties.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Section Type</label>
                <div className={cn("p-2 bg-slate-100 rounded text-sm font-medium", theme.text.primary)}>{section.type}</div>
            </div>

            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Formatting</label>
                <div className="flex gap-2 mb-4">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                        <button
                            key={align}
                            onClick={() => onUpdate({ meta: { ...section.meta, alignment: align as "center" | "left" | "right" | "justify" } })}
                            className={cn(
                                "p-2 rounded border transition-colors",
                                section.meta?.alignment === align ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            {align === 'left' && <AlignLeft className="h-4 w-4" />}
                            {align === 'center' && <AlignCenter className="h-4 w-4" />}
                            {align === 'right' && <AlignRight className="h-4 w-4" />}
                            {align === 'justify' && <AlignJustify className="h-4 w-4" />}
                        </button>
                    ))}
                    <button
                        onClick={() => onUpdate({ meta: { ...section.meta, isBold: !section.meta?.isBold } })}
                        className={cn(
                            "p-2 rounded border transition-colors ml-auto",
                            section.meta?.isBold ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {section.type !== 'Caption' && section.type !== 'Signature' && (
                <div>
                    <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Content</label>
                    <TextArea
                        rows={6}
                        value={section.content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ content: e.target.value })}
                        className="font-serif text-sm"
                    />
                </div>
            )}
        </div>
    );
};
