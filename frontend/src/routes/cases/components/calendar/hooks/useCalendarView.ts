import { useState, useTransition } from 'react';

import { useSessionStorage } from '@/hooks/useSessionStorage';

export const useCalendarView = () => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('calendar_active_tab', 'master');
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  const handleNewEvent = () => {
    setShowNewEventModal(true);
  };

  const handleCloseModal = () => {
    setShowNewEventModal(false);
  };

  return {
    isPending,
    activeTab,
    setActiveTab,
    showNewEventModal,
    handleNewEvent,
    handleCloseModal
  };
};
