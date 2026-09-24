<!-- app/pages/trip/[id].vue -->
<template>
    <div
        style="
            padding: 24px;
            max-width: 500px;
            margin: 0 auto;
            font-family: system-ui, sans-serif;
        "
    >
        <h1>🗺️ {{ tripTitle }}</h1>

        <!-- 連線狀態提示 -->
        <div
            style="
                margin-bottom: 16px;
                font-size: 14px;
                padding: 10px;
                background: #f4f4f5;
                border-radius: 6px;
            "
        >
            即時連線狀態：
            <span
                :style="{
                    color: isConnected ? '#10b981' : '#ef4444',
                    fontWeight: 'bold',
                }"
            >
                {{ isConnected ? "● 已即時連線 (多人同步中)" : "○ 連線中..." }}
            </span>
        </div>

        <!-- 新增景點表單 -->
        <div style="margin-bottom: 20px; display: flex; gap: 8px">
            <input
                v-model="newPlace"
                placeholder="輸入景點名稱..."
                @keyup.enter="addPlace"
                style="
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                "
            />
            <button
                @click="addPlace"
                style="
                    padding: 8px 16px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                "
            >
                新增
            </button>
        </div>

        <!-- 景點清單 -->
        <ul style="list-style: none; padding: 0">
            <li
                v-for="(place, index) in places"
                :key="index"
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                "
            >
                <span>📍 {{ place.name }}</span>
                <button
                    @click="removePlace(index)"
                    style="
                        color: #ef4444;
                        border: none;
                        background: none;
                        cursor: pointer;
                    "
                >
                    刪除
                </button>
            </li>
        </ul>

        <div
            style="
                margin-top: 24px;
                padding: 12px;
                background: #eff6ff;
                border-radius: 6px;
                font-size: 13px;
                color: #1e40af;
            "
        >
            💡 <b>本地端測試即時協作：</b><br />
            開啟兩個瀏覽器分頁（或用隱私視窗），同時打開這個頁面，在任一頁面新增/刪除景點，另一個頁面會<b>瞬間同步更新</b>！
        </div>
    </div>
</template>

<script setup>
const { $supabase: supabase } = useNuxtApp();

const route = useRoute();

const tripId = route.params.id;
const tripTitle = ref("載入中...");
const places = ref([]);
const newPlace = ref("");
const isConnected = ref(false);

let channel;

// 取得最初的行程資料
const fetchTrip = async () => {
    const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();
    if (data) {
        tripTitle.value = data.title;
        places.value = data.places || [];
    }
};

// 更新行程數據並寫入 Supabase
const updatePlaces = async (newPlaces) => {
    places.value = newPlaces; // 前端樂觀更新
    await supabase.from("trips").update({ places: newPlaces }).eq("id", tripId);
};

const addPlace = () => {
    if (!newPlace.value.trim()) return;
    updatePlaces([...places.value, { name: newPlace.value }]);
    newPlace.value = "";
};

const removePlace = (index) => {
    updatePlaces(places.value.filter((_, i) => i !== index));
};

onMounted(async () => {
    await fetchTrip();

    // 關鍵：訂閱 Supabase Realtime 即時推播頻道
    channel = supabase
        .channel(`public:trips:id=eq.${tripId}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "trips",
                filter: `id=eq.${tripId}`,
            },
            (payload) => {
                if (payload.new && payload.new.places) {
                    places.value = payload.new.places;
                }
            },
        )
        .subscribe((status) => {
            if (status === "SUBSCRIBED") isConnected.value = true;
        });
});

onUnmounted(() => {
    if (channel) supabase.removeChannel(channel);
});
</script>
