import axios from 'axios';

// 1. Initialize Axios with base configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// 2. REQUEST INTERCEPTOR: Automatically attach the JWT token to every outgoing request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 3. RESPONSE INTERCEPTOR: Handle global errors (like expired sessions)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server sends 401 Unauthorized, the token is likely expired
    if (error.response && error.response.status === 401) {
      alert("Your session has expired. Please log in again.");
      localStorage.clear(); // Clear token and username
      window.location.href = '/'; // Redirect to Login page
    }
    return Promise.reject(error);
  }
);

// --- API ENDPOINTS ---

// AUTHENTICATION
export const loginUser = (data) => API.post('/auth/login', data);
export const signupUser = (data) => API.post('/auth/signup', data);

// ACTIVITIES (Tasks)
export const fetchActivities = (page = 1, limit = 20) =>
  API.get(`/activities?page=${page}&limit=${limit}`);

export const createActivity = (formData) => API.post('/activities', formData, {
  headers: { 'Content-Type': 'multipart/form-data' } // Necessary for file uploads
});

export const updateActivity = (id, formData) => API.put(`/activities/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteActivity = (id) => API.delete(`/activities/${id}`);

export default API;