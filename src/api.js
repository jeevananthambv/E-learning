// API Configuration and Helper Functions
const API_BASE_URL = 'http://localhost:5000/api';

// Token management
export const getToken = () => localStorage.getItem('adminToken');
export const setToken = (token) => localStorage.setItem('adminToken', token);
export const removeToken = () => localStorage.removeItem('adminToken');

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        ...options.headers
    };

    // Don't set Content-Type for FormData (multipart/form-data)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (response.success && response.data.token) {
            setToken(response.data.token);
        }
        return response;
    },

    register: async (email, password, name) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },

    verify: async () => {
        return apiCall('/auth/verify');
    },

    logout: () => {
        removeToken();
    }
};

// Videos API
export const videosAPI = {
    getAll: async (subject = null) => {
        const query = subject && subject !== 'All' ? `?subject=${subject}` : '';
        return apiCall(`/videos${query}`);
    },

    getOne: async (id) => {
        return apiCall(`/videos/${id}`);
    },

    create: async (videoData) => {
        return apiCall('/videos', {
            method: 'POST',
            body: JSON.stringify(videoData)
        });
    },

    update: async (id, videoData) => {
        return apiCall(`/videos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(videoData)
        });
    },

    delete: async (id) => {
        return apiCall(`/videos/${id}`, {
            method: 'DELETE'
        });
    }
};

// Materials API
export const materialsAPI = {
    getAll: async (category = null, type = null) => {
        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (type && type !== 'All') params.append('type', type);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiCall(`/materials${query}`);
    },

    getOne: async (id) => {
        return apiCall(`/materials/${id}`);
    },

    create: async (formData) => {
        return apiCall('/materials', {
            method: 'POST',
            body: formData
        });
    },

    update: async (id, formData) => {
        return apiCall(`/materials/${id}`, {
            method: 'PUT',
            body: formData
        });
    },

    delete: async (id) => {
        return apiCall(`/materials/${id}`, {
            method: 'DELETE'
        });
    },

    getDownloadUrl: (id) => {
        return `${API_BASE_URL}/materials/download/${id}`;
    }
};

// Contact API
export const contactAPI = {
    submit: async (formData) => {
        return apiCall('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    },

    getAll: async () => {
        return apiCall('/contact');
    },

    markAsRead: async (id) => {
        return apiCall(`/contact/${id}/read`, {
            method: 'PUT'
        });
    },

    delete: async (id) => {
        return apiCall(`/contact/${id}`, {
            method: 'DELETE'
        });
    }
};

// Stats API
export const statsAPI = {
    getAdmin: async () => {
        return apiCall('/stats');
    },

    getPublic: async () => {
        return apiCall('/stats/public');
    }
};

// Health check
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
};

export default {
    auth: authAPI,
    videos: videosAPI,
    materials: materialsAPI,
    contact: contactAPI,
    stats: statsAPI,
    checkHealth
};
