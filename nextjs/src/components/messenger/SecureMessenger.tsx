'use client';

import { Archive, FileText, MessageSquare, MoreVertical, Paperclip, Plus, Search, Send, Users } from 'lucide-react';
import { useState } from 'react';

// Mock Data
const MOCK_CHATS = [
  { id: '1', name: 'John Doe', lastMessage: 'Can we reschedule?', time: '10:30 AM', unread: 2 },
  { id: '2', name: 'Jane Smith', lastMessage: 'Documents attached.', time: 'Yesterday', unread: 0 },
];

const MOCK_CONTACTS = [
  { id: '1', name: 'John Doe', role: 'Client', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', role: 'Opposing Counsel', email: 'jane@lawfirm.com' },
];

// Mock Sub-components
const MessengerInbox = () => (
  <div className="flex h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
        {MOCK_CHATS.map((chat) => (
          <div key={chat.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-slate-900 dark:text-white">{chat.name}</h4>
              <span className="text-xs text-slate-400">{chat.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>
              {chat.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Chat Window */}
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
            JD
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">John Doe</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg rounded-tr-none max-w-[70%]">
            <p className="text-sm">Hi John, do you have the documents ready?</p>
            <span className="text-[10px] opacity-70 mt-1 block text-right">10:28 AM</span>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg rounded-tl-none max-w-[70%] shadow-sm border border-slate-200 dark:border-slate-600">
            <p className="text-sm">Almost there, just reviewing the last section.</p>
            <span className="text-[10px] text-slate-400 mt-1 block">10:29 AM</span>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg rounded-tl-none max-w-[70%] shadow-sm border border-slate-200 dark:border-slate-600">
            <p className="text-sm">Can we reschedule our call to 2 PM?</p>
            <span className="text-[10px] text-slate-400 mt-1 block">10:30 AM</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MessengerContacts = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Contacts</h3>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
        <Plus size={16} />
        Add Contact
      </button>
    </div>
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {MOCK_CONTACTS.map((contact) => (
        <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
              {contact.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{contact.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{contact.role}</p>
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
      <div className="min-h-[400px]">
        {activeTab === 'chats' && <MessengerInbox />}
        {activeTab === 'contacts' && <MessengerContacts />}
        {activeTab === 'files' && <MessengerFiles />}
        {activeTab === 'archived' && <MessengerArchived />}
      </div>
    </div>
  );
}
