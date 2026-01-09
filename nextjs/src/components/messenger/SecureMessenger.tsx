'use client';

import { DataService } from '@/services/data/dataService';
import { Archive, FileText, MessageSquare, MoreVertical, Paperclip, Plus, Search, Send, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
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
                // Use DataService.messenger
                const messenger = await (DataService as any).messenger;
                const threadList = messenger.getThreads ? await messenger.getThreads() : [];
                setThreads(threadList);

                if (threadList.length > 0) {
                    setActiveThread(threadList[0].id);
                }
            } catch (e) {
                console.error(e);
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
                const messenger = await (DataService as unknown).messenger;
                // Mocking fetch logic via messenger service
                const msgs = messenger.getMessages ? await messenger.getMessages(activeThread) : [];
                setMessages(msgs);
            } catch (e) { console.error(e); }
        }
        loadMessages();
    }, [activeThread]);

    const handleSend = async () => {
        if (!input.trim() || !activeThread) return;
        try {
            const messenger = await (DataService as unknown).messenger;
            await messenger.sendMessage(activeThread, input);

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

    return (
        <Card className="h-150 flex overflow-hidden">
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search threads..." className="pl-8" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {threads.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setActiveThread(t.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-muted ${activeThread === t.id ? 'bg-muted' : ''}`}
                        >
                            <div className="font-semibold">{t.participants.join(', ')}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{t.lastMessage}</div>
                        </div>
                    ))}
                </ScrollArea>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                    <h3 className="font-semibold">Chat</h3>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${m.isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{m.content}</p>
                                    <span className="text-xs opacity-70 mt-1 block">{new Date(m.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t flex gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
                </div>
            </div>
        </Card>
    );
}
