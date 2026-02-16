import { apiClient } from '../../config/apiConfig';

export const registerDriverApi = (driverData) => apiClient.post('/driver/register', driverData);
export const fetchAllDriversApi = () => apiClient.get('/driver/all');
export const fetchDriverRidesApi = () => apiClient.get('/driver/rides');
