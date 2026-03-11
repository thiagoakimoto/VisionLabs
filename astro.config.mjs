import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    // Integrate React for UI components
    integrations: [react(), tailwind()],
    // Generate a static site that can be served by any static hosted or Express
    output: 'static',
    vite: {
        server: {
            proxy: {
                '/api': 'http://localhost:3000',
            }
        }
    }
});
