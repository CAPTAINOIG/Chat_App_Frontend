import axiosInstance from "../../utils/AxiosInstance";

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE = "/api/user";

const ENDPOINTS = {
  // Authentication
  SIGNUP: `${API_BASE}/signup`,
  SIGNIN: `${API_BASE}/signin`,
  DASHBOARD: `${API_BASE}/dashboard`,
  GOOGLE_AUTH: `${API_BASE}/googleAuth`,
  
  // Messages
  GET_MESSAGE: `${API_BASE}/getMessage`,
  DELETE_MESSAGE: `${API_BASE}/deleteMessage`,
  
  // Message Actions
  PIN_MESSAGE: `${API_BASE}/pinMessage`,
  UNPIN_MESSAGE: `${API_BASE}/unpinMessage`,
  GET_PIN_MESSAGE: `${API_BASE}/getPinMessage`,
  
  // Profile Management
  PROFILE_PICTURE: `${API_BASE}/profilePicture`,
  FETCH_PICTURE: `${API_BASE}/fetchPicture`,
  UPDATE_PROFILE: `${API_BASE}/updateProfile`,
  GET_UPDATE_PROFILE: `${API_BASE}/getUpdateProfile`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION APIs
// ═══════════════════════════════════════════════════════════════════════════════

export const signUp = async (user) => {
  const response = await axiosInstance.post(ENDPOINTS.SIGNUP, user);
  return response.data;
};

export const signIn = async (user) => {
  const response = await axiosInstance.post(ENDPOINTS.SIGNIN, user);
  return response.data;
};

export const dashboard = async () => {
  const response = await axiosInstance.get(ENDPOINTS.DASHBOARD);
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get(`${API_BASE}/getUsers`);
  return response.data;
};

export const googleAuth = async (googleToken) => {
  const response = await axiosInstance.post(ENDPOINTS.GOOGLE_AUTH, { googleToken });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💬 MESSAGE APIs
// ═══════════════════════════════════════════════════════════════════════════════

export const getMessage = async (userId, senderId, pagination = {}) => {
  const params = new URLSearchParams({
    userId,
    receiverId: senderId,
    ...pagination
  });
  const response = await axiosInstance.get(`${ENDPOINTS.GET_MESSAGE}?${params}`);
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axiosInstance.delete(`${ENDPOINTS.DELETE_MESSAGE}/${messageId}`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📌 MESSAGE ACTIONS APIs
// ═══════════════════════════════════════════════════════════════════════════════

export const pinMessage = async (messageId, senderId, receiverId) => {
  console.log("=== PIN MESSAGE API CALL ===");
  console.log("API Parameters:", { messageId, senderId, receiverId });
  
  const payload = {
    messageId,
    senderId,
    receiverId,
  };
  const response = await axiosInstance.post(ENDPOINTS.PIN_MESSAGE, payload);
  return response.data;
};

export const unpinMessage = async (messageId, senderId, receiverId) => {
  const payload = {
    messageId,
    senderId,
    receiverId,
  };
  const response = await axiosInstance.post(ENDPOINTS.UNPIN_MESSAGE, payload);
  return response.data;
};

export const getPinnedMessages = async (userId, receiverId) => {
  const response = await axiosInstance.get(ENDPOINTS.GET_PIN_MESSAGE, {
    params: { userId, receiverId },
  });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 👤 PROFILE APIs
// ═══════════════════════════════════════════════════════════════════════════════

export const uploadProfilePicture = async (userId, base64) => {
  const response = await axiosInstance.post(ENDPOINTS.PROFILE_PICTURE, {
    userId,
    base64,
  });
  return response.data;
};

export const fetchProfilePicture = async (userId) => {
  const response = await axiosInstance.get(ENDPOINTS.FETCH_PICTURE, {
    params: { userId },
  });
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await axiosInstance.put(`${ENDPOINTS.UPDATE_PROFILE}/${userId}`, profileData);
  return response.data;
};

export const getProfileData = async (userId) => {
  const response = await axiosInstance.get(ENDPOINTS.GET_UPDATE_PROFILE, {
    params: { userId },
  });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Helper function to handle API errors consistently
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    switch (status) {
      case 400:
        return message || "Invalid request data";
      case 401:
        return message || "You're not authorized. Please sign in again.";
      case 403:
        return message || "You don't have permission to perform this action";
      case 404:
        return message || "Resource not found";
      case 413:
        return message || "File is too large";
      case 500:
        return message || "Server error. Please try again later.";
      default:
        return message || `Request failed with status ${status}`;
    }
  } else if (error.request) {
    return "Network error. Please check your connection.";
  } else {
    return defaultMessage;
  }
};

// Helper function to validate file uploads
export const validateImageFile = (file) => {
  // 5MB
  const maxSize = 5 * 1024 * 1024; 
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
  }
  
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 5MB");
  }
  
  return true;
};

// Helper function to convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORT ENDPOINTS (for external use if needed)
// ═══════════════════════════════════════════════════════════════════════════════

export { ENDPOINTS };

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 API SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

/*
AUTHENTICATION:
- signUp(user)
- signIn(user) 
- dashboard()
- googleAuth(googleToken)

MESSAGES:
- getMessage(userId, senderId, pagination?)
- deleteMessage(messageId)
- getUnreadCount()
- markMessagesAsRead(senderId)

MESSAGE ACTIONS:
- pinMessage(messageId, senderId, receiverId)
- unpinMessage(messageId, senderId, receiverId)
- getPinnedMessages(userId, receiverId)

PROFILE:
- uploadProfilePicture(userId, base64)
- fetchProfilePicture(userId)
- updateProfile(userId, profileData)
- getProfileData(userId)

UTILITIES:
- handleApiError(error, defaultMessage?)
- validateImageFile(file)
- fileToBase64(file)
*/