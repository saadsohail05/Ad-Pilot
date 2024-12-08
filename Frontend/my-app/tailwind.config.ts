import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // ...existing content config...
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ...existing theme extensions...
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
            },
            p: {
              color: 'var(--tw-prose-body)',
              lineHeight: '1.75',
            },
            li: {
              color: 'var(--tw-prose-body)',
            },
            'ul > li': {
              paddingLeft: '1.5em',
              position: 'relative',
              '&::before': {
                content: '""',
                width: '0.375em',
                height: '0.375em',
                position: 'absolute',
                left: '0.25em',
                top: '0.6875em',
                backgroundColor: 'currentColor',
                borderRadius: '50%',
              },
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'var(--tw-prose-invert-body)',
            '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
            '--tw-prose-links': 'var(--tw-prose-invert-links)',
            '--tw-prose-bullets': 'var(--tw-prose-invert-bullets)',
          },
        },
      },
      colors: {
        // ...existing colors...
        primary: '#4A6CF7',
        'body-color': '#959CB1',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...other plugins...
  ],
};

export default config;
