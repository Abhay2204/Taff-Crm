// In production (Vercel), use relative URLs since frontend and API are on same domain
// In development, proxy to local Express server
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('crm_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('crm_token', token);
        } else {
            localStorage.removeItem('crm_token');
        }
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async register(email, password, name) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        this.setToken(data.token);
        return data;
    }

    logout() {
        this.setToken(null);
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async getUsers() {
        return this.request('/auth/users');
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getRecentProspects() {
        return this.request('/dashboard/recent-prospects');
    }

    async getTodayFollowUps() {
        return this.request('/dashboard/today-followups');
    }

    async getUpcomingServices() {
        return this.request('/dashboard/upcoming-services');
    }

    // Prospects
    async getProspects(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/prospects${query ? `?${query}` : ''}`);
    }

    async getProspect(id) {
        return this.request(`/prospects/${id}`);
    }

    async createProspect(data) {
        return this.request('/prospects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProspect(id, data) {
        return this.request(`/prospects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteProspect(id) {
        return this.request(`/prospects/${id}`, { method: 'DELETE' });
    }

    // Follow-ups
    async getFollowUps(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/followups${query ? `?${query}` : ''}`);
    }

    async getFollowUp(id) {
        return this.request(`/followups/${id}`);
    }

    async createFollowUp(data) {
        return this.request('/followups', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateFollowUp(id, data) {
        return this.request(`/followups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteFollowUp(id) {
        return this.request(`/followups/${id}`, { method: 'DELETE' });
    }

    // Services
    async getServices(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/services${query ? `?${query}` : ''}`);
    }

    async getService(id) {
        return this.request(`/services/${id}`);
    }

    async getTodayServices() {
        return this.request('/services/today');
    }

    async getTodayServicesCount() {
        return this.request('/services/today-count');
    }

    async getUpcomingServicesList() {
        return this.request('/services/upcoming');
    }

    async autoGenerateServices(prospectId) {
        return this.request('/services/auto-generate', {
            method: 'POST',
            body: JSON.stringify({ prospectId }),
        });
    }

    async updateService(id, data) {
        return this.request(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteService(id) {
        return this.request(`/services/${id}`, { method: 'DELETE' });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

export const api = new ApiService();
export default api;
