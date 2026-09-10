import React, { createContext, useContext, ReactNode } from 'react';
import { SiteType, SiteConfig, getSiteConfig } from './site';

interface SiteContextValue {
  siteType: SiteType;
  siteConfig: SiteConfig;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

interface SiteProviderProps {
  siteType: SiteType;
  children: ReactNode;
}

export const SiteProvider: React.FC<SiteProviderProps> = ({ siteType, children }) => {
  const siteConfig = getSiteConfig(siteType);

  return (
    <SiteContext.Provider value={{ siteType, siteConfig }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = (): SiteContextValue => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within SiteProvider');
  }
  return context;
};
