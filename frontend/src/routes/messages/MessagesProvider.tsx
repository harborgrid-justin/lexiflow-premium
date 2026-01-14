/**
 * Messages & Communication Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { MessagesLoaderData } from './loader';

type Message = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  caseId?: string;
};

interface MessagesState {
  messages: Message[];
  unreadCount: number;
  filter: 'all' | 'unread' | 'starred';
  searchTerm: string;
}

interface MessagesContextValue extends MessagesState {
  setFilter: (filter: 'all' | 'unread' | 'starred') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as MessagesLoaderData;

  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredMessages = useMemo(() => {
    let result = loaderData.messages;

    if (filter === 'unread') {
      result = result.filter(m => !m.read);
    } else if (filter === 'starred') {
      result = result.filter(m => m.starred);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.subject.toLowerCase().includes(term) ||
        m.from.toLowerCase().includes(term) ||
        m.body.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.messages, filter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<MessagesContextValue>(() => ({
    messages: filteredMessages,
    unreadCount: loaderData.unreadCount,
    filter,
    searchTerm,
    setFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredMessages, loaderData.unreadCount, filter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages(): MessagesContextValue {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
}
