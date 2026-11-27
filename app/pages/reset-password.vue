<!-- app/pages/reset-password.vue -->
<template>
    <div
        class="px-6 py-10 font-sans bg-linear-to-br from-[#fdf6ec] to-[#f3f7f2] min-h-screen"
    >
        <div class="max-w-100 mx-auto">
            <NuxtLink
                to="/"
                class="text-[13px] text-[#2a9d8f] flex items-center gap-1 mb-6"
            >
                ← 返回首頁
            </NuxtLink>

            <div
                class="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
                <h1 class="text-xl font-bold mb-1">
                    <span class="text-[#2a9d8f]">重設</span
                    ><span class="text-[#e76f51]">密碼</span>
                </h1>

                <!-- 驗證連結中 -->
                <p v-if="status === 'checking'" class="text-sm text-[#666] mt-3">
                    驗證連結中...
                </p>

                <!-- 連結無效或已過期 -->
                <template v-else-if="status === 'invalid'">
                    <p class="text-sm text-[#ef4444] mt-3 mb-4">
                        重設連結無效或已過期，請重新申請。
                    </p>
                    <NuxtLink
                        to="/"
                        class="block w-full py-2 bg-[#2a9d8f] text-white rounded-lg text-center text-sm no-underline"
                    >
                        回首頁重新申請
                    </NuxtLink>
                </template>

                <!-- 完成 -->
                <template v-else-if="status === 'done'">
                    <p class="text-sm text-[#10b981] mt-3 mb-4">
                        密碼已更新，正在返回首頁...
                    </p>
                </template>

                <!-- 設定新密碼 -->
                <form v-else class="mt-3" @submit.prevent="submit">
                    <p class="text-sm text-[#666] mb-3">請輸入您的新密碼</p>
                    <input
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                        placeholder="新密碼（至少 6 個字元）"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 box-border"
                    />
                    <input
                        v-model="confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        placeholder="再次輸入新密碼"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 box-border"
                    />
                    <p v-if="errorMsg" class="text-[#ef4444] text-sm mb-3">
                        {{ errorMsg }}
                    </p>
                    <button
                        type="submit"
                        :disabled="submitting"
                        class="w-full py-2 bg-[#2a9d8f] text-white rounded-lg border-none cursor-pointer disabled:opacity-60"
                    >
                        {{ submitting ? "更新中..." : "更新密碼" }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
const { $supabase: supabase } = useNuxtApp();
const { updatePassword } = useAuth();

// checking → ready（可設定密碼）/ invalid（連結失效）→ done
const status = ref("checking");
const password = ref("");
const confirmPassword = ref("");
const errorMsg = ref("");
const submitting = ref(false);

let subscription = null;
let timer = null;

onMounted(async () => {
    // 連結帶有錯誤（例如 otp_expired）時直接視為無效
    if (window.location.hash.includes("error")) {
        status.value = "invalid";
        return;
    }

    // Supabase 會從網址的 token 建立暫時登入狀態
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === "PASSWORD_RECOVERY" || (newSession && event === "SIGNED_IN")) {
            status.value = "ready";
        }
    });
    subscription = data.subscription;

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
        status.value = "ready";
        return;
    }

    // 等待 token 交換；逾時仍沒有登入狀態就判定連結無效
    timer = setTimeout(() => {
        if (status.value === "checking") status.value = "invalid";
    }, 3000);
});

onBeforeUnmount(() => {
    subscription?.unsubscribe();
    clearTimeout(timer);
});

const submit = async () => {
    errorMsg.value = "";
    if (password.value.length < 6) {
        errorMsg.value = "密碼至少需要 6 個字元";
        return;
    }
    if (password.value !== confirmPassword.value) {
        errorMsg.value = "兩次輸入的密碼不一致";
        return;
    }

    submitting.value = true;
    const { error } = await updatePassword(password.value);
    submitting.value = false;

    if (error) {
        errorMsg.value = error.message;
        return;
    }
    status.value = "done";
    setTimeout(() => navigateTo("/"), 1500);
};
</script>
