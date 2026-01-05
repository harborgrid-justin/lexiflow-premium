
import React from 'react';
import { Mic, Video, PhoneOff, Monitor, MessageSquare, Users } from 'lucide-react';

export const VideoConference: React.FC = () => {
    return (
        <div className="flex flex-col h-[600px] bg-slate-900 rounded-xl overflow-hidden">
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                        <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">JD</span>
                        </div>
                        <p className="text-white font-medium">John Doe (Client)</p>
                    </div>
                </div>
                <div className="absolute top-4 right-4 w-48 h-32 bg-slate-800 rounded-lg border-2 border-slate-700 shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs">You</span>
                </div>
            </div>
            <div className="h-16 bg-slate-800 flex items-center justify-center gap-4 px-4">
                <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600"><Mic size={20}/></button>
                <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600"><Video size={20}/></button>
                <button className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 mx-4"><PhoneOff size={24}/></button>
                <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600"><Monitor size={20}/></button>
                <button className="p-3 rounded-full bg-slate-700 text-white hover:bg-slate-600"><MessageSquare size={20}/></button>
            </div>
        </div>
    );
};
