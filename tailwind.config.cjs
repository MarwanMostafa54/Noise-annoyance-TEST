/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        // custom palette for light blue/green gradient aesthetic
        'brand-start': '#A7F3D0',
        'brand-mid': '#6EE7B7',
        'brand-end': '#93C5FD'
      }
    }
  },
  plugins: []
}
