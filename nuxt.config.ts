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
        workbox: {
            globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
            navigateFallback: "/",
        },
        manifest: {
            name: "Travel App",
            short_name: "Travel",
            description: "Travel planning app",
            theme_color: "#ffffff",
            background_color: "#ffffff",
            display: "standalone",
            orientation: "portrait-primary",
            start_url: "/",
            scope: "/",
            icons: [
                {
                    src: "/appicon.png", // ✅ 改為絕對路徑
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any",
                },
                {
                    src: "/splashicon.png", // ✅ 改為絕對路徑
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any",
                },
            ],
        },
    },
});
