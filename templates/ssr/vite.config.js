import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import ssr from 'vike/plugin';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact(), ssr({ prerender: true })],
});
