import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    vite: {
        plugins: [tailwindcss()],
    },

    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
        },
    },

    modules: ["@vite-pwa/nuxt"],

    pwa: {
        registerType: "autoUpdate",
        manifest: {
            name: "Travel App",
            short_name: "Travel",
            description: "Travel planning app",
            lang: "zh-TW",
            theme_color: "#2a9d8f",
            background_color: "#fdf6ec",
            display: "standalone",
            start_url: "/",
            scope: "/",
            icons: [
                {
                    src: "/pwa-192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/pwa-512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/pwa-maskable-512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                },
            ],
        },
        workbox: {
            globPatterns: ["**/*.{js,css,html,png,svg,ico,gif}"],
            navigateFallback: null,
            cleanupOutdatedCaches: true,
            runtimeCaching: [
                {
                    urlPattern: /^https:\/\//,
                    handler: "NetworkFirst",
                    options: {
                        cacheName: "https-calls",
                        networkTimeoutSeconds: 5,
                        expiration: {
                            maxEntries: 150,
                            maxAgeSeconds: 5 * 60, // 5 分鐘
                        },
                    },
                },
            ],
        },
    },
});
