import { memo } from 'react';
import { LocationType } from '@/data/locations';
import affiliationsData from '@/data/affiliations.json';
import { analytics } from '@/lib/analytics/events';

interface AffiliationBlockProps {
  locationType: LocationType;
  locationCity: string;
  locationRegion: string;
  locationId: string;
}

interface AffiliationLink {
  label: string;
  url: string;
  partner: string;
  emoji: string;
  types: string[];
}

// Eligible types for affiliation display
const ELIGIBLE_TYPES: LocationType[] = ['gallery', 'museum'];

/**
 * Normalizes a city string: strips postal code, lowercases, removes accents, converts spaces to hyphens.
 */
function normalizeCitySlug(city: string): string {
  return city
    .replace(/^\d{5}\s*/, '')          // strip leading postal code
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents
    .trim()
    .replace(/\s+/g, '-');             // spaces → hyphens
}

/**
 * Resolves city/region → config key using 4-level geo logic:
 * 1. Exact city match, 2. Urban area mapping, 3. Region, 4. Default
 */
function resolveConfigKey(city: string, region: string): string {
  const citySlug = normalizeCitySlug(city);
  const data = affiliationsData as Record<string, any>;

  // 1. Direct city match
  if (data[citySlug]?.links) return citySlug;

  // 2. Urban area mapping
  const aires = data.aires_urbaines as Record<string, string> | undefined;
  if (aires && aires[citySlug]) {
    const metro = aires[citySlug];
    if (data[metro]?.links) return metro;
  }

  // 3. Region match
  const regionKey = region.trim();
  const regions = data.regions as Record<string, string> | undefined;
  if (regions && regions[regionKey]) {
    const regionTarget = regions[regionKey];
    if (data[regionTarget]?.links) return regionTarget;
  }

  // 4. Default
  return 'default';
}

const AffiliationBlock = memo(function AffiliationBlock({
  locationType,
  locationCity,
  locationRegion,
  locationId,
}: AffiliationBlockProps) {
  // Rule 1: Only show for eligible types
  if (!ELIGIBLE_TYPES.includes(locationType)) return null;

  const configKey = resolveConfigKey(locationCity, locationRegion);
  const data = affiliationsData as Record<string, any>;
  const config = data[configKey];
  if (!config?.links) return null;

  // Rule 3: Filter links by location type
  const filteredLinks = (config.links as AffiliationLink[]).filter((link) =>
    link.types.includes(locationType)
  );

  if (filteredLinks.length === 0) return null;

  const handleClick = (link: AffiliationLink) => {
    analytics.track('external_link_clicked', {
      partner: link.partner,
      lieu_id: locationId,
      lieu_ville: locationCity,
      lieu_type: locationType,
    });

    // GA4 custom event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        partner: link.partner,
        lieu_id: locationId,
        lieu_ville: locationCity,
        lieu_type: locationType,
      });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        🤝 Nos partenaires recommandés
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            onClick={() => handleClick(link)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F0EDFF]/10 hover:bg-[#F0EDFF]/20 border border-[#F0EDFF]/10 transition-colors group"
          >
            <span className="text-lg leading-none">{link.emoji}</span>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                {link.label}
              </span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider">
                {link.partner}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

export default AffiliationBlock;
