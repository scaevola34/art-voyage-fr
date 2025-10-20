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
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track map marker clicks
 */
export const trackMarkerClick = (locationName: string, locationType: string, locationCity: string) => {
  trackEvent('marker_click', {
    location_name: locationName,
    location_type: locationType,
    location_city: locationCity,
  });
};

/**
 * Track filter changes
 */
export const trackFilterChange = (filterType: 'category' | 'region', filterValue: string) => {
  trackEvent('filter_change', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};
