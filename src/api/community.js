import axios from "axios";
import { API_ENDPOINTS } from "../config/api.config";

/* ============================================================
   Axios Instance
   - Centralized configuration
   - Cookies enabled for authentication
   ============================================================ */
const communityAPI = axios.create({
  baseURL: API_ENDPOINTS.COMMUNITY.BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ========================== GROUPS ========================== */

/**
 * Fetch all community groups
 */
export const getGroups = async () => {
  try {
    const res = await communityAPI.get("/groups");
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return { ok: false, error: "Unable to load groups" };
  }
};

/**
 * Join a community group
 */
export const joinGroup = async (groupId, userId) => {
  try {
    await communityAPI.post("/join", { groupId, userId });
    return { ok: true };
  } catch (error) {
    console.error("Failed to join group:", error);
    return { ok: false, error: "Unable to join group" };
  }
};

/**
 * Leave a community group
 */
export const leaveGroup = async (groupId, userId) => {
  try {
    await communityAPI.post("/leave", { groupId, userId });
    return { ok: true };
  } catch (error) {
    console.error("Failed to leave group:", error);
    return { ok: false, error: "Unable to leave group" };
  }
};

/* ========================= MESSAGES ========================= */

/**
 * Fetch messages of a specific group
 */
export const getGroupMessages = async (groupId) => {
  try {
    const res = await communityAPI.get(`/messages/${groupId}`);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { ok: false, error: "Unable to load messages" };
  }
};

/**
 * Send a message to a group
 */
export const sendGroupMessage = async (groupId, messageData) => {
  try {
    await communityAPI.post(`/messages/${groupId}`, messageData);
    return { ok: true };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { ok: false, error: "Message sending failed" };
  }
};
