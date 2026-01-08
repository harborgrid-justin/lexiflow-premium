'use client';

import { Contact, Conversation, Message } from '@/api/communications/messaging-api';
import { communicationsApi } from '@/api/domains/communications.api';
import { Archive, FileText, MessageSquare, MoreVertical, Paperclip, Plus, Search, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
// Using hardcoded userId for demo matching "Sent" alignment if ProfileDomain complicates things,
// but better to use real logic if possible.
// I'll stick to a simple check or local state for userId.

// Helper to format time
const formatTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Mock Sub-components refactored to Real Components
const MessengerInbox = ({ conversations, loading }: { conversations: Conversation[], loading: boolean }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
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
        const msgs = await communicationsApi.messaging.getMessages(selectedId!);
        setMessages(msgs);
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
    <div className="flex h-150 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4 text-center text-slate-500">Loading chats...</div>}
          {!loading && conversations.length === 0 && <div className="p-4 text-center text-slate-500">No conversations</div>}
          {conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedId(chat.id)}
              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${selectedId === chat.id ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-slate-900 dark:text-white truncate pr-2">{getConvName(chat)}</h4>
                <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(chat.lastMessage?.createdAt || chat.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage?.content || 'No messages'}</p>
                {chat.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                  {getConvName(selectedConv).charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">{getConvName(selectedConv)}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {messagesLoading && <div className="text-center text-slate-500 mt-10">Loading messages...</div>}
              {!messagesLoading && messages.length === 0 && <div className="text-center text-slate-500 mt-10">No messages yet.</div>}
              {messages.map((msg) => {
                // Primitive "isMe" check - normally use auth
                const isMe = msg.senderId === 'current-user-id' || msg.status === 'sent';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-600'} px-4 py-2 rounded-lg max-w-[70%] shadow-sm`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">Select a conversation</div>
        )}
      </div>
    </div>
  )
};

const MessengerContacts = ({ contacts, loading }: { contacts: Contact[], loading: boolean }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Contacts</h3>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
        <Plus size={16} />
        Add Contact
      </button>
    </div>
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {loading && <div className="p-4 text-center text-slate-500">Loading contacts...</div>}
      {!loading && contacts.length === 0 && <div className="p-4 text-center text-slate-500">No contacts</div>}
      {contacts.map((contact) => (
        <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
              {contact.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{contact.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{contact.role || 'Contact'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">{contact.email}</span>
            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full">
              <MessageSquare size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessengerFiles = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Shared Files</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <FileText className="text-blue-500" size={24} />
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <MoreVertical size={16} />
            </button>
          </div>
          <h4 className="font-medium text-slate-900 dark:text-white truncate">Contract_Draft_v{i}.pdf</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2.4 MB • Shared yesterday</p>
        </div>
      ))}
    </div>
  </div>
);

const MessengerArchived = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500 dark:text-slate-400">
    <Archive className="mx-auto mb-2 opacity-50" size={48} />
    <p>No archived conversations</p>
  </div>
);

export default function SecureMessenger() {
  const [activeTab, setActiveTab] = useState('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [convs, conts] = await Promise.all([
          communicationsApi.messaging.getConversations(),
          communicationsApi.messaging.getContacts()
        ]);
        setConversations(convs);
        setContacts(conts);
      } catch (error) {
        console.error("Failed to load messaging data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const tabs = [
    { id: 'chats', label: 'Inbox', icon: MessageSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Messenger</h1>
          <p className="text-slate-500 dark:text-slate-400">Encrypted communication platform.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'}
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-100">
        {activeTab === 'chats' && <MessengerInbox conversations={conversations} loading={loading} />}
        {activeTab === 'contacts' && <MessengerContacts contacts={contacts} loading={loading} />}
        {activeTab === 'files' && <MessengerFiles />}
        {activeTab === 'archived' && <MessengerArchived />}
      </div>
    </div>
  );
}
