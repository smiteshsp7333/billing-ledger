import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#000000',
          secondaryBg: '#1c1c1e',
          tertiaryBg: '#2c2c2e',
          card: 'rgba(28, 28, 30, 0.75)',
          border: 'rgba(255, 255, 255, 0.12)',
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          indigo: '#5856D6',
          teal: '#30B0C7',
          yellow: '#FFCC00',
          gray: '#8E8E93',
          lightGray: '#D1D1D6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ios-card': '0 4px 24px -1px rgba(0, 0, 0, 0.3), 0 0 1px 1px rgba(255, 255, 255, 0.08) inset',
        'ios-glow': '0 0 20px -3px rgba(0, 122, 255, 0.3)',
      },
      borderRadius: {
        'ios': '18px',
        'ios-lg': '24px',
        'ios-xl': '32px',
      },
    },
  },
  plugins: [],
};
export default config;
