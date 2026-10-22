import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Helper function to generate SeedGrid palette colors
function sgPalette(name: string) {
  return {
    50: `rgb(var(--sg-${name}-50) / <alpha-value>)`,
    100: `rgb(var(--sg-${name}-100) / <alpha-value>)`,
    200: `rgb(var(--sg-${name}-200) / <alpha-value>)`,
    300: `rgb(var(--sg-${name}-300) / <alpha-value>)`,
    400: `rgb(var(--sg-${name}-400) / <alpha-value>)`,
    500: `rgb(var(--sg-${name}-500) / <alpha-value>)`,
    600: `rgb(var(--sg-${name}-600) / <alpha-value>)`,
    700: `rgb(var(--sg-${name}-700) / <alpha-value>)`,
    800: `rgb(var(--sg-${name}-800) / <alpha-value>)`,
    900: `rgb(var(--sg-${name}-900) / <alpha-value>)`,
    DEFAULT: `rgb(var(--sg-${name}-500) / <alpha-value>)`,
    hover: `rgb(var(--sg-${name}-hover) / <alpha-value>)`,
    active: `rgb(var(--sg-${name}-active) / <alpha-value>)`,
  };
}

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Acrescentado no port: aqui existe um `components/` na RAIZ (fora de `app/`), com o
    // `locale-provider`, o `list-load-error` e os componentes vindos do report-client. Sem esta
    // linha as classes deles seriam podadas do CSS e a tela sairia sem estilo — falha silenciosa.
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // The SeedGrid components ship compiled JS that still contains the Tailwind
    // utility classes. They resolve through pnpm symlinks under node_modules;
    // keeping the literal `node_modules` segment makes Tailwind scan them
    // instead of applying its default node_modules ignore.
    "./node_modules/@seedgrid/fe-components/dist/**/*.js",
    "./node_modules/@seedgrid/fe-theme/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (for backward compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        // SeedGrid Theme colors
        sg: {
          // Neutrals
          bg: "rgb(var(--sg-bg) / <alpha-value>)",
          surface: "rgb(var(--sg-surface) / <alpha-value>)",
          "muted-surface": "rgb(var(--sg-muted-surface) / <alpha-value>)",
          border: "rgb(var(--sg-border) / <alpha-value>)",
          ring: "rgb(var(--sg-ring) / <alpha-value>)",
          text: "rgb(var(--sg-text) / <alpha-value>)",
          muted: "rgb(var(--sg-muted) / <alpha-value>)",
          disabled: "rgb(var(--sg-disabled) / <alpha-value>)",
          "on-disabled": "rgb(var(--sg-on-disabled) / <alpha-value>)",
          link: "rgb(var(--sg-link) / <alpha-value>)",
          "link-hover": "rgb(var(--sg-link-hover) / <alpha-value>)",
          badge: "rgb(var(--sg-badge) / <alpha-value>)",
          "on-badge": "rgb(var(--sg-on-badge) / <alpha-value>)",
          tooltip: "rgb(var(--sg-tooltip) / <alpha-value>)",
          "on-tooltip": "rgb(var(--sg-on-tooltip) / <alpha-value>)",
          // On colors
          "on-primary": "rgb(var(--sg-on-primary) / <alpha-value>)",
          "on-secondary": "rgb(var(--sg-on-secondary) / <alpha-value>)",
          "on-tertiary": "rgb(var(--sg-on-tertiary) / <alpha-value>)",
          "on-warning": "rgb(var(--sg-on-warning) / <alpha-value>)",
          "on-error": "rgb(var(--sg-on-error) / <alpha-value>)",
          "on-info": "rgb(var(--sg-on-info) / <alpha-value>)",
          "on-success": "rgb(var(--sg-on-success) / <alpha-value>)",
          // Palettes
          primary: sgPalette("primary"),
          secondary: sgPalette("secondary"),
          tertiary: sgPalette("tertiary"),
          warning: sgPalette("warning"),
          error: sgPalette("error"),
          info: sgPalette("info"),
          success: sgPalette("success"),
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sg: "var(--sg-radius)"
      }
    }
  },
  plugins: [animate]
} satisfies Config;

export default config;
