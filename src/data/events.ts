export type EventType = 'festival' | 'vernissage' | 'atelier' | 'autre';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate: string;
  locationId?: string;
  city: string;
  region: string;
  description: string;
  image?: string;
  website?: string;
  price?: string;
  featured?: boolean;
}

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'Street Art Fest Grenoble-Alpes',
    type: 'festival',
    startDate: '2025-06-15',
    endDate: '2025-06-20',
    locationId: '5',
    city: 'Grenoble',
    region: 'Auvergne-Rhône-Alpes',
    description: 'Festival international de street art en montagne avec performances live, fresques monumentales et rencontres avec les artistes.',
    image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
    website: 'https://www.spacejunk.tv/street-art-fest',
    price: 'Gratuit',
    featured: true,
  },
  {
    id: 'event-2',
    title: 'Festival Bien Urbain',
    type: 'festival',
    startDate: '2025-09-10',
    endDate: '2025-09-15',
    locationId: '9',
    city: 'Besançon',
    region: 'Bourgogne-Franche-Comté',
    description: 'Festival d\'art urbain réunissant artistes français et internationaux. Performances, ateliers et parcours urbain dans toute la ville.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    website: 'https://bienurbain.fr',
    price: 'Gratuit',
    featured: true,
  },
  {
    id: 'event-3',
    title: 'Vernissage Galerie Itinerrance',
    type: 'vernissage',
    startDate: '2025-05-20',
    endDate: '2025-05-20',
    locationId: '1',
    city: 'Paris',
    region: 'Île-de-France',
    description: 'Vernissage de la nouvelle exposition collective avec les artistes de la galerie. Cocktail et rencontre avec les artistes.',
    website: 'https://itinerrance.fr',
    price: 'Gratuit',
    featured: false,
  },
  {
    id: 'event-4',
    title: 'Urban Art Paris',
    type: 'festival',
    startDate: '2025-07-01',
    endDate: '2025-07-07',
    locationId: '15',
    city: 'Paris',
    region: 'Île-de-France',
    description: 'Festival d\'art urbain dans les rues de Paris. Performances live, expositions et parcours street art dans plusieurs arrondissements.',
    image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
    website: 'https://www.urbanartparis.fr',
    price: 'Gratuit',
    featured: true,
  },
  {
    id: 'event-5',
    title: 'Atelier Graffiti Débutants',
    type: 'atelier',
    startDate: '2025-05-15',
    endDate: '2025-05-15',
    locationId: '2',
    city: 'Paris',
    region: 'Île-de-France',
    description: 'Atelier d\'initiation au graffiti pour débutants. Techniques de base, manipulation des bombes et réalisation d\'une fresque collective.',
    price: '45€',
    featured: false,
  },
  {
    id: 'event-6',
    title: 'Le Château Éphémère',
    type: 'festival',
    startDate: '2025-08-20',
    endDate: '2025-08-25',
    locationId: '13',
    city: 'Carrières-sous-Poissy',
    region: 'Île-de-France',
    description: 'Festival annuel transformant un château en galerie street art éphémère à ciel ouvert. Expositions, performances et ateliers.',
    image: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800',
    price: '10€',
    featured: true,
  },
  {
    id: 'event-7',
    title: 'Exposition Wall Street Art',
    type: 'vernissage',
    startDate: '2025-06-05',
    endDate: '2025-06-05',
    locationId: '6',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    description: 'Vernissage de l\'exposition "Urban Voices" présentant les nouvelles œuvres d\'artistes lyonnais émergents.',
    website: 'https://www.wallstreetart.fr',
    price: 'Gratuit',
    featured: false,
  },
  {
    id: 'event-8',
    title: 'Street Art Session Marseille',
    type: 'atelier',
    startDate: '2025-05-25',
    endDate: '2025-05-25',
    locationId: '4',
    city: 'Marseille',
    region: 'Provence-Alpes-Côte d\'Azur',
    description: 'Session de street art collaborative au Terrain. Fresque collective ouverte à tous niveaux avec accompagnement d\'artistes confirmés.',
    price: 'Gratuit',
    featured: false,
  },
];
