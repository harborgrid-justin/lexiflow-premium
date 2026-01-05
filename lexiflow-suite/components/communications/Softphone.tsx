
import React, { useState } from 'react';
import { Phone, Mic, MicOff, Video, X, User, Voicemail, History, Grip } from 'lucide-react';

export const Softphone: React.FC = () => {
    const [screen, setScreen] = useState<'dialpad' | 'active'>('dialpad');
    const [number, setNumber] = useState('');

    const handleDigit = (digit: string) => setNumber(prev => prev + digit);

    return (
        <div className="w-80 bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-700 h-[500px]">
            {screen === 'dialpad' ? (
                <>
                    <div className="p-6 bg-slate-800 text-white text-right border-b border-slate-700 h-24 flex items-end justify-end">
                        <span className="text-3xl font-light tracking-widest">{number || '...'}</span>
                    </div>
                    <div className="flex-1 p-6 grid grid-cols-3 gap-4">
                        {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => (
                            <button 
                                key={n} 
                                onClick={() => handleDigit(n.toString())}
                                className="h-14 w-14 rounded-full bg-slate-800 text-white text-xl font-bold flex items-center justify-center hover:bg-slate-700 transition-colors mx-auto"
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className="p-6 bg-slate-800 flex justify-center items-center gap-6">
                        <button className="text-slate-400 hover:text-white"><History size={24}/></button>
                        <button onClick={() => setScreen('active')} className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 transition-transform hover:scale-105 active:scale-95">
                            <Phone size={32} className="text-white fill-white"/>
                        </button>
                        <button className="text-slate-400 hover:text-white"><Voicemail size={24}/></button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-white relative bg-gradient-to-b from-slate-800 to-slate-900">
                    <div className="w-24 h-24 rounded-full bg-slate-700 mb-6 flex items-center justify-center border-4 border-slate-600 shadow-xl">
                        <User size={48} className="text-slate-400"/>
                    </div>
                    <h3 className="text-2xl font-light mb-2">John Doe</h3>
                    <p className="text-green-400 text-sm font-mono animate-pulse">00:42</p>
                    
                    <div className="grid grid-cols-3 gap-6 mt-12 w-full">
                        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-white"><Mic size={24}/><span className="text-[10px]">Mute</span></button>
                        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-white"><Grip size={24}/><span className="text-[10px]">Keypad</span></button>
                        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-white"><Video size={24}/><span className="text-[10px]">Video</span></button>
                    </div>
                    
                    <button onClick={() => setScreen('dialpad')} className="mt-12 h-16 w-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-transform hover:scale-105">
                        <Phone size={32} className="text-white fill-white rotate-[135deg]"/>
                    </button>
                </div>
            )}
        </div>
    );
};
