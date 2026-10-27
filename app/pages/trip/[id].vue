<!-- app/pages/trip/[id].vue -->
<template>
    <div
        class="px-6 py-10 font-sans bg-linear-to-br from-[#fdf6ec] to-[#f3f7f2] min-h-screen"
    >
        <div class="max-w-300 mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <NuxtLink
                    to="/"
                    class="text-[13px] text-[#2a9d8f] flex items-center gap-1"
                >
                    ← 返回首頁
                </NuxtLink>
                <span
                    v-if="isUnlocked && isConnected"
                    class="text-xs text-[#10b981] font-bold"
                >
                    ● 即時同步中
                </span>
            </div>

            <h1 class="text-2xl font-bold mb-1">🗺️ {{ tripTitle }}</h1>
            <p v-if="tripDateRange" class="text-sm text-[#888] mb-8">
                📅 {{ tripDateRange }}
            </p>

            <!-- 密碼驗證畫面 -->
            <div
                v-if="!isUnlocked"
                class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
                <p class="text-sm text-[#555] mb-3">
                    請輸入這個行程的密碼才能查看內容
                </p>
                <div class="flex gap-2">
                    <input
                        v-model="passwordInput"
                        type="password"
                        placeholder="輸入密碼"
                        @keyup.enter="submitPassword"
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-lg box-border"
                    />
                    <button
                        @click="submitPassword"
                        class="px-5 py-2 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer whitespace-nowrap"
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
                <!-- 分頁：總覽與各天 -->
                <div class="flex gap-2 mb-6 flex-wrap">
                    <button
                        @click="activeDay = 0"
                        :class="[
                            'px-4 py-2 rounded-full text-sm cursor-pointer border-none',
                            activeDay === 0
                                ? 'bg-[#e76f51] text-white'
                                : 'bg-white text-[#555] shadow-[0_2px_8px_rgba(0,0,0,0.05)]',
                        ]"
                    >
                        📋 總覽
                    </button>
                    <button
                        v-for="day in totalDays"
                        :key="day"
                        @click="activeDay = day"
                        :class="[
                            'px-4 py-2 rounded-full text-sm cursor-pointer border-none',
                            activeDay === day
                                ? 'bg-[#2a9d8f] text-white'
                                : 'bg-white text-[#555] shadow-[0_2px_8px_rgba(0,0,0,0.05)]',
                        ]"
                    >
                        Day {{ day }}
                    </button>
                </div>

                <!-- 總覽頁 -->
                <div v-if="activeDay === 0" class="flex flex-col gap-6">
                    <section
                        class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h2 class="font-bold text-[#2a9d8f] mb-3">
                            👥 參與成員
                        </h2>
                        <div v-if="members.length" class="flex flex-wrap gap-2">
                            <span
                                v-for="(m, i) in members"
                                :key="i"
                                class="px-3 py-1 bg-[#eef6f4] text-[#2a9d8f] rounded-full text-sm"
                                >{{ m }}</span
                            >
                        </div>
                        <p v-else class="text-sm text-[#999]">
                            尚未指定參與成員
                        </p>
                    </section>

                    <section
                        class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h2 class="font-bold text-[#2a9d8f] mb-3">
                            🗓️ 行程總覽
                        </h2>
                        <div
                            v-for="day in totalDays"
                            :key="day"
                            class="flex gap-3 py-2 text-sm border-b border-gray-100 last:border-b-0"
                        >
                            <button
                                @click="activeDay = day"
                                class="shrink-0 font-bold text-[#e76f51] border-none bg-transparent cursor-pointer p-0"
                            >
                                Day {{ day }}
                            </button>
                            <span
                                v-if="placesByDay(day).length"
                                class="text-[#555]"
                                >{{
                                    placesByDay(day)
                                        .map((p) => p.name)
                                        .join(" → ")
                                }}</span
                            >
                            <span v-else class="text-[#999]">尚未安排</span>
                        </div>
                    </section>

                    <section
                        class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h2 class="font-bold text-[#2a9d8f] mb-3">
                            🎒 必帶物品
                        </h2>
                        <ul class="list-none p-0 m-0">
                            <li
                                v-for="item in overview.packing"
                                :key="item.id"
                                class="flex items-center gap-2 py-1 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    :checked="item.checked"
                                    :disabled="!canEdit"
                                    @change="togglePacking(item.id)"
                                />
                                <span
                                    :class="
                                        item.checked
                                            ? 'line-through text-[#aaa]'
                                            : 'text-[#555]'
                                    "
                                    >{{ item.text }}</span
                                >
                                <button
                                    v-if="canEdit"
                                    @click="removePacking(item.id)"
                                    class="ml-auto border-none bg-transparent text-[#ccc] cursor-pointer"
                                >
                                    ×
                                </button>
                            </li>
                        </ul>
                        <p
                            v-if="!overview.packing.length"
                            class="text-sm text-[#999]"
                        >
                            尚未列出必帶物品
                        </p>
                        <div v-if="canEdit" class="flex gap-2 mt-3">
                            <input
                                v-model="newPacking"
                                placeholder="新增物品，例如：護照"
                                @keyup.enter="addPacking"
                                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg box-border text-sm"
                            />
                            <button
                                @click="addPacking"
                                class="px-3 py-2 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer text-sm whitespace-nowrap"
                            >
                                新增
                            </button>
                        </div>
                    </section>

                    <section
                        class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                    >
                        <h2 class="font-bold text-[#2a9d8f] mb-3">
                            ⚠️ 提醒事項
                        </h2>
                        <ul class="list-none p-0 m-0">
                            <li
                                v-for="item in overview.reminders"
                                :key="item.id"
                                class="flex items-start gap-2 py-1 text-sm text-[#555]"
                            >
                                <span>•</span>
                                <span class="flex-1">{{ item.text }}</span>
                                <button
                                    v-if="canEdit"
                                    @click="removeReminder(item.id)"
                                    class="border-none bg-transparent text-[#ccc] cursor-pointer"
                                >
                                    ×
                                </button>
                            </li>
                        </ul>
                        <p
                            v-if="!overview.reminders.length"
                            class="text-sm text-[#999]"
                        >
                            尚無提醒事項
                        </p>
                        <div v-if="canEdit" class="flex gap-2 mt-3">
                            <input
                                v-model="newReminder"
                                placeholder="新增提醒，例如：集合時間 7:30"
                                @keyup.enter="addReminder"
                                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg box-border text-sm"
                            />
                            <button
                                @click="addReminder"
                                class="px-3 py-2 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer text-sm whitespace-nowrap"
                            >
                                新增
                            </button>
                        </div>
                    </section>
                </div>

                <template v-else>
                    <!-- 景點清單 -->
                    <h2 class="text-lg font-bold text-[#2a9d8f] mb-3">
                        Day {{ activeDay }} 行程
                        <span class="text-xs font-normal text-[#999] ml-1"
                            >共 {{ placesForActiveDay.length }} 個景點</span
                        >
                    </h2>
                    <div class="flex flex-col gap-3">
                        <template
                            v-for="(place, index) in placesForActiveDay"
                            :key="place.id"
                        >
                            <!-- 與上一個景點之間的交通方式 -->
                            <div
                                v-if="index > 0 && (canEdit || place.transport)"
                                class="flex items-center gap-2 pl-4 text-xs text-[#888]"
                            >
                                <span>↓</span>
                                <template v-if="canEdit">
                                    <select
                                        :value="place.transport || ''"
                                        @change="
                                            updatePlaceField(
                                                place.id,
                                                'transport',
                                                $event.target.value,
                                            )
                                        "
                                        class="px-2 py-1 border border-gray-200 rounded-lg bg-white"
                                    >
                                        <option value="">選擇交通方式</option>
                                        <option
                                            v-for="t in transportOptions"
                                            :key="t"
                                            :value="t"
                                        >
                                            {{ t }}
                                        </option>
                                    </select>
                                    <input
                                        :value="place.transport_duration || ''"
                                        @change="
                                            updatePlaceField(
                                                place.id,
                                                'transport_duration',
                                                $event.target.value.trim(),
                                            )
                                        "
                                        placeholder="耗時，例如 30 分鐘"
                                        class="px-2 py-1 border border-gray-200 rounded-lg w-36"
                                    />
                                </template>
                                <span v-else>
                                    {{ place.transport }}
                                    <template v-if="place.transport_duration">
                                        · {{ place.transport_duration }}
                                    </template>
                                </span>
                            </div>
                            <div
                                :draggable="canEdit && editingId !== place.id"
                                @dragstart="draggingId = place.id"
                                @dragover.prevent
                                @drop.prevent="dropOn(place.id)"
                                @dragend="draggingId = null"
                                :class="[
                                    'bg-white rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border-l-4 border-[#2a9d8f] flex items-start gap-3',
                                    canEdit && editingId !== place.id
                                        ? 'cursor-grab'
                                        : '',
                                    draggingId === place.id ? 'opacity-40' : '',
                                ]"
                            >
                                <span
                                    class="w-7 h-7 shrink-0 rounded-full bg-[#2a9d8f] text-white text-sm font-bold flex items-center justify-center"
                                    >{{ index + 1 }}</span
                                >
                                <!-- 編輯模式 -->
                                <div
                                    v-if="editingId === place.id"
                                    class="flex-1 flex flex-col gap-2"
                                >
                                    <input
                                        v-model="editForm.name"
                                        placeholder="景點名稱"
                                        class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border"
                                    />
                                    <input
                                        v-model="editForm.address"
                                        placeholder="地址（選填）"
                                        class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border"
                                    />
                                    <textarea
                                        v-model="editForm.description"
                                        placeholder="景點說明（選填）"
                                        rows="2"
                                        class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border"
                                    ></textarea>
                                    <input
                                        v-model="editForm.link"
                                        placeholder="參考連結（選填）"
                                        class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border"
                                    />
                                    <label class="text-xs text-[#888]">
                                        移到第
                                        <select
                                            v-model.number="editForm.day"
                                            class="mx-1 px-2 py-1 border border-gray-200 rounded-lg bg-white"
                                        >
                                            <option
                                                v-for="d in totalDays"
                                                :key="d"
                                                :value="d"
                                            >
                                                {{ d }}
                                            </option>
                                        </select>
                                        天
                                    </label>
                                    <div class="flex gap-2">
                                        <button
                                            @click="saveEdit"
                                            class="px-4 py-1.5 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer text-sm"
                                        >
                                            儲存
                                        </button>
                                        <button
                                            @click="editingId = null"
                                            class="px-4 py-1.5 bg-transparent text-[#888] border border-gray-200 rounded-lg cursor-pointer text-sm"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                                <div v-else class="flex-1">
                                    <h3 class="font-bold mb-1">
                                        📍 {{ place.name }}
                                    </h3>
                                    <p
                                        v-if="place.address"
                                        class="text-xs text-[#888] mb-1"
                                    >
                                        🏠 {{ place.address }}
                                    </p>
                                    <p
                                        v-if="place.description"
                                        class="text-sm text-[#555] mb-1"
                                    >
                                        {{ place.description }}
                                    </p>
                                    <a
                                        v-if="place.link"
                                        :href="place.link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-xs text-[#2563eb] underline"
                                    >
                                        🔗 參考連結
                                    </a>
                                    <p class="text-xs text-[#aaa] mt-2">
                                        新增者：{{ place.added_by || "未知" }}
                                    </p>
                                </div>
                                <div
                                    v-if="canEdit && editingId !== place.id"
                                    class="flex items-center gap-1"
                                >
                                    <button
                                        @click="startEdit(place)"
                                        class="border-none bg-transparent text-[#999] text-sm cursor-pointer"
                                    >
                                        ✏️ 編輯
                                    </button>
                                    <button
                                        @click="removePlace(place.id)"
                                        class="border-none bg-transparent text-[#ccc] text-lg cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </template>
                        <p
                            v-if="!placesForActiveDay.length"
                            class="text-sm text-[#999] text-center py-6"
                        >
                            這天還沒有景點，開始新增吧！
                        </p>
                    </div>

                    <!-- 新增景點表單（僅管理員或行程參與者可見） -->
                    <div
                        v-if="canEdit"
                        class="mt-8 rounded-2xl p-6 bg-[#eef6f4] border-2 border-dashed border-[#2a9d8f]/50"
                    >
                        <div class="flex items-center gap-3 mb-4">
                            <span
                                class="w-9 h-9 bg-[#e76f51] text-white rounded-full flex items-center justify-center text-lg"
                                >+</span
                            >
                            <div>
                                <div
                                    class="text-[11px] tracking-wide text-[#999]"
                                >
                                    ADD A NEW PLACE
                                </div>
                                <div class="font-bold">
                                    新增景點到 Day {{ activeDay }}
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <input
                                v-model="newPlace.name"
                                placeholder="景點名稱"
                                class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border bg-white"
                            />
                            <input
                                v-model="newPlace.address"
                                placeholder="地址（選填）"
                                class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border bg-white"
                            />
                            <textarea
                                v-model="newPlace.description"
                                placeholder="景點說明（選填）"
                                rows="2"
                                class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border bg-white"
                            ></textarea>
                            <input
                                v-model="newPlace.link"
                                placeholder="參考連結（選填）"
                                class="w-full px-3 py-2 border border-gray-200 rounded-lg box-border bg-white"
                            />
                            <button
                                @click="addPlace"
                                class="px-5 py-2 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer whitespace-nowrap self-start"
                            >
                                + 新增景點
                            </button>
                        </div>
                    </div>
                </template>

                <!-- 管理行程參與者（僅管理員可見） -->
                <div
                    v-if="isAdmin && activeDay === 0"
                    class="mt-6 bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                >
                    <h3 class="font-bold mb-3 text-sm">管理行程參與者</h3>
                    <div class="flex gap-2 mb-3">
                        <input
                            v-model="participantEmail"
                            type="email"
                            placeholder="輸入對方註冊時的 Email"
                            @keyup.enter="addParticipant"
                            class="flex-1 px-3 py-2 border border-gray-200 rounded-lg box-border text-sm"
                        />
                        <button
                            @click="addParticipant"
                            class="px-3 py-2 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer text-sm whitespace-nowrap"
                        >
                            加入
                        </button>
                    </div>
                    <p
                        v-if="participantError"
                        class="text-[#ef4444] text-xs mb-2"
                    >
                        {{ participantError }}
                    </p>
                    <ul class="list-none p-0">
                        <li
                            v-for="p in participants"
                            :key="p.user_id"
                            class="flex justify-between items-center py-1 text-sm"
                        >
                            <span>{{ p.nickname }}（{{ p.email }}）</span>
                            <button
                                @click="removeParticipant(p.user_id)"
                                class="text-[#ef4444] border-none bg-transparent cursor-pointer text-xs"
                            >
                                移除
                            </button>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
