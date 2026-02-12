export default {
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1440px',
			},
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Space Grotesk', 'Inter', 'system-ui'],
			},
			colors: {
				ink: '#050608',
				charcoal: '#0f1115',
				slate: '#1b1d23',
				stone: '#2a2e36',
				mist: '#7c8591',
				fog: '#c1c6d0',
				bisque: '#f5e1c8',
				amber: '#f4c38c',
				white: '#ffffff',
			},
			borderRadius: {
				full: '999px',
			},
			boxShadow: {
				card: '0 20px 60px rgba(5, 6, 8, 0.35)',
				soft: '0 10px 30px rgba(0, 0, 0, 0.25)',
			},
		},
	},
};
