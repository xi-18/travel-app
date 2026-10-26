// 共用登入狀態（模組層級，跨頁面共用同一份 session/profile）
const session = ref(null);
const profile = ref(null);
let initialized = false;

export const useAuth = () => {
    const { $supabase: supabase } = useNuxtApp();

    const isAdmin = computed(() => profile.value?.is_admin === true);

    const loadProfile = async (userId) => {
        const { data } = await supabase
            .from("profiles")
            .select("nickname, is_admin")
            .eq("id", userId)
            .single();
        profile.value = data;
    };

    const init = async () => {
        if (initialized) return;
        initialized = true;

        const { data } = await supabase.auth.getSession();
        session.value = data.session;
        if (session.value) await loadProfile(session.value.user.id);

        supabase.auth.onAuthStateChange(async (_event, newSession) => {
            session.value = newSession;
            if (newSession) {
                await loadProfile(newSession.user.id);
            } else {
                profile.value = null;
            }
        });
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (!error) {
            session.value = data.session;
            await loadProfile(data.user.id);
        }
        return { error };
    };

    const register = async (email, password, nickname) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nickname } },
        });
        if (!error) {
            session.value = data.session;
            if (data.user) await loadProfile(data.user.id);
        }
        return { error, needsEmailConfirmation: !error && !data.session };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        session.value = null;
        profile.value = null;
    };

    return { session, profile, isAdmin, init, login, register, logout };
};
