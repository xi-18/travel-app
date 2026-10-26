<template>
    <div
        v-if="showAuthModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
        <div class="bg-white rounded-2xl p-6 w-80">
            <h3 class="font-bold mb-3">
                {{ authMode === "login" ? "登入" : "註冊" }}
            </h3>
            <input
                v-if="authMode === 'register'"
                v-model="authForm.nickname"
                placeholder="你的暱稱"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3"
            />
            <input
                v-model="authForm.email"
                type="email"
                placeholder="Email"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3"
            />
            <input
                v-model="authForm.password"
                type="password"
                placeholder="密碼"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3"
                @keyup.enter="submitAuth"
            />
            <p v-if="authError" class="text-[#ef4444] text-sm mb-3">
                {{ authError }}
            </p>
            <button
                class="w-full py-2 bg-[#2a9d8f] text-white rounded-lg mb-2"
                @click="submitAuth"
            >
                {{ authMode === "login" ? "登入" : "註冊" }}
            </button>
            <button
                class="w-full py-2 text-[#2a9d8f] text-sm"
                @click="authMode = authMode === 'login' ? 'register' : 'login'"
            >
                {{
                    authMode === "login"
                        ? "還沒帳號？去註冊"
                        : "已有帳號？去登入"
                }}
            </button>
            <button
                class="w-full py-2 text-[#999] text-sm"
                @click="showAuthModal = false"
            >
                先以訪客身份瀏覽
            </button>
        </div>
    </div>
    <div
        class="px-6 py-10 font-sans bg-linear-to-br from-[#fdf6ec] to-[#f3f7f2] min-h-screen"
    >
        <div class="max-w-300 mx-auto">
            <!-- Header -->
            <header class="flex justify-between items-center mb-10">
                <div class="flex items-center gap-2.5">
                    <span class="text-[28px]">🧭</span>
                    <div>
                        <div class="text-[11px] tracking-wide text-[#999]">
                            MAKE MEMORIES
                        </div>
                        <div class="text-xl font-bold">
                            <span class="text-[#2a9d8f]">WeiXi</span
                            ><span class="text-[#e76f51]">旅遊</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span v-if="session" class="text-[13px] text-[#555]">
                        你好，{{ profile?.nickname }}
                        <button class="text-[#e76f51] ml-2" @click="logout">
                            登出
                        </button>
                    </span>
                    <button
                        v-else
                        class="text-[13px] text-[#2a9d8f]"
                        @click="showAuthModal = true"
                    >
                        登入 / 註冊
                    </button>
                </div>
            </header>

            <!-- Hero -->
            <section class="mb-8">
                <div>
                    <div class="text-[#e76f51] text-[13px] mb-2">
                        — 今天也要出發！
                    </div>
                    <h1 class="text-[40px] leading-[1.3] mb-4">
                        把期待，<br />
                        <span class="text-[#2a9d8f]">排成一場旅行。</span>
                    </h1>
                    <p class="text-[#666] max-w-100 mb-6">
                        記下想去的地方，讓每一個目的地都成為故事的開頭。
                    </p>
                    <div class="flex gap-8">
                        <div>
                            <div class="text-[22px] font-bold">
                                {{ trips.length }}
                            </div>
                            <div class="text-xs text-[#888]">趟旅程</div>
                        </div>
                        <div>
                            <div class="text-[22px] font-bold">
                                {{ yearCount }}
                            </div>
                            <div class="text-xs text-[#888]">探索年份</div>
                        </div>
                        <div>
                            <div class="text-[22px] font-bold">∞</div>
                            <div class="text-xs text-[#888]">種可能</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 新增旅遊計畫（僅管理員可見） -->
            <section
                v-if="isAdmin"
                class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-10"
            >
                <div class="flex items-center gap-3 mb-5">
                    <span
                        class="w-9 h-9 bg-[#e76f51] text-white rounded-full flex items-center justify-center text-lg"
                        >+</span
                    >
                    <div>
                        <div class="text-[11px] tracking-wide text-[#999]">
                            START A NEW ADVENTURE
                        </div>
                        <div class="text-lg font-bold">新增旅遊計畫</div>
                    </div>
                </div>
                <div class="flex gap-3 items-end flex-wrap">
                    <div class="flex-1 min-w-35">
                        <label class="block text-xs text-[#888] mb-1"
                            >這次想去哪裡？</label
                        >
                        <input
                            v-model="newTrip.title"
                            placeholder="例如：京都慢旅行"
                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg box-border"
                        />
                    </div>
                    <div class="flex-1 min-w-35">
                        <label class="block text-xs text-[#888] mb-1"
                            >目的地</label
                        >
                        <input
                            v-model="newTrip.location"
                            placeholder="輸入城市或景點"
                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg box-border"
                        />
                    </div>
                    <div class="flex-1 min-w-35">
                        <label class="block text-xs text-[#888] mb-1"
                            >出發日期</label
                        >
                        <input
                            v-model="newTrip.travel_date"
                            type="date"
                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg box-border"
                        />
                    </div>
                    <div class="flex-1 min-w-35">
                        <label class="block text-xs text-[#888] mb-1"
                            >結束日期</label
                        >
                        <input
                            v-model="newTrip.end_date"
                            type="date"
                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg box-border"
                        />
                    </div>
                    <div class="flex-1 min-w-35">
                        <label class="block text-xs text-[#888] mb-1"
                            >行程密碼</label
                        >
                        <input
                            v-model="newTrip.password"
                            type="text"
                            placeholder="設定這個行程的密碼"
                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg box-border"
                        />
                    </div>
                    <button
                        class="px-5 py-2.5 bg-[#2a9d8f] text-white border-none rounded-lg cursor-pointer whitespace-nowrap"
                        @click="addTrip"
                    >
                        + 建立旅程
                    </button>
                </div>
            </section>

            <!-- Journey Log -->
            <section>
                <div class="flex justify-between items-center mb-4">
                    <div class="text-[11px] tracking-wide text-[#999]">
                        YOUR JOURNEY LOG
                    </div>
                    <span
                        class="text-xs bg-[#eef6f4] text-[#2a9d8f] px-2.5 py-1 rounded-xl"
                        >{{ trips.length }} trips</span
                    >
                </div>

                <div v-for="year in sortedYears" :key="year" class="mb-6">
                    <h2 class="mt-1 mb-3 text-[#2a9d8f]">{{ year }} 行程</h2>
                    <div
                        v-for="trip in groupedByYear[year]"
                        :key="trip.id"
                        class="flex items-center gap-4 bg-white rounded-xl p-4 mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)] relative"
                    >
                        <div
                            class="bg-[#fdece6] text-[#e76f51] rounded-[10px] px-3 py-2 text-center min-w-12.5"
                        >
                            <div class="text-[11px] font-bold">
                                {{ formatMonth(trip.travel_date) }}
                            </div>
                            <div class="text-xl font-bold">
                                {{ formatDay(trip.travel_date) }}
                            </div>
                        </div>
                        <div
                            class="flex-1 cursor-pointer"
                            @click="navigateTo(`/trip/${trip.id}`)"
                        >
                            <h3 class="mt-0 mb-1">{{ trip.title }}</h3>
                            <p class="my-0.5 text-[13px] text-[#777]">
                                📍 {{ trip.location || "未設定地點" }}
                            </p>
                            <p class="my-0.5 text-[13px] text-[#777]">
                                📅
                                {{
                                    trip.end_date &&
                                    trip.end_date !== trip.travel_date
                                        ? `${trip.travel_date} ~ ${trip.end_date}`
                                        : trip.travel_date || "未設定日期"
                                }}
                            </p>
                        </div>
                        <button
                            v-if="isAdmin"
                            class="border-none bg-transparent text-[#ccc] text-lg cursor-pointer"
                            @click.stop="removeTrip(trip.id)"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
