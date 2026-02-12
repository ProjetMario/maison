import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://rockem.github.io',
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
