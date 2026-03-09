export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  region: string;
  image: string;
  excerpt: string;
  tags: string[];
  content: string;
  mentionedLocations?: { name: string; region: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "meilleurs-spots-street-art-paris-2025",
    title: "Les meilleurs spots de street art à Paris en 2025",
    date: "2025-02-15",
    region: "Île-de-France",
    image: "/images/blog/street-art-paris.jpg",
    excerpt: "Guide complet des galeries, fresques et événements street art à découvrir dans la capitale cette année.",
    tags: ["Paris", "Guide", "Galeries"],
    mentionedLocations: [
      { name: "Galerie Itinerrance", region: "Île-de-France" },
      { name: "Fluctuart", region: "Île-de-France" },
    ],
    content: `
## Paris, capitale du street art

Paris reste en 2025 l'une des capitales mondiales du street art. Du 13e arrondissement au canal de l'Ourcq, la ville regorge de fresques monumentales et de galeries dédiées à l'art urbain.

### Le 13e arrondissement : un musée à ciel ouvert

Le boulevard Vincent Auriol et ses alentours constituent le plus grand parcours de street art en France. Des artistes internationaux comme Shepard Fairey, D*Face et C215 y ont laissé leur empreinte.

### Belleville et Ménilmontant

Ces quartiers historiques de l'art urbain parisien continuent d'évoluer. La rue Dénoyez reste un incontournable, même si elle se transforme régulièrement.

### Les galeries incontournables

- **Galerie Itinerrance** : Pionnière de l'art urbain depuis 2004
- **Fluctuart** : Le premier centre d'art urbain flottant au monde
- **Galerie Mathgoth** : Référence pour les amateurs d'art contemporain urbain

### Événements à ne pas manquer

Le festival **Street Art Avenue** et les **Journées du Street Art** offrent chaque année des parcours guidés exceptionnels.
    `,
  },
  {
    slug: "street-art-lyon-guide-complet",
    title: "Lyon : le street art au-delà des murs peints",
    date: "2025-01-20",
    region: "Auvergne-Rhône-Alpes",
    image: "/images/blog/street-art-lyon.jpg",
    excerpt: "Découvrez comment Lyon dépasse sa tradition des murs peints pour embrasser le street art contemporain.",
    tags: ["Lyon", "Guide", "Fresques"],
    mentionedLocations: [
      { name: "Musée Urbain Tony Garnier", region: "Auvergne-Rhône-Alpes" },
    ],
    content: `
## Lyon, bien plus que les murs peints

Si Lyon est mondialement connue pour ses célèbres murs peints trompe-l'œil, la ville développe depuis plusieurs années une scène street art contemporain dynamique.

### La Croix-Rousse : épicentre créatif

Le quartier de la Croix-Rousse est devenu le cœur battant du street art lyonnais. Ses pentes et ses traboules offrent un terrain de jeu idéal pour les artistes.

### Le Musée Urbain Tony Garnier

Ce musée à ciel ouvert dans le 8e arrondissement présente des fresques monumentales qui mêlent patrimoine architectural et art contemporain.

### Les nouveaux quartiers à explorer

- **Confluence** : Le quartier moderne accueille de plus en plus d'œuvres urbaines
- **Guillotière** : Un melting-pot artistique en constante évolution
- **Vaise** : Des fresques XXL sur les anciens bâtiments industriels
    `,
  },
  {
    slug: "festivals-street-art-france-2025",
    title: "Les 10 festivals street art à ne pas manquer en 2025",
    date: "2025-03-01",
    region: "Île-de-France",
    image: "/images/blog/festivals-2025.jpg",
    excerpt: "Notre sélection des festivals incontournables pour vivre le street art en direct cette année.",
    tags: ["Festivals", "Événements", "Guide"],
    content: `
## Les festivals street art de 2025

La France accueille chaque année des dizaines de festivals dédiés au street art. Voici notre sélection des 10 événements à ne pas manquer.

### 1. Street Art Avenue - Paris
Le festival parisien qui transforme les bords du canal de l'Ourcq en galerie à ciel ouvert.

### 2. Peinture Fraîche - Lyon
Le plus grand festival de street art indoor d'Europe, dans une halle industrielle de 8000m².

### 3. MaCo Festival - Marseille
Art urbain et cultures méditerranéennes se rencontrent dans les quartiers nord de Marseille.

### 4. Musik à Pile - Bordeaux
Un festival qui mêle musique et street art dans le quartier de la Bastide.

### 5. Wall Drawings - Liège/Mulhouse
Un événement transfrontalier unique qui relie la France à la Belgique par l'art mural.
    `,
  },
  {
    slug: "photographier-street-art-conseils",
    title: "Comment photographier le street art : guide pratique",
    date: "2025-01-05",
    region: "Île-de-France",
    image: "/images/blog/photo-street-art.jpg",
    excerpt: "Techniques et astuces pour capturer les œuvres urbaines avec votre smartphone ou appareil photo.",
    tags: ["Photo", "Conseils", "Technique"],
    content: `
## L'art de photographier le street art

Capturer une fresque murale semble simple, mais obtenir un cliché qui rend justice à l'œuvre demande quelques techniques.

### La lumière, votre meilleure alliée

Privilégiez les heures dorées (lever et coucher du soleil) pour des couleurs riches et des ombres douces. La lumière directe de midi écrase les détails.

### Cadrage et perspective

- **Vue frontale** : Pour les fresques planes, placez-vous bien en face
- **Angle bas** : Donne de la puissance aux œuvres monumentales
- **Détails** : N'oubliez pas les gros plans sur les textures

### Intégrer l'environnement

Le contexte urbain fait partie de l'œuvre. Incluez le trottoir, les passants, l'architecture environnante pour raconter une histoire.

### Matériel recommandé

Un smartphone récent suffit largement. Pour aller plus loin : un objectif grand angle (16-35mm) et un trépied compact.
    `,
  },
  {
    slug: "street-art-marseille-quartiers",
    title: "Marseille : 5 quartiers pour découvrir le street art",
    date: "2024-12-10",
    region: "Provence-Alpes-Côte d'Azur",
    image: "/images/blog/street-art-marseille.jpg",
    excerpt: "Du Panier au Cours Julien, explorez les quartiers les plus colorés de la cité phocéenne.",
    tags: ["Marseille", "Guide", "Quartiers"],
    mentionedLocations: [
      { name: "MAMO", region: "Provence-Alpes-Côte d'Azur" },
    ],
    content: `
## Marseille, ville de street art

Marseille est une ville où le street art fait partie intégrante du paysage urbain. Voici les 5 quartiers à explorer.

### 1. Le Cours Julien
Le quartier historique du street art marseillais. Chaque mur, chaque volet raconte une histoire en couleurs.

### 2. Le Panier
Le plus vieux quartier de Marseille cache des trésors d'art urbain dans ses ruelles étroites.

### 3. La Belle de Mai
Ancien quartier industriel reconverti en pôle culturel, avec la Friche la Belle de Mai comme épicentre.

### 4. Noailles
Le quartier populaire le plus cosmopolite de Marseille offre un street art engagé et politique.

### 5. L'Estaque
En périphérie, ce quartier de pêcheurs accueille des fresques monumentales face à la mer.
    `,
  },
  {
    slug: "bordeaux-street-art-darwin",
    title: "Bordeaux : Darwin et la scène street art bordelaise",
    date: "2024-11-25",
    region: "Nouvelle-Aquitaine",
    image: "/images/blog/street-art-bordeaux.jpg",
    excerpt: "Comment l'écosystème Darwin est devenu le cœur battant du street art à Bordeaux.",
    tags: ["Bordeaux", "Darwin", "Culture"],
    content: `
## Darwin, temple du street art bordelais

L'écosystème Darwin, installé dans les anciens locaux militaires de la caserne Niel, est devenu en quelques années le plus grand spot de street art de Bordeaux.

### Un lieu unique en France

Avec ses 20 000m² de surfaces peintes, Darwin offre un terrain d'expression sans égal pour les artistes locaux et internationaux.

### La rive droite en mutation

Au-delà de Darwin, toute la rive droite de Bordeaux se transforme. Le quartier Bastide-Niel accueille de nouvelles fresques chaque mois.

### Les galeries bordelaises

- **Galerie des Music'Halles** : Art urbain et musique
- **Spacejunk** : Galerie pionnière de l'art urbain à Bordeaux
    `,
  },
];

export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  blogPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
};

export const getAllRegions = (): string[] => {
  const regions = new Set<string>();
  blogPosts.forEach((post) => regions.add(post.region));
  return Array.from(regions).sort();
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit = 3): BlogPost[] => {
  const current = getPostBySlug(currentSlug);
  if (!current) return blogPosts.slice(0, limit);

  return blogPosts
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      const aShared = a.tags.filter((t) => current.tags.includes(t)).length;
      const bShared = b.tags.filter((t) => current.tags.includes(t)).length;
      return bShared - aShared;
    })
    .slice(0, limit);
};
