
import React, { useState, useTransition } from 'react';
import { Case } from '../../types.ts';
import { Send, Paperclip, Lock, Shield, FileText } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

interface CaseMessagesProps {
  caseData: Case;
}

interface Message {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  isPrivileged: boolean;
  attachments?: string[];
}

export const CaseMessages: React.FC<CaseMessagesProps> = ({ caseData }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1', sender: 'Alexandra H.', role: 'Senior Partner',
      text: `Team, regarding ${caseData.title}, we need to expedite the discovery review. The judge is pushing for a conference next week.`,
      timestamp: 'Yesterday 09:30 AM', isPrivileged: true
    },
    {
      id: 'm2', sender: 'Sarah Jenkins', role: 'Paralegal',
      text: 'Understood. I have uploaded the latest production set to the Discovery center. Waiting on OCR.',
      timestamp: 'Yesterday 10:15 AM', isPrivileged: true, attachments: ['Production_Set_004.pdf']
    },
    {
      id: 'm3', sender: 'John Doe', role: 'Client',
      text: 'I found the old email archives you asked for. How should I send them securely?',
      timestamp: 'Today 08:00 AM', isPrivileged: true
    }
  ]);
  
  // Guideline 3: Keep input responsive while list updates
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'Me',
      role: 'Attorney',
      text: inputText,
      timestamp: 'Just now',
      isPrivileged: true
    };
    
    startTransition(() => {
        setMessages([...messages, newMsg]);
        setInputText('');
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Thread Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
            <Lock className="h-4 w-4 text-emerald-600"/> Case Communication
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Secure Channel • {caseData.client}</p>
        </div>
        <div className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
           <Shield className="h-3 w-3 mr-1.5"/> PRIVILEGED
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        {messages.map((msg) => {
          const isMe = msg.sender === 'Me';
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <UserAvatar name={msg.sender} className="mt-1 ring-2 ring-white shadow-sm"/>
              <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                   <span className="text-xs font-bold text-slate-700">{msg.sender}</span>
                   <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
                {/* Design System: Chat Message (CD-06) */}
                <div className={`p-3 rounded-2xl text-sm shadow-sm relative ${
                   isMe 
                   ? 'bg-blue-600 text-white rounded-tr-none' 
                   : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                   <div className="leading-relaxed">{msg.text}</div>
                   {msg.attachments && (
                     <div className="mt-3 space-y-1">
                       {msg.attachments.map(att => (
                         <div key={att} className={`flex items-center p-2 rounded text-xs font-medium ${isMe ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                            <FileText className="h-3 w-3 mr-2 opacity-80"/> {att}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area (INP-34 style) */}
      <div className="p-4 bg-white border-t border-slate-200">
         <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors">
                <Paperclip className="h-5 w-5"/>
            </button>
            <input 
              className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-800 placeholder:text-slate-400"
              placeholder="Type a secure message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button variant="primary" className="rounded-full px-4 py-1.5 h-auto text-xs" onClick={handleSend} disabled={!inputText}>
                Send <Send className="h-3 w-3 ml-1.5"/>
            </Button>
         </div>
         <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center">
            <Lock className="h-2.5 w-2.5 mr-1"/> End-to-end encrypted. Contents are discoverable only by court order.
         </p>
      </div>
    </div>
  );
};
