// tailwind.config.js - Ping-Me Design System (TailwindCSS v4)

// import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xxl: "1400px",
      },
    },
    extend: {
      colors: {
        // Core Backgrounds
        "pm-bg": "#0e0c16",
        "pm-bg-soft": "#1b1b2f",
        "pm-bg-hover": "#1c1c2b",
        "pm-bg-active": "#252538",
        "pm-bg-disabled": "#1a1a27",

        // Core Borders
        "pm-border": "#2f2f44",
        "pm-border-hover": "#3a3a50",
        "pm-border-active": "#5f5f80",
        "pm-border-disabled": "#393950",

        // Text
        "pm-text": "#ffffff",
        "pm-text-muted": "#b2b2d4",
        "pm-text-inverse": "#0e0c16",

        // Accent & Secondary
        "pm-accent": "#9a6aff",
        "pm-accent-hover": "#b08dff",
        "pm-accent-active": "#7f4dff",
        "pm-accent-disabled": "#4c4c66",

        "pm-accent-secondary": "#13b0f4",
        "pm-accent-secondary-hover": "#1dd6ff",
        "pm-accent-secondary-active": "#0f7cb8",

        // Light Mode Mappings
        "pm-light-bg": "#ffffff",
        "pm-light-bg-soft": "#f5f5f9",
        "pm-light-bg-hover": "#efefff",
        "pm-light-bg-active": "#e6e6ff",
        "pm-light-bg-disabled": "#f0f0fa",

        "pm-light-border": "#d2d2dd",
        "pm-light-border-hover": "#ccc",
        "pm-light-border-active": "#aaa",
        "pm-light-border-disabled": "#e5e5f0",

        "pm-light-text": "#0e0c16",
        "pm-light-text-muted": "#5a5a6f",

        "pm-light-accent": "#6236ff",
        "pm-light-accent-hover": "#7c5fff",
        "pm-light-accent-active": "#512fff",
        "pm-light-accent-disabled": "#bdbdf2",

        "pm-light-accent-secondary": "#009eff",
        "pm-light-accent-secondary-hover": "#1ab6ff",
        "pm-light-accent-secondary-active": "#0071b8",

        // Semantic States
        "pm-success": "#00d98b",
        "pm-error": "#ff4b55",
        "pm-warning": "#ffb020",
        "pm-info": "#2898ec",

        // Test Values for TailwindCSS
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        "brand-blue": {
          50: "#e6f0ff",
          100: "#bdd6ff",
          200: "#94baff",
          300: "#6a9eff",
          400: "#4182ff",
          500: "#1766ff",
          600: "#0e5aff",
          700: "#004ff2",
          800: "#0047e5",
          900: "#0033cc",
        },
      },
      boxShadow: {
        "pm-glow": "0 0 20px rgba(154, 106, 255, 0.4)",
        "pm-glow-light": "0 0 20px rgba(98, 54, 255, 0.4)",

        // Test Values for TailwindCSS
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        card: "0 4px 8px rgba(0, 0, 0, 0.08)",
      },
      // backgroundImage: {
      //   'pm-gradient-dark': 'linear-gradient(135deg, #13b0f4, #9a6aff)',
      //   'pm-gradient-light': 'linear-gradient(135deg, #009eff, #6236ff)',
      //   'pm-grain-dark': "url('/grain-dark.svg')",
      //   'pm-grain-light': "url('/grain-light.svg')",
      // },
      backgroundImage: {
        "pm-gradient-dark": "linear-gradient(135deg, #13b0f4, #9a6aff)",
        "pm-gradient-light": "linear-gradient(135deg, #009eff, #6236ff)",

        // Replace with inline data URI
        "pm-grain-dark":
          "url('data:image/svg+xml;base64," +
          "PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPiA8ZmlsdGVyIGlkPSdncmFpbic+PHR1cmJ1bGVuY2UgdHlwZT0ndHVyYnVsZW5jZScgbnVtT2N0YXZlcz0nMScgYmFzZUZyZXF1ZW5jeT0nMC4zJyBzdGl0Y2hlcz0nMzAnIC8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSJ1cmwoI2dyYWluKSIgLz48L3N2Zz4=" +
          "')",

        "pm-grain-light":
          "url('data:image/svg+xml;base64," +
          "PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPiA8ZmlsdGVyIGlkPSdncmFpbic+PHR1cmJ1bGVuY2UgdHlwZT0ndHVyYnVsZW5jZScgbnVtT2N0YXZlcz0nMScgYmFzZUZyZXF1ZW5jeT0nMC40JyBzdGl0Y2hlcz0nNScgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9InVybCgjZ3JhaW4pIiAvPjwvc3ZnPg==" +
          "')",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "Fira Code",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",

        // Test Values for TailwindCSS
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      transitionDuration: {
        0: "0ms",
        2000: "2000ms",
      },

      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [
    // plugin(({ addUtilities }) => {
    //   addUtilities({
    //     ".pm-grain": {
    //       backgroundImage: "url('/grain-dark.svg')",
    //       mixBlendMode: "overlay",
    //       opacity: "0.05",
    //     },
    //     ".pm-glass": {
    //       backdropFilter: "blur(12px)",
    //       backgroundColor: "rgba(255, 255, 255, 0.05)",
    //     },
    //   });
    // }),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