const { $supabase: supabase } = useNuxtApp();

const route = useRoute();

const tripId = route.params.id;
const tripTitle = ref("載入中...");
const tripStartDate = ref(null);
const tripEndDate = ref(null);
const places = ref([]);
const isConnected = ref(false);

const isUnlocked = ref(false);
const passwordInput = ref("");
const passwordError = ref("");

const activeDay = ref(0); // 0 代表總覽頁
const newPlace = ref({ name: "", address: "", description: "", link: "" });

const overview = ref({ packing: [], reminders: [] });
const members = ref([]);
const newPacking = ref("");
const newReminder = ref("");
const draggingId = ref(null);

// 是否可以編輯景點：管理員或被指定為該行程參與者
const { session, profile, isAdmin, init } = useAuth();
const isParticipant = ref(false);
const canEdit = computed(() => isAdmin.value || isParticipant.value);

// 行程總天數（依出發/結束日期計算，無結束日期則視為一天）
const totalDays = computed(() => {
    if (!tripStartDate.value || !tripEndDate.value) return 1;
    const start = new Date(tripStartDate.value);
    const end = new Date(tripEndDate.value);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 1;
});

const tripDateRange = computed(() => {
    if (!tripStartDate.value) return "";
    return tripEndDate.value && tripEndDate.value !== tripStartDate.value
        ? `${tripStartDate.value} ~ ${tripEndDate.value}`
        : tripStartDate.value;
});

