<!-- app/pages/trip/[id].vue -->
<template>
    <div class="p-6 max-w-125 mx-auto font-sans">
        <h1>🗺️ {{ tripTitle }}</h1>

        <!-- 密碼驗證畫面 -->
        <div v-if="!isUnlocked" class="mt-6">
            <p class="text-sm text-[#555] mb-3">
                請輸入這個行程的密碼才能查看內容
            </p>
            <div class="flex gap-2">
                <input
                    v-model="passwordInput"
                    type="password"
                    placeholder="輸入密碼"
                    @keyup.enter="submitPassword"
                    class="flex-1 px-3 py-2 border border-[#ccc] rounded"
                />
                <button
                    @click="submitPassword"
                    class="px-4 py-2 bg-[#2563eb] text-white border-none rounded cursor-pointer"
                >
                    解鎖
                </button>
            </div>
            <p v-if="passwordError" class="text-[#ef4444] text-sm mt-2">
                {{ passwordError }}
            </p>
        </div>

        <!-- 行程內容（密碼驗證通過後才顯示） -->
        <template v-else>
            <!-- 連線狀態提示 -->
            <div class="mb-4 text-sm p-2.5 bg-[#f4f4f5] rounded-md">
                即時連線狀態：
                <span
                    :class="
                        isConnected
                            ? 'text-[#10b981] font-bold'
                            : 'text-[#ef4444] font-bold'
                    "
                >
                    {{
                        isConnected
                            ? "● 已即時連線 (多人同步中)"
                            : "○ 連線中..."
                    }}
                </span>
            </div>

            <!-- 新增景點表單 -->
            <div class="mb-5 flex gap-2">
                <input
                    v-model="newPlace"
                    placeholder="輸入景點名稱..."
                    @keyup.enter="addPlace"
                    class="flex-1 px-3 py-2 border border-[#ccc] rounded"
                />
                <button
                    @click="addPlace"
                    class="px-4 py-2 bg-[#2563eb] text-white border-none rounded cursor-pointer"
                >
                    新增
                </button>
            </div>

            <!-- 景點清單 -->
            <ul class="list-none p-0">
                <li
                    v-for="(place, index) in places"
                    :key="index"
                    class="flex justify-between items-center p-3 border-b border-[#eee]"
                >
                    <span>📍 {{ place.name }}</span>
                    <button
                        @click="removePlace(index)"
                        class="text-[#ef4444] border-none bg-transparent cursor-pointer"
                    >
                        刪除
                    </button>
                </li>
            </ul>

            <div
                class="mt-6 p-3 bg-[#eff6ff] rounded-md text-[13px] text-[#1e40af]"
            >
                💡 <b>本地端測試即時協作：</b><br />
                開啟兩個瀏覽器分頁（或用隱私視窗），同時打開這個頁面，在任一頁面新增/刪除景點，另一個頁面會<b>瞬間同步更新</b>！
            </div>
        </template>
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

const isUnlocked = ref(false);
const passwordInput = ref("");
const passwordError = ref("");

let channel;

// 取得行程標題（不含密碼/景點，解鎖前也能顯示）
const fetchTripTitle = async () => {
    const { data } = await supabase
        .from("trips")
        .select("title")
        .eq("id", tripId)
        .single();
    if (data) tripTitle.value = data.title;
};

// 取得景點資料（解鎖後才呼叫）
const fetchTripPlaces = async () => {
    const { data } = await supabase
        .from("trips")
        .select("places")
        .eq("id", tripId)
        .single();
    if (data) places.value = data.places || [];
};

// 訂閱 Supabase Realtime 即時推播頻道
const subscribeRealtime = () => {
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
};

// 向資料庫驗證密碼（密碼本身不會回傳到前端）
const submitPassword = async () => {
    const { data, error } = await supabase.rpc("check_trip_password", {
        trip_id: tripId,
        input_password: passwordInput.value,
    });

    if (error) {
        passwordError.value = "驗證失敗，請稍後再試";
        return;
    }

    if (data === true) {
        localStorage.setItem(`trip_unlocked_${tripId}`, "true");
        isUnlocked.value = true;
        passwordError.value = "";
        await fetchTripPlaces();
        subscribeRealtime();
    } else {
        passwordError.value = "密碼錯誤";
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
    await fetchTripTitle();

    if (localStorage.getItem(`trip_unlocked_${tripId}`) === "true") {
        isUnlocked.value = true;
        await fetchTripPlaces();
        subscribeRealtime();
    }
});

onUnmounted(() => {
    if (channel) supabase.removeChannel(channel);
});
</script>
