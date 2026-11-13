import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
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
        workbox: {
            globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        },
        manifest: {
            name: "Travel App",
            short_name: "Travel",
            description: "Travel planning app",
            theme_color: "#ffffff",
            background_color: "#ffffff",
            display: "standalone",
            start_url: "/",
            scope: "/",
            icons: [
                {
                    src: "appicon.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "splashicon.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
            ],
        },
    },
});
