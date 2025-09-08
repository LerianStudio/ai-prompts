const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  tasks: `${API_BASE_URL}/api/tasks`,
  websocket: `${API_BASE_URL.replace('http', 'ws')}`
};