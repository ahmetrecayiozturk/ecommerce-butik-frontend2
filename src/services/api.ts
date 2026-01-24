import axios from 'axios';

// Backend URL'i (application.properties'deki port ile aynı olmalı)
const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Her isteğe varsa Token'ı ekle
api.interceptors.request.use(
  (config) => {
    // Tarayıcı tarafında çalışıyorsak token'ı al
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Token süresi dolmuşsa (401) kullanıcıyı logout yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // İsteğe bağlı: window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;