const { $supabase: supabase } = useNuxtApp();

const trips = ref([]);

// 登入狀態與管理員判斷（來自 profiles.is_admin，並配合 RLS 在資料庫層級實際擋權）
const { session, profile, isAdmin, init, login, register, logout } = useAuth();

const showAuthModal = ref(false);
const authMode = ref("login");
const authForm = ref({ email: "", password: "", nickname: "" });
const authError = ref("");

const submitAuth = async () => {
    authError.value = "";
    const result =
        authMode.value === "login"
            ? await login(authForm.value.email, authForm.value.password)
            : await register(
                  authForm.value.email,
                  authForm.value.password,
                  authForm.value.nickname,
              );

    if (result.error) {
        authError.value =
            authMode.value === "login"
                ? "登入失敗，請檢查帳號密碼"
                : "註冊失敗：" + result.error.message;
        return;
    }

    if (result.needsEmailConfirmation) {
        authError.value = "註冊成功！請先去信箱點擊確認信再回來登入。";
        return;
    }

    showAuthModal.value = false;
    authForm.value = { email: "", password: "", nickname: "" };
};

// 年份分組
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

// 排序年份
const sortedYears = computed(() =>
    Object.keys(groupedByYear.value).sort((a, b) => b - a),
);
// 年份數量
const yearCount = computed(() => sortedYears.value.length);

// 格式化月份
const formatMonth = (date) => {
    if (!date) return "---";
    return new Date(date)
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
};
// 格式化日期
const formatDay = (date) => {
    if (!date) return "--";
    return new Date(date).getDate();
};

// 新增行程表單數據
const newTrip = ref({
    title: "",
    location: "",
    travel_date: "",
    end_date: "",
    password: "",
});

const addTrip = async () => {
    if (!newTrip.value.title.trim() || !newTrip.value.password.trim()) return;

    const { data, error } = await supabase
        .from("trips")
        .insert({
            title: newTrip.value.title,
            location: newTrip.value.location,
            travel_date: newTrip.value.travel_date || null,
            end_date: newTrip.value.end_date || null,
            password: newTrip.value.password,
            places: [],
        })
        .select()
        .single();

    if (data) {
        trips.value = [data, ...trips.value];
        newTrip.value = {
            title: "",
            location: "",
            travel_date: "",
            end_date: "",
            password: "",
        };
    }
    if (error) console.error(error);
};

const removeTrip = async (id) => {
    await supabase.from("trips").delete().eq("id", id);
    trips.value = trips.value.filter((t) => t.id !== id);
};

// 初始化登入狀態
onMounted(() => {
    init();
});

// 初始化行程列表
onMounted(async () => {
    const { data } = await supabase
        .from("trips")
        .select("id, title, location, travel_date, end_date")
        .order("travel_date", { ascending: false });
    trips.value = data || [];
});
</script>
