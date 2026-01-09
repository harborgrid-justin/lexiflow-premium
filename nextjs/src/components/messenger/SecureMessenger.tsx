'use client';

// Mocking imports to ensure build stability during refactor
// import { Contact, Conversation, Message } from '@/api/communications/messaging-api';
// import { communicationsApi } from '@/api/domains/communications.api';

import { Archive, FileText, MessageSquare, MoreVertical, Paperclip, Plus, Search, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';

// Local types to guarantee stability
interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';
}

interface Participant {
    userId: string;
    userName: string;
    avatar?: string;
}

interface Conversation {
    id: string;
    name?: string; // Group name or null for 1-on-1
    participants: Participant[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
    createdAt: string;
}

interface Contact {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

const MessengerInbox = ({ conversations, loading }: { conversations: Conversation[], loading: boolean }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [msgInput, setMsgInput] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [messagesLoading, setMessagesLoading] = useState(false);

    useEffect(() => {
        if (conversations.length > 0 && !selectedId) {
            setSelectedId(conversations[0].id);
        }
    }, [conversations, selectedId]);

    useEffect(() => {
        if (!selectedId) return;
        async function fetchMessages() {
            setMessagesLoading(true);
            try {
                // Mock fetch
                setMessages([]);
            } catch (err) {
                console.error(err);
            } finally {
                setMessagesLoading(false);
            }
        }
        fetchMessages();
    }, [selectedId]);

    const selectedConv = conversations.find(c => c.id === selectedId);
    const getConvName = (c: Conversation) => c.name || c.participants.map(p => p.userName).join(', ');

    return (
        <div className="flex h-150 border rounded-lg overflow-hidden bg-background">
            {/* Chat List */}
            <div className="w-1/3 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search..."
                            className="pl-9"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No conversations</div>
                    ) : (
                        conversations.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedId(chat.id)}
                                className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${selectedId === chat.id ? 'bg-muted' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium truncate pr-2 max-w-35">{getConvName(chat)}</h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(chat.lastMessage?.createdAt || chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground truncate max-w-40">
                                        {chat.lastMessage?.content || 'No messages'}
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                            {chat.unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-background">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="" />
                                    <AvatarFallback>{getConvName(selectedConv).charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{getConvName(selectedConv)}</h3>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical size={20} />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4 bg-muted/5">
                            <div className="space-y-4">
                                {messages.length === 0 && <div className="text-center text-muted-foreground mt-10">No messages yet.</div>}
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === 'current-user-id'; // Mock logic
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-muted border rounded-tl-none'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] mt-1 block opacity-70`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-background">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Paperclip size={20} />
                                </Button>
                                <Input
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                />
                                <Button size="icon">
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
                )}
            </div>
        </div>
    )
};

const MessengerContacts = ({ contacts, loading }: { contacts: Contact[], loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <Button size="sm" className="gap-2">
                <Plus size={16} /> Add Contact
            </Button>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-125">
                {loading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : contacts.length === 0 ? <div className="p-8 text-center text-muted-foreground">No contacts</div> : null}
                {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-muted/50 border-b last:border-0">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-medium">{contact.name}</h4>
                                <p className="text-sm text-muted-foreground">{contact.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">{contact.email}</span>
                            <Button variant="ghost" size="icon">
                                <MessageSquare size={18} />
                            </Button>
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </CardContent>
    </Card>
);

const MessengerFiles = () => (
    <Card>
        <CardHeader>
            <CardTitle>Shared Files</CardTitle>
            <CardDescription>Documents shared in conversations.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer bg-card">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical size={14} />
                            </Button>
                        </div>
                        <h4 className="font-medium truncate">Contract_Draft_v{i}.pdf</h4>
                        <p className="text-xs text-muted-foreground mt-1">2.4 MB • Shared yesterday</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function SecureMessenger() {
    const [conversations] = useState<Conversation[]>([]);
    const [contacts] = useState<Contact[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Secure Messenger</h1>
                    <p className="text-muted-foreground">Encrypted communication platform.</p>
                </div>
            </div>

            <Tabs defaultValue="chats" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="chats" className="gap-2"><MessageSquare size={16} /> Inbox</TabsTrigger>
                    <TabsTrigger value="contacts" className="gap-2"><Users size={16} /> Contacts</TabsTrigger>
                    <TabsTrigger value="files" className="gap-2"><FileText size={16} /> Files</TabsTrigger>
                    <TabsTrigger value="archived" className="gap-2"><Archive size={16} /> Archived</TabsTrigger>
                </TabsList>

                <TabsContent value="chats">
                    <MessengerInbox conversations={conversations} loading={loading} />
                </TabsContent>
                <TabsContent value="contacts">
                    <MessengerContacts contacts={contacts} loading={loading} />
                </TabsContent>
                <TabsContent value="files">
                    <MessengerFiles />
                </TabsContent>
                <TabsContent value="archived">
                    <Card>
                        <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                            <Archive className="h-10 w-10 mb-2 opacity-20" />
                            <p>No archived conversations</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
