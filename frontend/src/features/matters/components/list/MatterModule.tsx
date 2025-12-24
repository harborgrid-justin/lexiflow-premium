import React, { useState, useEffect } from 'react';
import { MatterManagement } from './MatterManagement';
import { MatterDetail } from './MatterDetail';
import NewMatter from '../create/NewMatter';

/**
 * Matter Module Router
 * Handles internal routing for Matter Management module
 * Supports: /matters (list), /matters/new (create), /matters/:id (detail)
 */
export const MatterModule: React.FC = () => {
  const [route, setRoute] = useState<'list' | 'new' | 'detail'>('list');
  const [matterId, setMatterId] = useState<string | null>(null);

  // Listen for hash changes or custom events for routing
  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash;
      
      if (hash.includes('/matters/new')) {
        setRoute('new');
        setMatterId(null);
      } else if (hash.includes('/matters/')) {
        const id = hash.split('/matters/')[1]?.split('?')[0];
        if (id && id !== 'new') {
          setRoute('detail');
          setMatterId(id);
        } else {
          setRoute('list');
          setMatterId(null);
        }
      } else if (hash.includes('matters')) {
        setRoute('list');
        setMatterId(null);
      }
    };

    // Initial route check
    handleRouteChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Custom navigation function
  const navigate = (path: string) => {
    window.location.hash = `#/${path}`;
  };

  if (route === 'new') {
    return <NewMatter onBack={() => navigate('matters')} />;
  }

  if (route === 'detail' && matterId) {
    return <MatterDetail />;
  }

  return <MatterManagement />;
};
