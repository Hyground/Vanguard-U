const AuthManager = {
    TOKEN_KEY: 'vanguard_token',
    USER_KEY: 'vanguard_user',
    ACADEMIC_KEY: 'vanguard_academic',

    saveSession(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    saveAcademicProfile(profile) {
        localStorage.setItem(this.ACADEMIC_KEY, JSON.stringify(profile));
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    getAcademicProfile() {
        const profile = localStorage.getItem(this.ACADEMIC_KEY);
        return profile ? JSON.parse(profile) : null;
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.ACADEMIC_KEY);
    },

    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }
};
