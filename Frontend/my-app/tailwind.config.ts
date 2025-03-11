import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    colors: {
      current: "currentColor",
      transparent: "transparent",
      white: "#FFFFFF",
      black: "#090E34",
      dark: "#1D2144",
      primary: "#4A6CF7",
      yellow: "#FBB040",
      "body-color": "#959CB1",
      "body-color-dark": "#959CB1",
      "gray-dark": "#1E293B",
      "gray-light": "#F7F9FC",
    },
    extend: {
      boxShadow: {
        signUp: "0px 5px 10px rgba(4, 10, 34, 0.2)",
        one: "0px 2px 3px rgba(7, 7, 77, 0.05)",
        sticky: "inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
      },
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
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
