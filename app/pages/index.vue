<template>
    <div
        style="
            padding: 24px;
            max-width: 600px;
            margin: 0 auto;
            font-family: system-ui, sans-serif;
        "
    >
        <h1 style="margin-bottom: 24px">🌏 暐皙的快樂旅遊趣</h1>

        <div
            v-for="(list, year) in groupedByYear"
            :key="year"
            style="margin-bottom: 32px"
        >
            <h2 style="margin-bottom: 12px; color: #2563eb">{{ year }}</h2>

            <div
                v-for="trip in list"
                :key="trip.id"
                @click="navigateTo(`/trip/${trip.id}`)"
                style="
                    padding: 16px;
                    margin-bottom: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                "
            >
                <h3 style="margin: 0 0 8px 0">{{ trip.title }}</h3>
                <p style="margin: 4px 0; color: #555">
                    📍 {{ trip.location || "未設定地點" }}
                </p>
                <p style="margin: 4px 0; color: #555">
                    📅 {{ trip.travel_date || "未設定日期" }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
const { $supabase: supabase } = useNuxtApp();

const trips = ref([]);

const groupedByYear = computed(() => {
    const groups = {};
    for (const trip of trips.value) {
        const year = trip.travel_date
            ? new Date(trip.travel_date).getFullYear()
            : "未分類";
        if (!groups[year]) groups[year] = [];
        groups[year].push(trip);
    }
    return groups;
});

onMounted(async () => {
    const { data } = await supabase
        .from("trips")
        .select("id, title, location, travel_date")
        .order("travel_date", { ascending: false });
    trips.value = data || [];
});
</script>
