/**
 * Global Store - Minimal state management
 * Pattern: State-driven Vanilla Architecture
 */
const Store = {
    state: {
        user: JSON.parse(localStorage.getItem('vanguard_user')) || null,
        token: localStorage.getItem('vanguard_token') || null,
        academicProfile: JSON.parse(localStorage.getItem('vanguard_academic')) || null,
        theme: localStorage.getItem('vanguard_theme') || 'dark',
        currentCourse: null
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

    // Simple observer pattern to notify views of state changes
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

window.Store = Store; // Global access
// Initialize theme
document.documentElement.setAttribute('data-theme', Store.state.theme);
