import axios from 'axios';

export const registerDriverApi = (driverData) => axios.post('http://localhost:8000/api/driver/register', driverData);
export const fetchAllDriversApi = () => axios.get('http://localhost:8000/api/driver/all');
export const fetchDriverRidesApi = () => axios.get('http://localhost:8000/api/driver/rides');
