<template>
    <div>
        <NuxtRouteAnnouncer />
        <NuxtPage />
    </div>
</template>
<script setup>
useHead({
    link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    meta: [{ name: "theme-color", content: "#2a9d8f" }],
});
</script>
