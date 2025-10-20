/**
 * Analytics event tracking utility
 * Privacy-friendly event tracking for user interactions
 */

export type AnalyticsEvent =
  | 'search_performed'
  | 'filter_applied'
  | 'filter_reset'
  | 'location_selected'
  | 'location_shared'
  | 'map_moved'
  | 'cluster_clicked'
  | 'drawer_opened'
  | 'drawer_closed'
  | 'external_link_clicked'
  | 'region_selected'
  | 'type_filter_selected';

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private enabled: boolean = true;
  private debug: boolean = import.meta.env.DEV;

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent, properties?: EventProperties): void {
    if (!this.enabled) return;

    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    if (this.debug) {
      console.log('[Analytics]', eventData);
    }

    // Send to your analytics service (Google Analytics, Plausible, etc.)
    // Example for Google Analytics 4:
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }

    // Example for Plausible:
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, { props: properties });
    }

    // Store in sessionStorage for session analytics
    this.storeInSession(eventData);
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    this.track('search_performed' as AnalyticsEvent, {
      page_path: path,
      page_title: title || document.title,
    });
  }

  /**
   * Track search with query details
   */
  trackSearch(query: string, resultsCount: number): void {
    this.track('search_performed', {
      search_query: query,
      results_count: resultsCount,
      query_length: query.length,
    });
  }

  /**
   * Track filter application
   */
  trackFilter(filterType: 'type' | 'region', value: string, resultsCount: number): void {
    const event = filterType === 'type' ? 'type_filter_selected' : 'region_selected';
    this.track(event, {
      filter_type: filterType,
      filter_value: value,
      results_count: resultsCount,
    });
  }

  /**
   * Track location interaction
   */
  trackLocation(action: 'selected' | 'shared', locationId: string, locationName: string, locationType: string): void {
    this.track(action === 'selected' ? 'location_selected' : 'location_shared', {
      location_id: locationId,
      location_name: locationName,
      location_type: locationType,
    });
  }

  /**
   * Track map interaction
   */
  trackMapInteraction(action: 'moved' | 'cluster_clicked', properties?: EventProperties): void {
    const event = action === 'moved' ? 'map_moved' : 'cluster_clicked';
    this.track(event, properties);
  }

  /**
   * Track external link clicks
   */
  trackExternalLink(linkType: 'website' | 'instagram' | 'email', url: string): void {
    this.track('external_link_clicked', {
      link_type: linkType,
      url: url,
    });
  }

  /**
   * Store event in sessionStorage for session analytics
   */
  private storeInSession(eventData: any): void {
    try {
      const key = 'analytics_session';
      const existing = sessionStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];
      events.push(eventData);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      sessionStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Get session analytics data
   */
  getSessionAnalytics(): any[] {
    try {
      const key = 'analytics_session';
      const existing = sessionStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear session analytics
   */
  clearSession(): void {
    try {
      sessionStorage.removeItem('analytics_session');
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const analytics = new Analytics();
