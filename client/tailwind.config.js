/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: '#0B5CD6',
        'blue-deep': '#083F96',
        green: '#12A17B',
        purple: '#7C5CD6',
        amber: '#E9A23B',
        red: '#E4483C',
        ink: '#10233D',
        muted: '#6B7C93',
      },
    },
  },
  plugins: [],
}
