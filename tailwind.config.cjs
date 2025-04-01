/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#eff7ff',
          '100': '#deedff',
          '200': '#b6ddff',
          '300': '#76c2ff',
          '400': '#2da4ff',
          '500': '#0289f5',
          '600': '#006ad2',
          '700': '#0055aa',
          '800': '#004e98',
          '900': '#073c73',
          '950': '#04264d',
        },
        secondary: {
          '50': '#f7f7f7',
          '100': '#f0f0f0',
          '200': '#e3e3e3',
          '300': '#d1d1d1',
          '400': '#c0c0c0',
          '500': '#aaaaaa',
          '600': '#969696',
          '700': '#818181',
          '800': '#6a6a6a',
          '900': '#585858',
          '950': '#333333',
        },
        accent: {
          '50': '#fff8ec',
          '100': '#fff0d3',
          '200': '#ffdda5',
          '300': '#ffc36d',
          '400': '#ff9e32',
          '500': '#ff800a',
          '600': '#ff6700',
          '700': '#cc4902',
          '800': '#a1390b',
          '900': '#82310c',
          '950': '#461604',
        }
        
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.primary.800'),
            a: {
              color: theme('colors.secondary.600'),
              '&:hover': {
                color: theme('colors.accent.700'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [],
};
