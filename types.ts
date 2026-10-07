// Facebook Pixel types
declare global {
  interface Window {
    fbq?: (command: string, eventName: string, params?: Record<string, any>) => void;
    gtag?: (...args: any[]) => void;
  }
}

export type Language = 'en' | 'ru';

export interface NavLink {
  id: string;
  label: { en: string; ru: string };
  href?: string; // For page links (e.g. '/case-studies') instead of scroll anchors
}

export interface Service {
  title: { en: string; ru: string };
  desc: { en: string; ru: string };
  steps: Step[];
}

export interface Principle {
  title: { en: string; ru: string };
  desc: { en: string; ru: string };
  icon?: string;
}

export interface Step {
  title: { en: string; ru: string };
  desc: { en: string; ru: string };
  icon?: string;
}

export interface Partner {
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  url: string;
  altText?: { en: string; ru: string };
}

export interface Client {
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  url: string;
  altText?: { en: string; ru: string };
}
