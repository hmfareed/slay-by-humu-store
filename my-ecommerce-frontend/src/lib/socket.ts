import { io, Socket } from 'socket.io-client';
import { API_URL } from './api';

// Extract base URL from API_URL (e.g. http://localhost:5000/api -> http://localhost:5000)
const BASE_URL = API_URL.replace('/api', '');

export const socket: Socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});
