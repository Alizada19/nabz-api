import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0', // Allows network connections
        port: 5173,
        strictPort: true,
        origin: 'http://192.168.135.50:5173', // Force Laravel to request Vite assets from your LAN IP
        cors: true,
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});