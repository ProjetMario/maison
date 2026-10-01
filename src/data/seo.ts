import property from './property.json';

export type Language = 'fr' | 'en';
export const price = (lang: Language = 'fr') => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: property.currency, maximumFractionDigits: 0 }).format(property.price);
export const pathKey = (path: string) => path === '/' ? '/' : `/${path.split('/').filter(Boolean).join('/')}/`;
export const absoluteUrl = (path: string) => new URL(path, property.origin).href;
export const indexable = process.env.SITE_INDEXABLE === 'true' || (process.env.SITE_INDEXABLE !== 'false' && process.env.CONTEXT === 'production');
export const contentBatch = Math.min(3, Math.max(0, Number(process.env.CONTENT_BATCH ?? '1') || 0));

export const pages: Record<string, { title: string; description: string; label: string }> = {
  '/': { title: `Maison avec vue lac du Bourget à Voglans | ${price()}`, description: `À vendre à Voglans : maison de ${property.area} m², ${property.bedrooms} chambres, piscine et garage double. Vue lac du Bourget, DPE ${property.dpe}, ${price()}. Vente entre particuliers.`, label: 'La maison' },
  '/maison-vue-lac-bourget/': { title: `Maison vue lac du Bourget à vendre | Voglans ${price()}`, description: `Maison à vendre avec vue sur le lac du Bourget à Voglans : ${property.area} m², ${property.bedrooms} chambres, piscine chauffée, garage double, DPE ${property.dpe}. Vente entre particuliers.`, label: 'Maison vue lac' },
  '/description/': { title: `Intérieurs de la maison : ${property.area} m², ${property.bedrooms} chambres | Voglans`, description: 'Découvrez les pièces de cette maison en duplex inversé à Voglans : séjour à l’étage, cuisine ouverte et espace nuit au rez-de-chaussée.', label: 'Intérieurs' },
  '/localisation/': { title: 'Maison à Voglans : localisation près du lac du Bourget', description: 'Situez la maison au 93 chemin de la Combe, à Voglans en Savoie, entre Chambéry et Aix-les-Bains. Carte et repères pour préparer votre visite.', label: 'Localisation' },
  '/les-exterieurs/': { title: 'Piscine, terrasses et jardin | Maison à vendre à Voglans', description: 'Les extérieurs de la maison : piscine au sel chauffée, trois terrasses et jardin. Photos réelles des espaces avec vue sur le lac du Bourget.', label: 'Extérieurs' },
  '/les-points-forts-faibles/': { title: 'Atouts et points à considérer | Maison vue lac à Voglans', description: 'Vue lac, piscine et confort, mais aussi escaliers, voisinage et environnement sonore : une présentation transparente avant votre visite.', label: 'Points clés' },
  '/video/': { title: 'Vidéo de la maison à vendre à Voglans | Lac du Bourget', description: 'Découvrez la vidéo et les photos de la maison à vendre à Voglans, puis contactez directement les propriétaires pour une visite.', label: 'Vidéo' },
  '/contact/': { title: 'Contacter les propriétaires | Visiter la maison à Voglans', description: `Organisez une visite de la maison avec vue lac du Bourget à Voglans. Prix : ${price()}, DPE ${property.dpe}. Contact direct avec les propriétaires.`, label: 'Contact' },
  '/guides/': { title: 'Vivre à Voglans et préparer son achat | Guides du propriétaire', description: 'Comprendre la maison, découvrir Voglans et préparer une visite : des guides pratiques pour votre projet près du lac du Bourget.', label: 'Guides' },
  '/en/': { title: `Lake-view house for sale in Voglans, Savoie | ${price('en')}`, description: `${property.area} m² contemporary house with ${property.bedrooms} bedrooms, heated pool and double garage. Views of Lac du Bourget. ${price('en')}, French DPE ${property.dpe}. Private sale.`, label: 'The house' },
  '/en/location/': { title: 'Voglans, Savoie: location of the lake-view house for sale', description: 'Find the house in Voglans between Chambéry and Aix-les-Bains. Address, local resources and practical advice for planning your visit.', label: 'Location' },
  '/en/viewing/': { title: 'Arrange a viewing in Voglans | Lake-view house buyer guide', description: 'Prepare your viewing of this house overlooking Lac du Bourget: layout, outdoor spaces, documents and questions to discuss with the owners.', label: 'Viewing guide' },
  '/en/contact/': { title: 'Contact the owners | House for sale near Lac du Bourget', description: `Contact the owners directly to arrange a viewing in Voglans, Savoie. Asking price ${price('en')}, ${property.area} m², ${property.bedrooms} bedrooms, French DPE ${property.dpe}.`, label: 'Contact' },
};

const translations = [
  ['/', '/en/'], ['/localisation/', '/en/location/'], ['/contact/', '/en/contact/'],
  ['/guides/preparer-visite-maison-voglans/', '/en/viewing/'],
];
export function alternatives(path: string) {
  const pair = translations.find((paths) => paths.includes(pathKey(path)));
  if (!pair || (pair[0].startsWith('/guides/') && contentBatch < 3)) return [];
  return [{ lang: 'fr', path: pair[0] }, { lang: 'en', path: pair[1] }, { lang: 'x-default', path: pair[0] }];
}