const placesForActiveDay = computed(() =>
    places.value.filter((p) => (p.day || 1) === activeDay.value),
);

const placesByDay = (day) => places.value.filter((p) => (p.day || 1) === day);

const checkParticipant = async () => {
    if (!session.value) {
        isParticipant.value = false;
        return;
    }
    const { data } = await supabase
        .from("trip_participants")
        .select("trip_id")
        .eq("trip_id", tripId)
        .eq("user_id", session.value.user.id)
        .maybeSingle();
    isParticipant.value = !!data;
};

let channel;

// 取得行程基本資訊（不含密碼/景點，解鎖前也能顯示）
const fetchTripTitle = async () => {
    const { data } = await supabase
        .from("trips")
        .select("title, travel_date, end_date")
        .eq("id", tripId)
        .single();
    if (data) {
        tripTitle.value = data.title;
        tripStartDate.value = data.travel_date;
        tripEndDate.value = data.end_date;
    }
};

// 取得景點資料（解鎖後才呼叫）
const fetchTripPlaces = async () => {
    const { data } = await supabase
        .from("trips")
        .select("places, overview")
        .eq("id", tripId)
        .single();
    if (data) {
        places.value = data.places || [];
        overview.value = normalizeOverview(data.overview);
    }
};

const normalizeOverview = (raw) => ({
    packing: raw?.packing || [],
    reminders: raw?.reminders || [],
});

