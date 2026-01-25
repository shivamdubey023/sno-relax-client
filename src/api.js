// src/api.js
import { API_ENDPOINTS, API_BASE, SOCKET_URL } from "./config/api.config";
import { io } from "socket.io-client";

/* ============================================================
   Generic API Request Helper
   - Reduces repetition
   - Centralized error handling
   ============================================================ */
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // required for cookies / sessions
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/* ========================== AUTH ========================== */

/**
 * Create a new user account
 */
export const createUser = (data) =>
  apiRequest(API_ENDPOINTS.AUTH.CREATE_USER, {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Login user using userId
 */
export const login = (userId) =>
  apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });

/* ========================== CHAT ========================== */

/**
 * Send message to AI chatbot
 */
export const chat = (message, userId, lang = "en", persona = "snobot") =>
  apiRequest(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
    method: "POST",
    body: JSON.stringify({ message, userId, lang, persona }),
  });

/**
 * Fetch chat history of a user
 */
export const getChatHistory = (userId) =>
  apiRequest(`${API_ENDPOINTS.CHAT.GET_HISTORY}?userId=${userId}`, {
    method: "GET",
  });

/* ==================== COMMUNITY - GROUPS ==================== */

/**
 * Fetch all community groups
 */
export const getGroups = () =>
  apiRequest(API_ENDPOINTS.COMMUNITY.GET_GROUPS);

/**
 * Create a new group
 */
export const createGroup = (data) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.CREATE_GROUP, {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Delete a group
 */
export const deleteGroup = (groupId) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.DELETE_GROUP(groupId), {
    method: "DELETE",
  });

/**
 * Fetch messages of a group
 */
export const getGroupMessages = (groupId) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.GET_GROUP_MESSAGES(groupId));

/**
 * Post a message in group chat
 */
export const postGroupMessage = (groupId, data) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.POST_GROUP_MESSAGE(groupId), {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Join a group
 */
export const joinGroup = (groupId, userId, nickname) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.JOIN_GROUP(groupId), {
    method: "POST",
    body: JSON.stringify({ userId, nickname }),
  });

/**
 * Leave a group
 */
export const leaveGroup = (groupId, userId) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.LEAVE_GROUP(groupId), {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });

/**
 * Delete a group message
 */
export const deleteMessage = (messageId, userId) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.DELETE_MESSAGE(messageId), {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });

/**
 * Update user nickname
 */
export const updateNickname = (userId, nickname) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.UPDATE_NICKNAME(userId), {
    method: "PUT",
    body: JSON.stringify({ nickname }),
  });

/**
 * Fetch user nickname
 */
export const getNickname = (userId) =>
  apiRequest(API_ENDPOINTS.COMMUNITY.GET_NICKNAME(userId));

/* ========================== MOODS ========================== */

/**
 * Fetch mood history
 */
export const getMoods = (userId) =>
  apiRequest(`${API_ENDPOINTS.MOODS.GET_MOODS}?userId=${userId}`);

/**
 * Add a new mood entry
 */
export const addMood = (userId, mood, notes = "") =>
  apiRequest(API_ENDPOINTS.MOODS.ADD_MOOD, {
    method: "POST",
    body: JSON.stringify({ userId, mood, notes }),
  });

/* ======================== SOCKET.IO ======================== */

/**
 * Create socket connection for real-time features
 */
export const createSocket = () =>
  io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

/* ========================== EXPORT ========================= */

export default {
  createUser,
  login,
  chat,
  getChatHistory,
  getGroups,
  createGroup,
  deleteGroup,
  getGroupMessages,
  postGroupMessage,
  joinGroup,
  leaveGroup,
  deleteMessage,
  updateNickname,
  getNickname,
  getMoods,
  addMood,
  createSocket,
  API_BASE,
};
