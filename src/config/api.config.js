// Centralized API Configuration
// This file defines all API endpoints used throughout the app

const getApiBase = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
  }
  return process.env.REACT_APP_API_BASE || "http://localhost:5000";
};

export const API_BASE = getApiBase();

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    CREATE_USER: `${API_BASE}/api/auth/create-user`,
    LOGIN: `${API_BASE}/api/auth/login`,
  },

  // ==================== CHAT ====================
  CHAT: {
    SEND_MESSAGE: `${API_BASE}/api/chat`,
    GET_HISTORY: `${API_BASE}/api/chat/history`,
  },

  // ==================== COMMUNITY ====================
  COMMUNITY: {
    GET_GROUPS: `${API_BASE}/api/community/groups`,
    CREATE_GROUP: `${API_BASE}/api/community/group`,
    DELETE_GROUP: (id) => `${API_BASE}/api/community/group/${id}`,
    GET_GROUP_MESSAGES: (groupId) => `${API_BASE}/api/community/group/${groupId}/messages`,
    POST_GROUP_MESSAGE: (groupId) => `${API_BASE}/api/community/group/${groupId}/message`,
    GET_GROUP_MEMBERS: (groupId) => `${API_BASE}/api/community/group/${groupId}/members`,
    JOIN_GROUP: (groupId) => `${API_BASE}/api/community/group/${groupId}/join`,
    LEAVE_GROUP: (groupId) => `${API_BASE}/api/community/group/${groupId}/leave`,
    UPDATE_MEMBER_NICKNAME: (groupId) => `${API_BASE}/api/community/group/${groupId}/member/nickname`,
    DELETE_MESSAGE: (messageId) => `${API_BASE}/api/community/message/${messageId}`,
    EDIT_MESSAGE: (messageId) => `${API_BASE}/api/community/message/${messageId}`,
    UPDATE_NICKNAME: (userId) => `${API_BASE}/api/community/user/${userId}/nickname`,
    GET_NICKNAME: (userId) => `${API_BASE}/api/community/user/${userId}/nickname`,
    GET_ANNOUNCEMENTS: `${API_BASE}/api/community/announcements`,
    CREATE_ANNOUNCEMENT: `${API_BASE}/api/community/announcement`,
    DELETE_ANNOUNCEMENT: (id) => `${API_BASE}/api/community/announcement/${id}`,
  },

  // ==================== MOODS ====================
  MOODS: {
    GET_MOODS: `${API_BASE}/api/moods`,
    ADD_MOOD: `${API_BASE}/api/moods`,
  },
};

// Socket.IO URL (same as API_BASE)
export const SOCKET_URL = API_BASE;

export default API_BASE;
