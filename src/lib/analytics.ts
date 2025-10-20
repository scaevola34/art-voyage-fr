/**
 * Google Analytics 4 event tracking utilities
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 * Safe wrapper with error handling to prevent blocking
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.debug('Analytics tracking failed:', error);
  }
};

/**
 * Track map marker clicks
 */
export const trackMarkerClick = (locationName: string, locationType: string, locationCity: string) => {
  try {
    trackEvent('marker_click', {
      location_name: locationName,
      location_type: locationType,
      location_city: locationCity,
    });
  } catch (error) {
    console.debug('Failed to track marker click:', error);
  }
};

/**
 * Track filter changes
 */
export const trackFilterChange = (filterType: 'category' | 'region', filterValue: string) => {
  try {
    trackEvent('filter_change', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  } catch (error) {
    console.debug('Failed to track filter change:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle: string) => {
  try {
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  } catch (error) {
    console.debug('Failed to track page view:', error);
  }
};
