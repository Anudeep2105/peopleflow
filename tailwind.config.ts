import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#142a3b', ocean: '#167d83', canvas: '#f3f6f8', line: '#e5ebef' }, boxShadow: { card: '0 8px 30px rgba(25,52,68,.05)' } } }, plugins: [] };
export default config;
