
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Highlighter, MessageSquare, Search, Download } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const DepositionManager: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:14:22');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Video Player & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-black rounded-xl aspect-video flex items-center justify-center relative group">
                <div className="text-white text-center">
                    <p className="font-bold text-lg">Deposition: John Smith (CEO)</p>
                    <p className="text-sm opacity-70">Oct 12, 2023 • Vol 1</p>
                </div>
                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-400">
                        {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                    </button>
                    <div className="flex-1 h-1 bg-slate-600 rounded-full cursor-pointer relative">
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-500 w-[24%] rounded-full"></div>
                        <div className="absolute left-[24%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                    </div>
                    <span className="text-white font-mono text-xs">{currentTime}</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Transcript Viewer</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3 w-3 text-slate-400"/>
                            <input className="pl-7 pr-2 py-1 border rounded text-xs w-48" placeholder="Search keywords..."/>
                        </div>
                        <Button size="sm" variant="outline" icon={Download}>Export</Button>
                    </div>
                </div>
                <div className="h-64 overflow-y-auto border rounded bg-slate-50 p-4 font-mono text-sm leading-loose">
                    <p className="mb-2"><span className="text-blue-600 font-bold mr-2">Q. (Atty)</span> State your name for the record.</p>
                    <p className="mb-2"><span className="text-slate-600 font-bold mr-2">A. (Smith)</span> John Alexander Smith.</p>
                    <p className="mb-2"><span className="text-blue-600 font-bold mr-2">Q. (Atty)</span> Were you present at the board meeting on July 4th?</p>
                    <p className="mb-2 bg-yellow-100 -mx-2 px-2 rounded"><span className="text-slate-600 font-bold mr-2">A. (Smith)</span> I don't recall the specific date, but I attended the Q3 strategy session.</p>
                    <p className="mb-2"><span className="text-blue-600 font-bold mr-2">Q. (Atty)</span> Let me show you Exhibit A. Does this refresh your recollection?</p>
                </div>
            </div>
        </div>

        {/* Annotations Sidebar */}
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-sm">Annotations & Issues</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs">
                    <div className="flex justify-between font-bold text-yellow-800 mb-1">
                        <span>Key Admission</span>
                        <span>00:14:20</span>
                    </div>
                    <p className="text-yellow-900">Witness admits to being at the strategy session despite previous denial.</p>
                    <div className="mt-2 flex gap-2">
                        <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600"><Play size={10}/> Jump to</button>
                        <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600"><MessageSquare size={10}/> Comment</button>
                    </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                    <div className="flex justify-between font-bold text-blue-800 mb-1">
                        <span>Exhibit A Intro</span>
                        <span>00:15:05</span>
                    </div>
                    <p className="text-blue-900">Introduction of the "Smoking Gun" email chain.</p>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200">
                <Button className="w-full" icon={Highlighter}>Add Note at {currentTime}</Button>
            </div>
        </div>
    </div>
  );
};
