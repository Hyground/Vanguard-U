/**
 * Global Store - Minimal state management
 * Pattern: State-driven Vanilla Architecture
 */
const Store = {
    state: {
        user: null,
        token: localStorage.getItem('vanguard_token') || null,
        academicProfile: null,
        theme: localStorage.getItem('vanguard_theme') || 'dark',
        currentCourse: null
    },

    init() {
        // Safe JSON parsing to avoid "undefined" or malformed strings errors
        const safeParse = (key) => {
            try {
                const val = localStorage.getItem(key);
                if (!val || val === "undefined") return null;
                return JSON.parse(val);
            } catch (e) {
                console.error(`Error parsing localStorage key "${key}":`, e);
                return null;
            }
        };

        this.state.user = safeParse('vanguard_user');
        this.state.academicProfile = safeParse('vanguard_academic');
        
        document.documentElement.setAttribute('data-theme', this.state.theme);
        console.log("Store initialized:", this.state);
    },

    // Getters
    getUser: () => Store.state.user,
    getToken: () => Store.state.token,
    getAcademicProfile: () => Store.state.academicProfile,
    getRole: () => Store.state.user?.role || null,
    isAuthenticated: () => !!Store.state.token,

    // Actions
    saveSession(token, user) {
        Store.state.token = token;
        Store.state.user = user;
        localStorage.setItem('vanguard_token', token);
        localStorage.setItem('vanguard_user', JSON.stringify(user));
        Store.notify();
    },

    saveAcademicProfile(profile) {
        Store.state.academicProfile = profile;
        localStorage.setItem('vanguard_academic', JSON.stringify(profile));
        Store.notify();
    },

    setCurrentCourse(course) {
        Store.state.currentCourse = course;
        Store.notify();
    },

    setTheme(theme) {
        Store.state.theme = theme;
        localStorage.setItem('vanguard_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        Store.notify();
    },

    logout() {
        Store.state.user = null;
        Store.state.token = null;
        Store.state.academicProfile = null;
        localStorage.removeItem('vanguard_token');
        localStorage.removeItem('vanguard_user');
        localStorage.removeItem('vanguard_academic');
        Store.notify();
    },

    listeners: [],
    subscribe(fn) {
        Store.listeners.push(fn);
        return () => {
            Store.listeners = Store.listeners.filter(l => l !== fn);
        };
    },
    notify() {
        Store.listeners.forEach(fn => fn(Store.state));
    }
};

// Initialize immediately
Store.init();
window.Store = Store;
