import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        
        return Promise.reject({ message, status: error.response?.status });
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updateTargets: (data) => api.put('/auth/targets', data),
    calculateTargets: () => api.post('/auth/calculate-targets')
};

// Food API
export const foodAPI = {
    search: (query, source = 'all') => api.get(`/foods/search?q=${encodeURIComponent(query)}&source=${source}`),
    getByBarcode: (code) => api.get(`/foods/barcode/${code}`),
    getById: (id) => api.get(`/foods/${id}`),
    getPopular: () => api.get('/foods/popular'),
    getMyFoods: () => api.get('/foods/my-foods'),
    create: (data) => api.post('/foods', data),
    update: (id, data) => api.put(`/foods/${id}`, data),
    delete: (id) => api.delete(`/foods/${id}`)
};

// Meal API
export const mealAPI = {
    create: (data) => api.post('/meals', data),
    getByDate: (date) => api.get(`/meals?date=${date || ''}`),
    getByDateRange: (start, end) => api.get(`/meals/range?start=${start}&end=${end}`),
    getById: (id) => api.get(`/meals/${id}`),
    update: (id, data) => api.put(`/meals/${id}`, data),
    delete: (id) => api.delete(`/meals/${id}`),
    addFood: (mealId, food, servings) => api.post(`/meals/${mealId}/foods`, { food, servings }),
    removeFood: (mealId, foodIndex) => api.delete(`/meals/${mealId}/foods/${foodIndex}`)
};

// Dashboard API
export const dashboardAPI = {
    getDaily: (date) => api.get(`/dashboard/daily${date ? `?date=${date}` : ''}`),
    getWeekly: () => api.get('/dashboard/weekly'),
    getMonthly: () => api.get('/dashboard/monthly'),
    getInsights: () => api.get('/dashboard/insights'),
    getSchoolStats: () => api.get('/dashboard/school-stats'),
    logWeight: (data) => api.post('/dashboard/weight', data)
};

// AI API
export const aiAPI = {
    analyzeMeal: (mealId) => api.post(`/ai/analyze-meal/${mealId}`),
    getRecommendations: (mealType) => api.get(`/ai/recommendations?mealType=${mealType}`),
    chat: (message) => api.post('/ai/chat', { message }),
    getDailyTip: () => api.get('/ai/daily-tip'),
    analyzeFood: (description) => api.post('/ai/analyze-food', { description }),
    analyzeImage: (formData) => api.post('/ai/analyze-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// Child API
export const childAPI = {
    getAll: () => api.get('/children'),
    getById: (id) => api.get(`/children/${id}`),
    create: (data) => api.post('/children', data),
    update: (id, data) => api.put(`/children/${id}`, data),
    delete: (id) => api.delete(`/children/${id}`),
    addMeasurement: (id, data) => api.post(`/children/${id}/measurements`, data)
};

export default api;
