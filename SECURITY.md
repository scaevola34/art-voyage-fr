# Security & Performance Optimizations

This document outlines the security and performance features implemented in Urbanomap.

## Security Headers

All security headers are configured in `vercel.json` and automatically applied on deployment:

### HTTP Security Headers
- **Strict-Transport-Security**: Forces HTTPS connections (HSTS with 2-year max-age)
- **X-Frame-Options**: Prevents clickjacking attacks (DENY)
- **X-Content-Type-Options**: Prevents MIME-sniffing (nosniff)
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Controls referrer information (strict-origin-when-cross-origin)
- **Permissions-Policy**: Restricts access to browser APIs

### Content Security Policy (CSP)
Comprehensive CSP implemented to prevent XSS attacks:
- Scripts: Self, Google Analytics, Mapbox
- Styles: Self, inline, Google Fonts, Mapbox
- Images: Self, data URIs, HTTPS sources
- Connect: Supabase, Mapbox, Google Analytics
- No inline scripts in production

## Rate Limiting & Anti-Spam

### Client-Side Rate Limiting
Location: `src/lib/security/rateLimit.ts`

**Features:**
- Token bucket algorithm with localStorage persistence
- Configurable limits per action
- Automatic blocking after limit exceeded
- Human-readable timeout messages

**Current Limits:**
- Suggest Location Form: 3 attempts per minute, 5-minute block
- Easily extensible to other forms

**Usage:**
```typescript
import { checkRateLimit, recordAttempt } from '@/lib/security/rateLimit';

const { isAllowed, blockedUntil } = checkRateLimit('form-key');
if (!isAllowed) {
  // Show error message
  return;
}
// Process form
recordAttempt('form-key');
```

## Performance Optimizations

### Build Optimizations
Location: `vite.config.ts`

**Features:**
- Terser minification with console.log removal in production
- Code splitting for better caching:
  - react-vendor: React core libraries
  - ui-vendor: Radix UI components
  - map-vendor: Mapbox and clustering libraries
- Tree-shaking for unused code elimination

### Caching Strategy
Location: `vercel.json`

**Static Assets:**
- JS/CSS bundles: 1 year cache (immutable)
- Images: 30 days cache
- Assets folder: 1 year cache
- Static folder: 1 year cache

### Image Optimization

**LazyImage Component:**
Location: `src/components/LazyImage.tsx`

- Intersection Observer for lazy loading
- Progressive loading with placeholders
- Automatic WebP support when browser supports
- 50px preload margin for smoother UX

**Usage:**
```typescript
import { LazyImage } from '@/components/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  className="w-full h-64 object-cover"
/>
```

### Loading Skeletons
Location: `src/components/LoadingSkeleton.tsx`

**Components:**
- MapSkeleton: Map loading state
- LocationCardSkeleton: Location cards
- EventCardSkeleton: Event cards
- StatCardSkeleton: Statistics cards
- LocationListSkeleton: Multiple location cards
- EventListSkeleton: Multiple event cards

**Benefits:**
- Improves perceived performance
- Reduces layout shift (CLS)
- Better user experience during data loading

## SEO Optimizations

### Structured Data (JSON-LD)
Location: `src/lib/seo/structuredData.ts`

**Implemented Schemas:**
- WebSite schema with SearchAction
- Organization schema
- LocalBusiness schema for locations
- Event schema for events
- BreadcrumbList for navigation

### Meta Tags
- Unique title and description per page (<160 chars)
- Open Graph tags for social sharing
- Twitter Cards for Twitter sharing
- Canonical URLs to prevent duplicate content
- Language and viewport tags

### Sitemap
Location: `public/sitemap.xml`

- All public pages included
- Priority and change frequency set
- Last modified dates
- Image sitemap support

### Robots.txt
Location: `public/robots.txt`

- Allows all major search engines
- Allows all public pages
- Sitemap reference

## HTTPS Enforcement

**Automatic on Vercel:**
- All HTTP traffic automatically redirected to HTTPS
- No configuration needed
- Enforced by HSTS header

## Security Best Practices

### Input Validation
All forms use Zod schema validation:
- Type checking
- Length limits
- Format validation
- Sanitization

### No Sensitive Data in Logs
- Console.logs removed in production builds
- No API keys in client code
- Environment variables properly secured

### XSS Prevention
- No dangerouslySetInnerHTML usage
- All user input escaped
- CSP headers prevent inline script injection

### CSRF Protection
- SameSite cookies (when applicable)
- Origin verification
- Rate limiting

## Monitoring & Testing

### Lighthouse Targets
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### Security Audits
Regular checks:
- Dependency vulnerabilities (npm audit)
- Security headers validation
- CSP policy testing
- Rate limiting effectiveness

## Deployment Checklist

Before deploying to production:

- [ ] Environment variables set
- [ ] Security headers verified in vercel.json
- [ ] CSP policy tested
- [ ] Rate limiting configured for all forms
- [ ] Images optimized and lazy-loaded
- [ ] Lighthouse score >90 across all metrics
- [ ] All forms validated with Zod schemas
- [ ] No console.logs in production code
- [ ] Sitemap updated
- [ ] Robots.txt configured

## Future Improvements

- [ ] Server-side rate limiting via Edge Functions
- [ ] Automated security scanning in CI/CD
- [ ] Image CDN integration
- [ ] Service Worker for offline support
- [ ] Advanced CSP reporting
- [ ] Real-time security monitoring
