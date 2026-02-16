import { apiClient } from '../../config/apiConfig';

export const loginApi = (credentials) => apiClient.post('/v1/auth/login', credentials);
export const registerApi = (userData) => apiClient.post('/v1/auth/register', userData);
export const fetchProfileApi = () => apiClient.get('/v1/profile');
export const updateProfileApi = (profileData) => apiClient.put('/v1/profile', profileData);
