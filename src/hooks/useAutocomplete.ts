import { useState, useMemo } from 'react';
import { Location } from '@/data/locations';

export const useAutocomplete = (locations: Location[], searchTerm: string) => {
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: Location[] = [];

    locations.forEach(location => {
      if (
        location.name.toLowerCase().includes(term) ||
        location.city.toLowerCase().includes(term) ||
        location.region.toLowerCase().includes(term)
      ) {
        results.push(location);
      }
    });

    return results.slice(0, 5); // Limit to 5 suggestions
  }, [locations, searchTerm]);

  return {
    suggestions,
    isOpen: isOpen && suggestions.length > 0,
    setIsOpen,
  };
};
