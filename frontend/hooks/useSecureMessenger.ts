/**
 * @module hooks/useSecureMessenger
 * @category Hooks - Messaging
 * @description Secure messenger hook managing conversations, messages, contacts, and file attachments
 * with privilege mode support. Handles conversation sorting, filtering, draft persistence, optimistic
 * UI updates, and deferred file indexing via Scheduler for performance.
 * 
 * NO THEME USAGE: Business logic hook for messaging state management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';

// Utils & Constants
import { Scheduler } from '../utils/scheduler';

// Types
import { Conversation, Message, Attachment } from '../types';
import { Contact } from '../services/api/messaging-api';

// Re-export types for consumers
export type { Conversation, Message, Attachment, Contact };

// ============================================================================
// HOOK
// ============================================================================
export const useSecureMessenger = () => {
  const [view, setView] = useState<'chats' | 'contacts' | 'files' | 'archived'>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  const [allFiles, setAllFiles] = useState<Attachment[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isPrivilegedMode, setIsPrivilegedMode] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
      const loadData = async () => {
          const messengerService = await DataService.messenger;
          const [convs, conts] = await Promise.all([
              messengerService.getConversations(),
              messengerService.getContacts()
          ]);
          setConversations(convs);
          setContactsList(conts);
      };
      loadData();
  }, []);

  // Deferred calculation for allFiles to improve performance
  useEffect(() => {
    Scheduler.defer(() => {
        const files: Attachment[] = [];
        const safeConversations = Array.isArray(conversations) ? conversations : [];
        safeConversations.forEach(c => {
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
        const filtered = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setAllFiles(filtered);
    });
  }, [conversations, searchTerm]);

  const sortedConversations = useMemo(() => {
    // Ensure conversations is an array before spreading
    const safeConversations = Array.isArray(conversations) ? conversations : [];
    return [...safeConversations].sort((a, b) => {
      const lastMsgA = a.messages[a.messages.length - 1];
      const lastMsgB = b.messages[b.messages.length - 1];
      // Handle potential empty messages array although robust data usually has one
      const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedConversations.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.role.toLowerCase().includes(term) ||
      c.messages.some(m => m.text.toLowerCase().includes(term))
    );
  }, [sortedConversations, searchTerm]);

  const contacts = useMemo(() => {
      // Ensure contactsList is an array before filtering
      const safeContactsList = Array.isArray(contactsList) ? contactsList : [];
      return safeContactsList.filter(c =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.role || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [contactsList, searchTerm]);

  const activeConversation = Array.isArray(conversations) ? conversations.find(c => c.id === activeConvId) : undefined;

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

  const handleSendMessage = async () => {
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

    // Optimistic UI Update
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

    // Persist
    await DataService.messenger.sendMessage(activeConvId, newMessage);

    setInputText('');
    setPendingAttachments([]);

    // Update delivery status after message is processed
    // In production with WebSocket: server would push status updates
    setTimeout(() => {
        setConversations(prev => prev.map(c =>
            c.id === activeConvId
            ? { ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m) }
            : c
        ));
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
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
    allFiles
  };
};

