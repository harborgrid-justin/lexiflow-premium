
import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useData } from './useData.ts';

export interface Attachment {
  name: string;
  type: 'doc' | 'image';
  size: string;
  sender?: string;
  date?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
  isPrivileged?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  isExternal: boolean;
  unread: number;
  status: 'online' | 'offline' | 'away';
  draft?: string;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', name: 'Sarah Jenkins', role: 'Paralegal', isExternal: false, unread: 2, status: 'online',
    messages: [
      { id: 'm1', senderId: 'other', text: 'Good morning! Did you see the new discovery request?', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
      { id: 'm2', senderId: 'me', text: 'Yes, reviewing it now. We need to collect those logs.', timestamp: new Date(Date.now() - 3500000).toISOString(), status: 'read' },
      { id: 'm3', senderId: 'other', text: 'I have uploaded the new evidence files to the vault.', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'read', attachments: [{ name: 'Server_Logs.zip', type: 'doc', size: '45MB' }] }
    ]
  },
  {
    id: 'c2', name: 'John Doe', role: 'Client (TechCorp)', isExternal: true, unread: 0, status: 'offline',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Please review the attached settlement draft.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'read', isPrivileged: true },
      { id: 'm2', senderId: 'other', text: 'Can we reschedule our call to 3 PM?', timestamp: new Date(Date.now() - 82800000).toISOString(), status: 'read' }
    ]
  },
  {
    id: 'c3', name: 'Morgan & Morgan', role: 'Opposing Counsel', isExternal: true, unread: 0, status: 'online',
    messages: [
       { id: 'm1', senderId: 'other', text: 'We are filing for an extension.', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'read' }
    ]
  }
];

export const useSecureMessenger = () => {
  const users = useData(s => s.users);
  const clients = useData(s => s.clients);

  const [view, setView] = useState<'chats' | 'contacts' | 'files' | 'archived'>('chats');
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isPrivilegedMode, setIsPrivilegedMode] = useState(false);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const lastMsgA = a.messages[a.messages.length - 1];
      const lastMsgB = b.messages[b.messages.length - 1];
      if (!lastMsgA || !lastMsgB) return 0;
      return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
    });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return sortedConversations.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.role.toLowerCase().includes(term) ||
      c.messages.some(m => m.text.toLowerCase().includes(term))
    );
  }, [sortedConversations, deferredSearchTerm]);

  const contacts = useMemo(() => {
      const internalContacts = users.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          status: 'online', // Mock status
          email: u.email || 'user@lexiflow.com',
          department: 'Internal'
      }));

      const externalContacts = clients.map(c => ({
          id: c.id,
          name: c.name,
          role: 'Client',
          status: 'offline',
          email: `contact@${c.name.replace(/\s+/g, '').toLowerCase()}.com`,
          department: c.industry
      }));

      const all = [...internalContacts, ...externalContacts];
      const term = deferredSearchTerm.toLowerCase();

      return all.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.role.toLowerCase().includes(term) ||
          c.department.toLowerCase().includes(term)
      );
  }, [users, clients, deferredSearchTerm]);

  const allFiles = useMemo(() => {
      const files: Attachment[] = [];
      conversations.forEach(c => {
          c.messages.forEach(m => {
              if (m.attachments) {
                  m.attachments.forEach(a => {
                      files.push({
                          ...a,
                          sender: m.senderId === 'me' ? 'Me' : c.name,
                          date: m.timestamp
                      });
                  });
              }
          });
      });
      return files.filter(f => f.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()));
  }, [conversations, deferredSearchTerm]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const startChat = (contactId: string) => {
      // Check if conversation already exists
      const existing = conversations.find(c => c.id === contactId);
      if (existing) {
          setActiveConvId(existing.id);
          setView('chats');
          return;
      }

      // Create new conversation
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
          const newConv: Conversation = {
              id: contact.id,
              name: contact.name,
              role: contact.role,
              isExternal: contact.department !== 'Internal',
              unread: 0,
              status: contact.status as any,
              messages: []
          };
          setConversations([newConv, ...conversations]);
          setActiveConvId(newConv.id);
          setView('chats');
      }
  };

  const handleSelectConversation = (id: string) => {
    if (activeConvId === id) return;

    if (activeConvId) {
      setConversations(prev => prev.map(c => 
        c.id === activeConvId ? { ...c, draft: inputText } : c
      ));
    }

    const targetConv = conversations.find(c => c.id === id);
    setInputText(targetConv?.draft || '');
    setPendingAttachments([]);
    setIsPrivilegedMode(targetConv?.role.includes('Client') || false);
    setActiveConvId(id);

    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, unread: 0 } : c
    ));
  };

  const handleSendMessage = () => {
    if ((!inputText.trim() && pendingAttachments.length === 0) || !activeConvId) return;
    
    const newMessage: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      text: inputText,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isPrivileged: isPrivilegedMode,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          draft: '',
        };
      }
      return c;
    }));

    setInputText('');
    setPendingAttachments([]);

    setTimeout(() => {
        setConversations(prev => prev.map(c => 
            c.id === activeConvId 
            ? { ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m) } 
            : c
        ));
    }, 1500);

    setTimeout(() => {
        setConversations(prev => prev.map(c => 
            c.id === activeConvId 
            ? { ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' as const } : m) } 
            : c
        ));
    }, 3500);

    if (activeConversation && activeConversation.status !== 'offline') {
        setTimeout(() => {
            const replyMsg: Message = {
                id: `rep-${Date.now()}`,
                senderId: 'other',
                text: 'I received your message securely. Will review shortly.',
                timestamp: new Date().toISOString(),
                status: 'read'
            };
            setConversations(prev => prev.map(c => 
                c.id === activeConvId 
                ? { ...c, messages: [...c.messages, replyMsg], unread: activeConvId === c.id ? 0 : c.unread + 1 } 
                : c
            ));
        }, 5000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const newAtt: Attachment = {
              name: file.name,
              type: file.type.includes('image') ? 'image' : 'doc',
              size: '1.2 MB'
          };
          setPendingAttachments([...pendingAttachments, newAtt]);
      }
  };

  const formatTime = (isoString: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return {
    view,
    setView,
    conversations,
    activeConvId,
    setActiveConvId,
    searchTerm,
    setSearchTerm,
    inputText,
    setInputText,
    pendingAttachments,
    setPendingAttachments,
    isPrivilegedMode,
    setIsPrivilegedMode,
    activeConversation,
    filteredConversations,
    handleSelectConversation,
    handleSendMessage,
    handleFileSelect,
    formatTime,
    contacts,
    allFiles,
    startChat
  };
};
