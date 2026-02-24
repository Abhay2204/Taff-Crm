/**
 * api.js – frontend-only stub
 * Delegates every method to the local store (localStorage).
 * When the backend is ready, swap the store calls for real fetch() calls here.
 */
import store from './store';

// Wrap a synchronous store call in a resolved Promise so callers that
// already use `await api.*()` continue working without any changes.
const p = (fn) => (...args) => Promise.resolve(fn(...args));

const api = {
    // Auth
    login: p((email, password) => ({ token: 'local', user: { email } })),
    logout: () => { },
    getCurrentUser: p(() => null),
    getUsers: p(() => store.getUsers()),

    // Dashboard
    getDashboardStats: p(() => store.getDashboardStats()),
    getRecentProspects: p(() => store.getRecentProspects()),
    getTodayFollowUps: p(() => store.getTodayFollowUps()),
    getUpcomingServices: p(() => store.getUpcomingServices()),

    // Prospects
    getProspects: p((params) => store.getProspects(params)),
    getProspect: p((id) => store.getProspects().data.find(p => p.id === id)),
    createProspect: p((data) => store.createProspect(data)),
    updateProspect: p((id, data) => store.updateProspect(id, data)),
    deleteProspect: p((id) => store.deleteProspect(id)),

    // Follow-ups
    getFollowUps: p((params) => store.getFollowUps(params)),
    createFollowUp: p((data) => store.createFollowUp(data)),

    // Services
    getServices: p((params) => store.getServices(params)),
    getTodayServices: p(() => store.getTodayServices()),
    getTodayServicesCount: p(() => store.getTodayServices().length),
    getUpcomingServicesList: p(() => store.getUpcomingServicesList()),
    updateService: p((id, data) => store.updateService(id, data)),
    deleteService: p((id) => store.deleteService(id)),

    // Health
    healthCheck: p(() => ({ status: 'ok' })),
};

export { api };
export default api;
