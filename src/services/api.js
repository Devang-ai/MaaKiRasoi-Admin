import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    changePassword: (data) => api.post('/auth/change-password', data),
};

export const restaurantAPI = {
    getAll: (status) => api.get(`/restaurants${status ? `?status=${status}` : ''}`),
    add: (data) => api.post('/restaurants', data),
    update: (id, data) => api.patch(`/restaurants/${id}`, data),
    updateStatus: (id, status) => api.patch(`/restaurants/${id}/status`, { status }),
    delete: (id) => api.delete(`/restaurants/${id}`),
};

export const menuAPI = {
    getByRestaurant: (restaurantId) => api.get(`/menu/${restaurantId}`),
    add: (data) => api.post('/menu', data),
    update: (id, data) => api.patch(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`),
};

export const userAPI = {
    getAll: () => api.get('/users'),
    getSubscriptions: () => api.get('/users/subscriptions'),
    add: (data) => api.post('/users', data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    updateSubscriptionStatus: (id, status) => api.patch(`/users/${id}/subscription/status`, { status }),
    deleteSubscription: (id) => api.delete(`/users/${id}/subscription`),
    delete: (id) => api.delete(`/users/${id}`),
};

export const riderAPI = {
    getAll: (status) => api.get(`/riders${status ? `?status=${status}` : ''}`),
    add: (data) => api.post('/riders', data),
    update: (id, data) => api.patch(`/riders/${id}`, data),
    updateStatus: (id, status) => api.patch(`/riders/${id}/status`, { status }),
    delete: (id) => api.delete(`/riders/${id}`),
};

export const orderAPI = {
    getAll: (status) => api.get(`/orders${status ? `?status=${status}` : ''}`),
    add: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    assignRider: (id, riderId, riderName) => api.patch(`/orders/${id}/assign-rider`, { riderId, riderName }),
};

export const complaintAPI = {
    getAll: (status) => api.get(`/complaints${status ? `?status=${status}` : ''}`),
    add: (data) => api.post('/complaints', data),
    update: (id, data) => api.patch(`/complaints/${id}`, data),
    delete: (id) => api.delete(`/complaints/${id}`),
};

export const chatAPI = {
    getAll: () => api.get('/chat/all'),
    reply: (userId, text) => api.post(`/chat/reply/${userId}`, { text }),
    endChat: (userId) => api.post(`/chat/end/${userId}`),
    getOrderChats: () => api.get('/chat/order-chats'),
    sendOrderMessage: (orderId, text) => api.post(`/chat/order-message/${orderId}`, { text })
};

export const partnerChatAPI = {
    getAll: () => api.get('/partner-chat/all'),
    reply: (partnerId, text) => api.post(`/partner-chat/reply/${partnerId}`, { text }),
};

export const riderChatAPI = {
    getAll: () => api.get('/rider-chat/all'),
    reply: (riderId, text) => api.post(`/rider-chat/reply/${riderId}`, { text }),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivity: () => api.get('/dashboard/activity'),
    getAnalytics: () => api.get('/dashboard/analytics'),
    getOnlineRiders: () => api.get('/riders/online')
};

export const mealPlanAPI = {
    getAll: () => api.get('/subscription-plans'),
    delete: (id) => api.delete(`/subscription-plans/${id}`)
};

export default api;
