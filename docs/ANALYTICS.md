# Analytics Implementation

This document explains the analytics tracking implementation in Urbanomap.

## Overview

The app tracks user interactions to help understand usage patterns and improve the user experience. All tracking is privacy-friendly and doesn't collect personal information.

## Tracked Events

### Search & Filters
- **search_performed**: User performs a search
  - Properties: `search_query`, `results_count`, `query_length`
- **filter_applied**: User applies a filter
  - Properties: `filter_type`, `filter_value`, `results_count`
- **filter_reset**: User resets all filters
- **type_filter_selected**: User selects a location type filter
  - Properties: `filter_type`, `filter_value`, `results_count`
- **region_selected**: User selects a region filter
  - Properties: `filter_type`, `filter_value`, `results_count`

### Location Interactions
- **location_selected**: User selects a location on the map or from the list
  - Properties: `location_id`, `location_name`, `location_type`
- **location_shared**: User shares a location
  - Properties: `location_id`, `location_name`, `location_type`
- **drawer_opened**: Location drawer is opened
  - Properties: `location_id`, `location_name`
- **drawer_closed**: Location drawer is closed

### Map Interactions
- **map_moved**: User pans or zooms the map (throttled)
  - Properties: `zoom_level`
- **cluster_clicked**: User clicks on a location cluster
  - Properties: `cluster_id`, `expansion_zoom`

### External Links
- **external_link_clicked**: User clicks on an external link
  - Properties: `link_type` (website/instagram/email), `url`

## Integration with Analytics Services

### Google Analytics 4

Add to your `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Events will automatically be sent to GA4 through the `gtag()` function.

### Plausible Analytics

Add to your `index.html`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

Events will automatically be sent to Plausible through the `plausible()` function.

### Custom Analytics Service

Modify `src/lib/analytics/events.ts` to add your custom tracking:

```typescript
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

  // Add your custom tracking here
  if (typeof window !== 'undefined' && (window as any).yourAnalytics) {
    (window as any).yourAnalytics.track(event, properties);
  }
}
```

## Usage in Components

### Using the Hook

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackSearch, trackLocation } = useAnalytics();
  
  const handleClick = () => {
    trackEvent('custom_event', { 
      custom_property: 'value' 
    });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Direct Usage

```typescript
import { analytics } from '@/lib/analytics/events';

// Track a custom event
analytics.track('custom_event', { 
  property: 'value' 
});

// Track search
analytics.trackSearch('query', 42);

// Track filter
analytics.trackFilter('type', 'gallery', 10);

// Track location
analytics.trackLocation('selected', 'id-123', 'Location Name', 'gallery');
```

## Session Analytics

All events are also stored in `sessionStorage` for debugging and analysis:

```typescript
import { analytics } from '@/lib/analytics/events';

// Get all events from current session
const sessionEvents = analytics.getSessionAnalytics();

// Clear session data
analytics.clearSession();
```

## Privacy Considerations

- No personal data is collected
- No user identifiers are tracked
- Location data is aggregated (location names, not user locations)
- Search queries are tracked but not linked to users
- Users can disable tracking through their browser settings
- All data is anonymized

## Development Mode

In development mode, all analytics events are logged to the console for debugging:

```
[Analytics] {
  event: 'location_selected',
  timestamp: '2025-10-20T15:48:00.000Z',
  location_id: 'location-123',
  location_name: 'Example Location',
  location_type: 'gallery'
}
```

## Disabling Analytics

To disable analytics tracking:

```typescript
import { analytics } from '@/lib/analytics/events';

analytics.setEnabled(false);
```

Or create a consent management system that checks user preferences before enabling tracking.
