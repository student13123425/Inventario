const ADMIN_TOKEN_KEY = 'admin_auth_token';

export const AdminStorage = {
  saveToken(token: string): void {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save admin token:', e);
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch (e) {
      console.error('Failed to retrieve admin token:', e);
      return null;
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (e) {
      console.error('Failed to clear admin token:', e);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
