export const frenchRegions = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Outre-Mer',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur',
] as const;

export type FrenchRegion = typeof frenchRegions[number];
