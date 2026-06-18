import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ink + paper
                ink: {
                    DEFAULT: "#0E1512",
                    soft: "#3A443E",
                    muted: "#6B7670",
                    faint: "#9AA39D",
                },
                paper: {
                    DEFAULT: "#FCFDFC",
                    warm: "#F7F8F5",
                    sunk: "#F1F3EF",
                },
                // Refined agricultural green
                forest: {
                    50: "#EDF7F1",
                    100: "#D6EEE0",
                    200: "#AEDDC2",
                    300: "#7CC6A0",
                    400: "#48A97A",
                    500: "#1E8E5A",
                    600: "#147049",
                    700: "#11593B",
                    800: "#0F4731",
                    900: "#0C3A29",
                },
                // Harvest amber accent (sparingly)
                harvest: {
                    300: "#F2D08A",
                    400: "#E8B04B",
                    500: "#D69628",
                },
                clay: "#C77B52",
                sky: "#4C8DBF",
                berry: "#A84B6E",
                line: "rgba(14, 21, 18, 0.08)",
                "line-strong": "rgba(14, 21, 18, 0.14)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                display: ["var(--font-display)", "Georgia", "serif"],
                mono: ["var(--font-mono)", "ui-monospace", "monospace"],
            },
            fontSize: {
                "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
                "3xl": "1.75rem",
                "4xl": "2.25rem",
            },
            boxShadow: {
                hair: "0 1px 0 0 rgba(14,21,18,0.04)",
                glass: "0 1px 1px rgba(14,21,18,0.03), 0 8px 24px -8px rgba(14,21,18,0.10)",
                "glass-lg": "0 1px 1px rgba(14,21,18,0.04), 0 24px 60px -20px rgba(14,21,18,0.18)",
                float: "0 20px 50px -24px rgba(14,21,18,0.28)",
                "forest-glow": "0 12px 36px -10px rgba(30,142,90,0.42)",
                "inset-line": "inset 0 0 0 1px rgba(14,21,18,0.06)",
                node: "0 2px 4px rgba(14,21,18,0.04), 0 10px 24px -12px rgba(14,21,18,0.20)",
            },
            backgroundImage: {
                "grid-faint":
                    "linear-gradient(rgba(14,21,18,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(14,21,18,0.035) 1px, transparent 1px)",
                "dot-faint":
                    "radial-gradient(rgba(14,21,18,0.10) 1px, transparent 1px)",
            },
            keyframes: {
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(14px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.96)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                float: {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                "float-slow": {
                    "0%,100%": { transform: "translateY(0) rotate(0deg)" },
                    "50%": { transform: "translateY(-12px) rotate(1.5deg)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "pulse-ring": {
                    "0%": { boxShadow: "0 0 0 0 rgba(30,142,90,0.35)" },
                    "70%": { boxShadow: "0 0 0 12px rgba(30,142,90,0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(30,142,90,0)" },
                },
                "draw-line": {
                    "0%": { strokeDashoffset: "1000" },
                    "100%": { strokeDashoffset: "0" },
                },
                marching: {
                    "0%": { strokeDashoffset: "0" },
                    "100%": { strokeDashoffset: "-16" },
                },
            },
            animation: {
                "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
                "fade-in": "fade-in 0.5s ease-out forwards",
                "scale-in": "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
                float: "float 6s ease-in-out infinite",
                "float-slow": "float-slow 9s ease-in-out infinite",
                shimmer: "shimmer 2.4s infinite linear",
                "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
                "draw-line": "draw-line 1.4s ease-out forwards",
                marching: "marching 0.6s linear infinite",
            },
            transitionTimingFunction: {
                spring: "cubic-bezier(0.22,1,0.36,1)",
            },
        },
    },
    plugins: [],
};
export default config;
