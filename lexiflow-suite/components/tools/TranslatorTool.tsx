
import React from 'react';
import { ArrowRightLeft, Globe } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const TranslatorTool: React.FC = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b">
                <div className="flex items-center gap-4">
                    <select className="p-2 rounded border"><option>English (Legal)</option></select>
                    <ArrowRightLeft size={16} className="text-slate-400"/>
                    <select className="p-2 rounded border"><option>Spanish (ES)</option><option>French (FR)</option></select>
                </div>
                <Button size="sm" icon={Globe}>Translate</Button>
            </div>
            <div className="flex-1 flex divide-x">
                <textarea className="flex-1 p-4 resize-none outline-none" placeholder="Enter text to translate..."></textarea>
                <div className="flex-1 p-4 bg-slate-50 text-slate-600 italic">
                    Translation will appear here...
                </div>
            </div>
        </div>
    );
};
