export const API_BASE = process.env.REACT_APP_API_BASE?.split(",")[0]?.trim() || "http://localhost:10000";
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL?.split(",")[0]?.trim() || "http://localhost:10000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/api/auth/login`,
    REGISTER: `${API_BASE}/api/auth/create-user`,
    LOGOUT: `${API_BASE}/api/auth/logout`,
  },
  USER: {
    PROFILE: `${API_BASE}/api/user/profile`,
    UPDATE: `${API_BASE}/api/user/update`,
  },
  MOOD: {
    GET: `${API_BASE}/api/mood`,
    POST: `${API_BASE}/api/mood`,
  },
  COMMUNITY: {
    GET_GROUPS: `${API_BASE}/api/community/groups`,
    CREATE_GROUP: `${API_BASE}/api/community/groups`,
    GET_GROUP_MESSAGES: (groupId) => `${API_BASE}/api/community/groups/${groupId}/messages`,
    POST_GROUP_MESSAGE: (groupId) => `${API_BASE}/api/community/groups/${groupId}/messages`,
    GET_GROUP_MEMBERS: (groupId) => `${API_BASE}/api/community/groups/${groupId}/members`,
    JOIN_GROUP: (groupId) => `${API_BASE}/api/community/groups/${groupId}/join`,
    LEAVE_GROUP: (groupId) => `${API_BASE}/api/community/groups/${groupId}/leave`,
  },
  CHATBOT: {
    SEND: `${API_BASE}/api/chatbot/send`,
    HISTORY: `${API_BASE}/api/chatbot/history`,
  },
  LOCATION: {
    REVERSE: `${API_BASE}/api/location`,
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_ID: "sno_userId",
  FIRST_NAME: "sno_firstName",
  LAST_NAME: "sno_lastName",
  EMAIL: "sno_email",
  PHONE: "sno_phone",
  CITY: "sno_city",
  LATITUDE: "sno_lat",
  LONGITUDE: "sno_lon",
  AVATAR: "sno_avatar",
  EMERGENCY: "sno_emergency",
  DOB: "sno_dob",
  HISTORY: "sno_history",
  COMMUNITY_NICKNAME: "communityNickname",
  CHAT_THEME: "chatTheme",
  THEME_MODE: "themeMode",
  ADMIN_POPUP_CONTENT: "admin_popup_content",
  ADMIN_POPUP_VERSION: "admin_popup_version",
  ADMIN_POPUP_DISMISSED: "admin_popup_dismissed_version",
};

export const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "hi", label: "Hindi", flag: "HI" },
  { code: "es", label: "Spanish", flag: "ES" },
  { code: "fr", label: "French", flag: "FR" },
];

export const CHAT_THEMES = [
  { id: "default", name: "Classic", color: "#e4ddd5" },
  { id: "dark", name: "Dark", color: "#0b1418" },
  { id: "blue", name: "Blue", color: "#d2dbdf" },
  { id: "teal", name: "Teal", color: "#d5e8e8" },
  { id: "pink", name: "Pink", color: "#fce4ec" },
  { id: "purple", name: "Purple", color: "#ede7f6" },
  { id: "ocean", name: "Ocean", color: "#e0f7fa" },
  { id: "sunset", name: "Sunset", color: "#fff3e0" },
  { id: "forest", name: "Forest", color: "#e8f5e9" },
  { id: "none", name: "Solid", color: "transparent" },
];

export const DEBOUNCE_MS = 300;
export const POLL_INTERVAL_MS = 5000;
export const AUTO_SCROLL_THRESHOLD = 200;