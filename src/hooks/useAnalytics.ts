import { useEffect, useCallback } from 'react';
import { analytics, type AnalyticsEvent, type EventProperties } from '@/lib/analytics/events';
import { useLocation } from 'react-router-dom';

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.pageView(location.pathname + location.search);
  }, [location]);

  const trackEvent = useCallback((event: AnalyticsEvent, properties?: EventProperties) => {
    analytics.track(event, properties);
  }, []);

  return {
    trackEvent,
    trackSearch: analytics.trackSearch.bind(analytics),
    trackFilter: analytics.trackFilter.bind(analytics),
    trackLocation: analytics.trackLocation.bind(analytics),
    trackMapInteraction: analytics.trackMapInteraction.bind(analytics),
    trackExternalLink: analytics.trackExternalLink.bind(analytics),
  };
}
