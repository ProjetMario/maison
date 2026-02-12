import type { AstroInstance } from 'astro';
import { Github, Instagram } from 'lucide-astro';

export interface SocialLink {
	name: string;
	url: string;
	icon: AstroInstance;
}

export default {
	title: 'Maison – vue Lac & Montagnes',
	favicon: 'favicon.ico',
	owner: 'Propriétaire',
	profileImage: 'profile.webp',
	socialLinks: [],
};