// 參與成員暱稱（透過 RPC，一般訪客也能看到但看不到 Email）
const fetchMembers = async () => {
    const { data } = await supabase.rpc("get_trip_members", {
        p_trip_id: tripId,
    });
    members.value = (data || []).map((row) => row.nickname);
};

const updateOverview = async (next) => {
    overview.value = next;
    await supabase.from("trips").update({ overview: next }).eq("id", tripId);
};

const addPacking = () => {
    const text = newPacking.value.trim();
    if (!text) return;
    updateOverview({
        ...overview.value,
        packing: [
            ...overview.value.packing,
            { id: crypto.randomUUID(), text, checked: false },
        ],
    });
    newPacking.value = "";
};

const togglePacking = (id) => {
    updateOverview({
        ...overview.value,
        packing: overview.value.packing.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i,
        ),
    });
};

const removePacking = (id) => {
    updateOverview({
        ...overview.value,
        packing: overview.value.packing.filter((i) => i.id !== id),
    });
};

const addReminder = () => {
    const text = newReminder.value.trim();
    if (!text) return;
    updateOverview({
        ...overview.value,
        reminders: [
            ...overview.value.reminders,
            { id: crypto.randomUUID(), text },
        ],
    });
    newReminder.value = "";
};

const removeReminder = (id) => {
    updateOverview({
        ...overview.value,
        reminders: overview.value.reminders.filter((i) => i.id !== id),
    });
};

