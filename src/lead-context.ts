/**
 * Lead attribution context for contact forms.
 * Collects UTM parameters, referrer, and page context.
 *
 * Adapted from main site (go2market.qa) for business sub-sites.
 * Does not include leadType or serviceSlug (not applicable here).
 */

import type { Language } from '../types';

export interface LeadContext {
  sourcePage: string;
  language: Language;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

const UTM_STORAGE_KEY = 'g2m_utm';
const MAX_STRING_LENGTH = 200;

/** Sanitize string: trim, limit length, remove control characters */
function sanitize(value: string | null | undefined, maxLen = MAX_STRING_LENGTH): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .trim()
    .slice(0, maxLen)
    // Remove control characters including \r \n \t and null byte
    .replace(/[\x00-\x1F\x7F]/g, '');
  return cleaned || undefined;
}

/** Extract hostname from referrer, return undefined for same-origin or invalid */
function sanitizeReferrer(referrer: string | null | undefined): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    // Skip same-origin referrers
    if (typeof window !== 'undefined' && url.hostname === window.location.hostname) {
      return undefined;
    }
    // Skip go2market.qa and subdomains
    if (url.hostname === 'go2market.qa' || url.hostname.endsWith('.go2market.qa')) {
      return undefined;
    }
    // Return only hostname (no pathname, query, hash, credentials)
    return sanitize(url.hostname);
  } catch {
    return undefined;
  }
}

interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

/** Read UTM params from URL and persist to sessionStorage */
function collectUtmParams(): UtmParams {
  // SSR guard
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = sanitize(params.get('utm_source'));
  const utmMedium = sanitize(params.get('utm_medium'));
  const utmCampaign = sanitize(params.get('utm_campaign'));
  const utmTerm = sanitize(params.get('utm_term'));
  const utmContent = sanitize(params.get('utm_content'));

  const hasNewUtm = utmSource || utmMedium || utmCampaign || utmTerm || utmContent;

  // If URL has UTM params, save them (replaces any existing)
  if (hasNewUtm) {
    const utmData: UtmParams = {};
    if (utmSource) utmData.utmSource = utmSource;
    if (utmMedium) utmData.utmMedium = utmMedium;
    if (utmCampaign) utmData.utmCampaign = utmCampaign;
    if (utmTerm) utmData.utmTerm = utmTerm;
    if (utmContent) utmData.utmContent = utmContent;

    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    } catch {
      // sessionStorage not available
    }
    return utmData;
  }

  // Otherwise, try to load from sessionStorage
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UtmParams;
      return {
        utmSource: sanitize(parsed.utmSource),
        utmMedium: sanitize(parsed.utmMedium),
        utmCampaign: sanitize(parsed.utmCampaign),
        utmTerm: sanitize(parsed.utmTerm),
        utmContent: sanitize(parsed.utmContent),
      };
    }
  } catch {
    // Invalid JSON or sessionStorage not available
  }

  return {};
}

/**
 * Initialize UTM attribution early (call on page load).
 * Captures UTM params from URL and saves to sessionStorage.
 * Safe to call multiple times; idempotent.
 */
export function initAttribution(): void {
  collectUtmParams();
}

/** Collect full lead context for form submission */
export function collectLeadContext(language: Language): LeadContext {
  // SSR guard for browser APIs
  const pathname = typeof window !== 'undefined'
    ? window.location.pathname
    : '/';

  const sourcePage = sanitize(pathname) || '/';

  const referrer = typeof document !== 'undefined'
    ? sanitizeReferrer(document.referrer)
    : undefined;

  const utmParams = collectUtmParams();

  const context: LeadContext = {
    sourcePage,
    language,
  };

  if (referrer) context.referrer = referrer;
  if (utmParams.utmSource) context.utmSource = utmParams.utmSource;
  if (utmParams.utmMedium) context.utmMedium = utmParams.utmMedium;
  if (utmParams.utmCampaign) context.utmCampaign = utmParams.utmCampaign;
  if (utmParams.utmTerm) context.utmTerm = utmParams.utmTerm;
  if (utmParams.utmContent) context.utmContent = utmParams.utmContent;

  return context;
}
