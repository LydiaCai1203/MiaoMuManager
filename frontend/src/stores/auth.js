import { defineStore } from 'pinia';
const TOKEN_KEY = 'asset-evaluation-token';
const USER_KEY = 'asset-evaluation-user';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY) ?? '',
        user: localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null,
    }),
    getters: {
        isLoggedIn: (state) => Boolean(state.token),
    },
    actions: {
        setAuth(token, user) {
            this.token = token;
            this.user = user;
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        },
        clearAuth() {
            this.token = '';
            this.user = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        },
    },
});