// 拖曳排序：只重排目前這一天的景點
const dropOn = (targetId) => {
    const fromId = draggingId.value;
    draggingId.value = null;
    if (!fromId || fromId === targetId) return;

    const dayList = [...placesForActiveDay.value];
    const from = dayList.findIndex((p) => p.id === fromId);
    const to = dayList.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;

    const [moved] = dayList.splice(from, 1);
    dayList.splice(to, 0, moved);
    const others = places.value.filter((p) => (p.day || 1) !== activeDay.value);
    updatePlaces([...others, ...dayList]);
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
                if (payload.new) {
                    overview.value = normalizeOverview(payload.new.overview);
                }
            },
        )
        .subscribe((status) => {
            if (status === "SUBSCRIBED") isConnected.value = true;
        });
};

// 解鎖行程：載入景點並訂閱即時同步
const unlock = async () => {
    if (isUnlocked.value) return;
    isUnlocked.value = true;
    await fetchTripPlaces();
    await fetchMembers();
    subscribeRealtime();
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
        // sessionStorage 在關閉瀏覽器後會清除，下次需重新輸入密碼
        sessionStorage.setItem(`trip_unlocked_${tripId}`, "true");
        passwordError.value = "";
        await unlock();
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
    if (!newPlace.value.name.trim()) return;
    const place = {
        id: crypto.randomUUID(),
        day: activeDay.value,
        name: newPlace.value.name.trim(),
        address: newPlace.value.address.trim(),
        description: newPlace.value.description.trim(),
        link: newPlace.value.link.trim(),
        added_by: profile.value?.nickname || "匯名",
    };
    updatePlaces([...places.value, place]);
    newPlace.value = { name: "", address: "", description: "", link: "" };
};

