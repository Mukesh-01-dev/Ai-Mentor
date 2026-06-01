import toast from 'react-hot-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    toast.error('Session expired. Please login again.');
setTimeout(() => {
  window.location.href = '/login';
}, 2000);
    return null;
  }
  return response;
};
export default API_BASE_URL;