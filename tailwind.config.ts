import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#2E7D32",
                "primary-dark": "#1B5E20",
                "earth": "#8D6E63",
                "earth-dark": "#5D4037",
                "background-light": "#F9FAF7",
                "background-dark": "#141e15",
                "surface-light": "#ffffff",
                "surface-dark": "#1e2b1f",
                "accent": "#FAD02C",
                "neutral-light": "#F1F2EF",
                "neutral-dark": "#2A382B",
                // Semantic dark mode tokens (unified)
                "card-dark": "#1a2c15",
                "modal-dark": "#1a2c15",
                "input-dark": "#1a2c15",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "body": ["Inter", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.75rem",
                "lg": "1rem",
                "xl": "1.25rem",
                "2xl": "1.5rem",
                "3xl": "2.5rem",
                "full": "9999px"
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(46, 125, 50, 0.05)',
                'card': '0 2px 12px rgba(0,0,0,0.02)',
                'glow': '0 0 20px rgba(46, 125, 50, 0.2)',
                'premium': '0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(0, 0, 0, 0.03)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.06)',
                'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.08)',
                'glow-sm': '0 0 12px rgba(46, 125, 50, 0.15)',
                'glow-md': '0 0 24px rgba(46, 125, 50, 0.2)',
                'stat': '0 4px 24px -4px rgba(46, 125, 50, 0.12)',
                'card-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.1)',
                'colored-green': '0 8px 24px -4px rgba(46, 125, 50, 0.2)',
                'colored-blue': '0 8px 24px -4px rgba(59, 130, 246, 0.2)',
                'colored-purple': '0 8px 24px -4px rgba(168, 85, 247, 0.2)',
                'colored-amber': '0 8px 24px -4px rgba(245, 158, 11, 0.2)',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 12px rgba(46, 125, 50, 0.15)' },
                    '50%': { boxShadow: '0 0 24px rgba(46, 125, 50, 0.3)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'fade-in-up-1': 'fade-in-up 0.5s ease-out 0.1s forwards',
                'fade-in-up-2': 'fade-in-up 0.5s ease-out 0.2s forwards',
                'fade-in-up-3': 'fade-in-up 0.5s ease-out 0.3s forwards',
                'fade-in-up-4': 'fade-in-up 0.5s ease-out 0.4s forwards',
                'shimmer': 'shimmer 2s infinite linear',
                'float': 'float 3s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
export default config;
