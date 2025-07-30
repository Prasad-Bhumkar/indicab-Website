import axios from 'axios';

export const loginApi = (credentials) => axios.post('/api/auth/login', credentials);
export const registerApi = (userData) => axios.post('/api/auth/register', userData);
export const fetchProfileApi = () => axios.get('/api/profile');
export const updateProfileApi = (profileData) => axios.put('/api/profile', profileData);