const removePlace = (id) => {
    updatePlaces(places.value.filter((p) => p.id !== id));
};

// transport 欄位表示「從上一個景點過來」的交通方式
const transportOptions = [
    "🚶 步行",
    "🚆 電車/地鐵",
    "🚌 公車",
    "🚕 計程車",
    "🚗 開車",
    "🚲 腳踏車",
    "🚄 高鐵/新幹線",
    "✈️ 飛機",
    "⛴️ 船",
    "其他",
];

const updatePlaceField = (id, field, value) => {
    updatePlaces(
        places.value.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
};

const editingId = ref(null);
const editForm = ref({
    name: "",
    address: "",
    description: "",
    link: "",
    day: 1,
});

const startEdit = (place) => {
    editingId.value = place.id;
    editForm.value = {
        name: place.name || "",
        address: place.address || "",
        description: place.description || "",
        link: place.link || "",
        day: place.day || 1,
    };
};

const saveEdit = () => {
    if (!editForm.value.name.trim()) return;
    const { name, address, description, link, day } = editForm.value;
    updatePlaces(
        places.value.map((p) =>
            p.id === editingId.value
                ? {
                      ...p,
                      name: name.trim(),
                      address: address.trim(),
                      description: description.trim(),
                      link: link.trim(),
                      day,
                  }
                : p,
        ),
    );
    editingId.value = null;
};

// 行程參與者名單（管理員專用）
const participants = ref([]);
const participantEmail = ref("");
const participantError = ref("");

const fetchParticipants = async () => {
    const { data } = await supabase
        .from("trip_participants")
        .select("user_id, profiles(nickname, email)")
        .eq("trip_id", tripId);
    participants.value = (data || []).map((row) => ({
        user_id: row.user_id,
        nickname: row.profiles?.nickname,
        email: row.profiles?.email,
    }));
    await fetchMembers();
};

const addParticipant = async () => {
    participantError.value = "";
    if (!participantEmail.value.trim()) return;

    const { data: targetProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", participantEmail.value.trim())
        .maybeSingle();

    if (!targetProfile) {
        participantError.value = "找不到此 Email 對應的帳號，請先請對方註冊";
        return;
    }

    const { error } = await supabase
        .from("trip_participants")
        .insert({ trip_id: tripId, user_id: targetProfile.id });

    if (error) {
        participantError.value = "加入失敗，可能已經是參與者了";
        return;
    }

    participantEmail.value = "";
    await fetchParticipants();
};

const removeParticipant = async (userId) => {
    await supabase
        .from("trip_participants")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", userId);
    await fetchParticipants();
};

onMounted(async () => {
    await init();
    await checkParticipant();
    await fetchTripTitle();

    if (sessionStorage.getItem(`trip_unlocked_${tripId}`) === "true") {
        await unlock();
    }

    // 管理員與被邀請的參與者免輸入密碼
    if (canEdit.value) await unlock();

    if (isAdmin.value) await fetchParticipants();
});

watch(session, checkParticipant);

watch(canEdit, (value) => {
    if (value) unlock();
});

onUnmounted(() => {
    if (channel) supabase.removeChannel(channel);
});
</script>
