<template>
    <div>
        <NuxtRouteAnnouncer />
        <NuxtPage />
    </div>
</template>
<script setup>
useHead({
    link: [{ rel: "manifest", href: "/manifest.webmanifest" }],
});
</script>
