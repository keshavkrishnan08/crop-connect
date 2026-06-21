import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Paper / canvas — warm soft white with a green whisper
                canvas: { DEFAULT: "#F6F7F2", soft: "#FBFCF9", sunk: "#EDEFE7" },
                // Ink — deep forest-charcoal (reads black, warm)
                ink: { DEFAULT: "#16241C", soft: "#3B4A42", muted: "#697469", faint: "#9BA49C" },
                // Brand — deep garden green
                brand: {
                    50: "#ECF3EE", 100: "#D6E7DC", 200: "#AED0BA", 300: "#7FB191",
                    400: "#4C8A65", 500: "#235C3A", 600: "#1B4A2F", 700: "#163C26",
                    800: "#11301E", 900: "#0F2E1D",
                },
                // Harvest — warm honey, reserved for value/margin
                harvest: { 300: "#EFC97E", 400: "#E0A436", 500: "#C6881F" },
                // small functional accents (status / category pops, used sparingly)
                violet: { 50: "#f2effb", 400: "#8b5cf6", 500: "#7c3aed", 600: "#6b27cf" },
                sky: { 50: "#ecf5fc", 400: "#38a8e6", 500: "#1f8fd1", 600: "#1577b3" },
                danger: "#B4452F",
                line: "rgba(22, 36, 28, 0.10)",
                "line-strong": "rgba(22, 36, 28, 0.17)",
            },
            fontFamily: {
                display: ["var(--font-display)", "Georgia", "serif"],
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "monospace"],
            },
            fontSize: {
                "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
            },
            borderRadius: { xl: "0.875rem", "2xl": "1.125rem", "3xl": "1.5rem", "4xl": "2rem" },
            boxShadow: {
                xs: "0 1px 2px rgba(22,36,28,0.04)",
                sm: "0 1px 2px rgba(22,36,28,0.05), 0 1px 1px rgba(22,36,28,0.03)",
                card: "0 1px 0 0 rgba(22,36,28,0.03), 0 6px 16px -8px rgba(22,36,28,0.10)",
                lift: "0 1px 0 0 rgba(22,36,28,0.03), 0 18px 40px -22px rgba(22,36,28,0.22)",
                glass: "inset 0 1px 0 0 rgba(255,255,255,0.7), 0 1px 1px rgba(22,36,28,0.03), 0 14px 36px -18px rgba(22,36,28,0.18)",
                brand: "0 10px 24px -12px rgba(35,92,58,0.55)",
                harvest: "0 10px 24px -12px rgba(224,164,54,0.5)",
            },
            backgroundImage: {
                "grid-faint": "linear-gradient(rgba(22,36,28,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(22,36,28,0.04) 1px, transparent 1px)",
                "dot-faint": "radial-gradient(rgba(22,36,28,0.10) 1px, transparent 1px)",
            },
            keyframes: {
                "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
                "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                "scale-in": { "0%": { opacity: "0", transform: "scale(0.97)" }, "100%": { opacity: "1", transform: "scale(1)" } },
                "slide-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
                shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
                "count-glow": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
                float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
            },
            animation: {
                "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
                "fade-in": "fade-in 0.5s ease-out forwards",
                "scale-in": "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
                "slide-up": "slide-up 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
                shimmer: "shimmer 2.4s infinite linear",
                float: "float 6s ease-in-out infinite",
            },
            transitionTimingFunction: { spring: "cubic-bezier(0.22,1,0.36,1)" },
        },
    },
    plugins: [],
};
export default config;
