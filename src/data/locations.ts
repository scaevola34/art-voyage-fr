export type LocationType = 'gallery' | 'association' | 'festival';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  address: string;
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  website?: string;
  image?: string;
}

export const locations: Location[] = [
  {
    id: '1',
    name: 'Galerie Itinerrance',
    type: 'gallery',
    description: 'Première galerie dédiée au street art en France, pionnière depuis 2004.',
    address: '24 Boulevard du Général Jean Simon',
    city: 'Paris',
    region: 'Île-de-France',
    coordinates: { lat: 48.8606, lng: 2.3376 },
    website: 'https://itinerrance.fr',
  },
  {
    id: '2',
    name: 'Le MUR',
    type: 'association',
    description: 'Association pour la promotion du street art légal avec des fresques éphémères.',
    address: '107 Rue Oberkampf',
    city: 'Paris',
    region: 'Île-de-France',
    coordinates: { lat: 48.8663, lng: 2.3801 },
    website: 'https://lemur.fr',
  },
  {
    id: '3',
    name: 'Mur des Canuts',
    type: 'association',
    description: 'Plus grande fresque murale d\'Europe, support d\'artistes internationaux.',
    address: '36 Boulevard des Canuts',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: { lat: 45.7784, lng: 4.8273 },
  },
  {
    id: '4',
    name: 'Teenage Kicks',
    type: 'gallery',
    description: 'Galerie bordelaise spécialisée dans l\'art urbain et contemporain.',
    address: '23 Rue des Argentiers',
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    coordinates: { lat: 44.8378, lng: -0.5792 },
    website: 'https://teenage-kicks.com',
  },
  {
    id: '5',
    name: 'Festival Bien Urbain',
    type: 'festival',
    description: 'Festival d\'art urbain à Besançon réunissant artistes français et internationaux.',
    address: 'Centre-ville',
    city: 'Besançon',
    region: 'Bourgogne-Franche-Comté',
    coordinates: { lat: 47.2380, lng: 6.0243 },
    website: 'https://bienurbain.fr',
  },
  {
    id: '6',
    name: 'Street Art Fest',
    type: 'festival',
    description: 'Festival international de street art à Grenoble.',
    address: 'Quartier Villeneuve',
    city: 'Grenoble',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: { lat: 45.1667, lng: 5.7167 },
  },
  {
    id: '7',
    name: 'Millénaire Gallery',
    type: 'gallery',
    description: 'Galerie montpelliéraine dédiée au street art et à l\'art urbain.',
    address: '15 Rue de la Loge',
    city: 'Montpellier',
    region: 'Occitanie',
    coordinates: { lat: 43.6108, lng: 3.8767 },
  },
  {
    id: '8',
    name: 'Maquis-art',
    type: 'association',
    description: 'Association toulousaine organisant événements et expositions street art.',
    address: 'Quartier Bellefontaine',
    city: 'Toulouse',
    region: 'Occitanie',
    coordinates: { lat: 43.6047, lng: 1.4442 },
  },
];
