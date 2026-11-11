import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScreenName, TabName, RouteState, NavigationContextType } from './types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<RouteState[]>([{ name: 'LOGIN' }]);
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const currentRoute = history[history.length - 1];

  const navigate = (screen: ScreenName, params: Record<string, any> = {}) => {
    // Sync active tab when navigating to a tab screen
    if (screen === 'HOME') setActiveTab('home');
    else if (screen === 'EXPLORE') setActiveTab('explore');
    else if (screen === 'TRIP_DETAILS' || screen === 'TRIP_PLANNER') setActiveTab('trips');
    else if (screen === 'PROFILE') setActiveTab('profile');

    setHistory((prev) => [...prev, { name: screen, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory((prev) => {
        const next = prev.slice(0, prev.length - 1);
        const last = next[next.length - 1];
        if (last.name === 'HOME') setActiveTab('home');
        else if (last.name === 'EXPLORE') setActiveTab('explore');
        else if (last.name === 'TRIP_DETAILS' || last.name === 'TRIP_PLANNER') setActiveTab('trips');
        else if (last.name === 'PROFILE') setActiveTab('profile');
        return next;
      });
    }
  };

  const switchTab = (tab: TabName) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigate('HOME');
        break;
      case 'explore':
        navigate('EXPLORE');
        break;
      case 'trips':
        navigate('TRIP_DETAILS');
        break;
      case 'profile':
        navigate('PROFILE');
        break;
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen: currentRoute.name,
        params: currentRoute.params || {},
        activeTab,
        canGoBack: history.length > 1,
        navigate,
        goBack,
        switchTab,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};
