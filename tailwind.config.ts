import type { Config } from 'tailwindcss';

/**
 * 🎨 WatchBiz Tailwind Configuration - Charte Graphique Luxe
 *
 * Palette : Or Champagne + Noir Profond + Gris Ardoise
 * Typographie : Playfair Display (headings) + Inter (body) + Cormorant Garamond (accent)
 */

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '3rem',
      },
      screens: {
        '2xl': '1400px', // Plus large pour produits luxe
      },
    },
    extend: {
      colors: {
        // Semantic colors (Tailwind defaults)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // === Couleurs Luxe Custom === //
        'luxury-black': 'hsl(var(--luxury-black))',
        onyx: 'hsl(var(--onyx))',
        'gold-champagne': 'hsl(var(--gold-champagne))',
        'gold-light': 'hsl(var(--gold-light))',
        'gold-dark': 'hsl(var(--gold-dark))',
        'slate-premium': 'hsl(var(--slate-premium))',
        'slate-mid': 'hsl(var(--slate-mid))',
        'slate-light': 'hsl(var(--slate-light))',
        ivory: 'hsl(var(--ivory))',
        'ruby-red': 'hsl(var(--ruby-red))',
        'emerald-green': 'hsl(var(--emerald-green))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        accent: ['var(--font-accent)', 'serif'],
        sans: ['var(--font-body)', 'sans-serif'],
        serif: ['var(--font-heading)', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
