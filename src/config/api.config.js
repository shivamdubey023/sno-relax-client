// Centralized API Configuration
const API_BASE = process.env.REACT_APP_API_BASE?.split(",")[0]?.trim() || "http://localhost:10000";
const API_BASES = process.env.REACT_APP_API_BASE?.split(",").map(u => u.trim()) || ["http://localhost:10000"];

const preferredUrl = API_BASES.find(url => url.includes("192.168.") || url.includes("10.") || url.includes("172."));
export const SOCKET_URL = preferredUrl || API_BASE;

export { API_BASE, API_BASES };

export const API_ENDPOINTS = {
  AUTH: {
    CREATE_USER: `${API_BASE}/api/auth/create-user`,
    LOGIN: `${API_BASE}/api/auth/login`,
  },
  CHAT: {
    SEND_MESSAGE: `${API_BASE}/api/chat`,
    GET_HISTORY: `${API_BASE}/api/chat/history`,
  },
  COMMUNITY: {
    GET_GROUPS: `${API_BASE}/api/community/groups`,
    CREATE_GROUP: `${API_BASE}/api/community/group`,
    GET_GROUP_MESSAGES: (id) => `${API_BASE}/api/community/group/${id}/messages`,
    POST_GROUP_MESSAGE: (id) => `${API_BASE}/api/community/group/${id}/message`,
    GET_GROUP_MEMBERS: (id) => `${API_BASE}/api/community/group/${id}/members`,
    JOIN_GROUP: (id) => `${API_BASE}/api/community/group/${id}/join`,
    LEAVE_GROUP: (id) => `${API_BASE}/api/community/group/${id}/leave`,
  },
  MOODS: {
    GET_MOODS: `${API_BASE}/api/moods`,
    ADD_MOOD: `${API_BASE}/api/moods`,
  },
};

export default API_BASE;