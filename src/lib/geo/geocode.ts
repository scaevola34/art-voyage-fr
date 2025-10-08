/**
 * Mock geocoding utility
 * In production, this would call a real geocoding API (Google Maps, Mapbox, etc.)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  region: string;
}

/**
 * Mock geocoding: returns approximate coordinates for French cities
 * In production, replace with real API call
 */
export const geocodeAddress = async (
  address: string,
  city: string,
  region: string
): Promise<GeocodingResult | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock city coordinates (major French cities)
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    paris: { lat: 48.8566, lng: 2.3522 },
    marseille: { lat: 43.2965, lng: 5.3698 },
    lyon: { lat: 45.7640, lng: 4.8357 },
    toulouse: { lat: 43.6047, lng: 1.4442 },
    nice: { lat: 43.7102, lng: 7.2620 },
    nantes: { lat: 47.2184, lng: -1.5536 },
    montpellier: { lat: 43.6108, lng: 3.8767 },
    strasbourg: { lat: 48.5734, lng: 7.7521 },
    bordeaux: { lat: 44.8378, lng: -0.5792 },
    lille: { lat: 50.6292, lng: 3.0573 },
    rennes: { lat: 48.1173, lng: -1.6778 },
    reims: { lat: 49.2583, lng: 4.0317 },
    'saint-étienne': { lat: 45.4397, lng: 4.3872 },
    toulon: { lat: 43.1242, lng: 5.9280 },
    grenoble: { lat: 45.1885, lng: 5.7245 },
    dijon: { lat: 47.3220, lng: 5.0415 },
    angers: { lat: 47.4784, lng: -0.5632 },
    besançon: { lat: 47.2380, lng: 6.0243 },
  };

  const normalizedCity = city.toLowerCase().trim();
  const coords = cityCoordinates[normalizedCity];

  if (!coords) {
    // Return null if city not found
    return null;
  }

  // Add small random offset to avoid exact duplicates
  const randomOffset = () => (Math.random() - 0.5) * 0.01;

  return {
    lat: coords.lat + randomOffset(),
    lng: coords.lng + randomOffset(),
    address: address || '',
    city,
    region,
  };
};

/**
 * Reverse geocoding: convert coordinates to address
 * Mock implementation
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ address: string; city: string } | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock implementation - in production, call real API
  return {
    address: `${Math.floor(Math.random() * 100)} Rue de la République`,
    city: 'Paris',
  };
};
