import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    integrations: [react(), tailwind()],
    output: 'static',
    vite: {
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    // Disable response buffering so Range/streaming works
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq, req) => {
                            // Garante que Range header é repassado ao backend
                            if (req.headers['range']) {
                                proxyReq.setHeader('range', req.headers['range']);
                            }
                        });
                    },
                }
            }
        }
    }
});

