import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import property from './src/data/property.json';

// https://astro.build/config
export default defineConfig({
	site: property.origin,
	trailingSlash: 'always',
	base: '/',
	compressHTML: true,
	build: {
		inlineStylesheets: 'auto',
	},
	image: {
		service: {
			entrypoint: 'astro/assets/services/sharp',
			config: {
				limitInputPixels: false,
			},
		},
		domains: [],
		remotePatterns: [],
	},
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			cssMinify: true,
			minify: 'esbuild',
			rollupOptions: {
				output: {
					manualChunks: {
						glightbox: ['glightbox'],
					},
				},
			},
		},
	},
});
