/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: '#071A36',
        brandPrimary: '#1267E8',
        brandBg: '#F5F7FA',
        brandCard: '#FFFFFF',
        textPrimary: '#14213D',
        textSecondary: '#667085',
        reconSuccess: '#16A34A',
        reconWarning: '#F59E0B',
        reconError: '#DC2626',
        reconAi: '#6366F1',
      }
    },
  },
  plugins: [],
}
