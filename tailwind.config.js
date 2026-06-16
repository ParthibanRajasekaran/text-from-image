// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--text))",
        surface: "hsl(var(--surface))",
        'text-muted': "hsl(var(--text-muted))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          2: "hsl(var(--accent-2))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        status: {
          live: {
            DEFAULT: "hsl(var(--status-live))",
            bg: "hsl(var(--status-live) / 0.1)",
            border: "hsl(var(--status-live) / 0.3)",
          },
          beta: {
            DEFAULT: "hsl(var(--status-beta))",
            bg: "hsl(var(--status-beta) / 0.1)",
            border: "hsl(var(--status-beta) / 0.3)",
          },
          planned: {
            DEFAULT: "hsl(var(--status-planned))",
            bg: "hsl(var(--status-planned) / 0.1)",
            border: "hsl(var(--status-planned) / 0.3)",
          },
          "evidence-pending": {
            DEFAULT: "hsl(var(--status-evidence-pending))",
            bg: "hsl(var(--status-evidence-pending) / 0.1)",
            border: "hsl(var(--status-evidence-pending) / 0.3)",
          },
        },
        code: {
          bg: "hsl(var(--code-bg))",
          border: "hsl(var(--code-border))",
          text: "hsl(var(--code-text))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        'glow': '0 0 24px var(--glow-color), 0 0 48px var(--glow-color)',
        'glow-sm': '0 0 12px var(--glow-color)',
        'glow-lg': '0 0 40px var(--glow-color), 0 0 80px var(--glow-color)',
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'elevation-4': '0 12px 32px rgba(0, 0, 0, 0.14)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "aurora": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
        "aurora": "aurora 20s ease infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.23, 1, 0.320, 1)",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [],
}
