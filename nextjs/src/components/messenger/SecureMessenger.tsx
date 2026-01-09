'use client';

import { DataService } from '@/services/data/dataService';
import { Search, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';

interface Message {
    id: string;
    content: string;
    timestamp: string;
    sender: string;
    isMe: boolean;
}

interface Thread {
    id: string;
    participants: string[];
    lastMessage: string;
    updatedAt: string;
}

interface MessengerServiceType {
    getThreads: () => Promise<Thread[]>;
    getMessages: (threadId: string) => Promise<Message[]>;
    sendMessage: (threadId: string, content: string) => Promise<void>;
}

// Type definition to allow safe access to dynamic service properties
type DataServiceWithMessenger = {
    messenger: Promise<MessengerServiceType>;
};

export default function SecureMessenger() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Access dynamic property safely
                const ds = DataService as unknown as DataServiceWithMessenger;
                const messenger = await ds.messenger;

                // Fallback if service not fully implemented
                if (!messenger || !messenger.getThreads) {
                    setThreads([
                        { id: '1', participants: ['John Doe'], lastMessage: 'See you in court', updatedAt: new Date().toISOString() },
                        { id: '2', participants: ['Jane Smith'], lastMessage: 'Discovery docs attached', updatedAt: new Date(Date.now() - 86400000).toISOString() }
                    ]);
                    setActiveThread('1');
                    return;
                }

                const threadList = await messenger.getThreads();
                setThreads(threadList);

                if (threadList.length > 0) {
                    setActiveThread(threadList[0].id);
                }
            } catch (e) {
                console.error("Failed to load threads", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (!activeThread) return;
        async function loadMessages() {
            try {
                const ds = DataService as unknown as DataServiceWithMessenger;
                const messenger = await ds.messenger;

                if (!messenger || !messenger.getMessages) {
                    // Fallback mock
                    setMessages([
                        { id: '1', content: 'Hello, regarding the settlement...', sender: 'John Doe', isMe: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
                        { id: '2', content: 'Yes, I reviewed the terms.', sender: 'Me', isMe: true, timestamp: new Date().toISOString() }
                    ]);
                    return;
                }

                const msgs = await messenger.getMessages(activeThread);
                setMessages(msgs);
            } catch (e) { console.error(e); }
        }
        loadMessages();
    }, [activeThread]);

    const handleSend = async () => {
        if (!input.trim() || !activeThread) return;
        try {
            const ds = DataService as unknown as DataServiceWithMessenger;
            const messenger = await ds.messenger;

            if (messenger && messenger.sendMessage) {
                await messenger.sendMessage(activeThread, input);
            }

            // Optimistic update
            setMessages([...messages, {
                id: Date.now().toString(),
                content: input,
                timestamp: new Date().toISOString(),
                sender: 'Me',
                isMe: true
            }]);
            setInput('');
        } catch (e) {
            console.error('Failed to send', e);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    const activeThreadData = threads.find(t => t.id === activeThread);

    return (
        <Card className="h-150 flex overflow-hidden border shadow-sm">
            {/* Thread List */}
            <div className="w-1/3 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search threads..." className="pl-9 bg-background" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {threads.map(t => (
                        <div
                            key={t.id}
                            className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${activeThread === t.id ? 'bg-muted' : ''}`}
                            onClick={() => setActiveThread(t.id)}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.participants[0]}`} />
                                    <AvatarFallback>{t.participants[0][0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-sm font-semibold truncate">{t.participants.join(', ')}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col bg-background">
                {activeThread ? (
                    <>
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold">{activeThreadData?.participants.join(', ')}</h3>
                            <Button variant="ghost" size="sm">Details</Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map(m => (
                                    <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 ${m.isMe ? 'bg-primary text-primary-foreground' : 'bg-muted border'}`}>
                                            <p className="text-sm">{m.content}</p>
                                            <span className="text-[10px] opacity-70 block mt-1 text-right">
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t flex gap-2">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a secure message..."
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <Button onClick={handleSend} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </Card>
    );
}
