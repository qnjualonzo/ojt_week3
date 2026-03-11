import axios from 'axios';

const API_URL = 'http://localhost:5000/api/activities';

export const fetchActivities = () => axios.get(API_URL);
export const createActivity = (formData) => axios.post(API_URL, formData);
export const updateActivity = (id, formData) => axios.put(`${API_URL}/${id}`, formData);
export const deleteActivity = (id) => axios.delete(`${API_URL}/${id}`);