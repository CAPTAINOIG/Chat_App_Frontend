// Socket.io event names
export const SOCKET_EVENTS = {
  // Emit events
  USER_ONLINE: "user-online",
  GET_USERS: "getUsers",
  CHAT_MESSAGE: "chat message",
  TYPING: "typing",
  STOP_TYPING: "stopTyping",
  DELETE_MESSAGE: "deleteMessage",

  // Call events - Emit
  CALL_INITIATE: "call:initiate",
  CALL_ACCEPT: "call:accept",
  CALL_REJECT: "call:reject",
  CALL_END: "call:end",
  CALL_STATUS: "call:status",
  WEBRTC_OFFER: "webrtc:offer",
  WEBRTC_ANSWER: "webrtc:answer",
  WEBRTC_ICE_CANDIDATE: "webrtc:ice-candidate",
  
  // Listen events
  RECEIVE_MESSAGE: "receiveMessage",
  NEW_MESSAGE: "newMessage", 
  UPDATE_ONLINE_USERS: "update-online-users",
  MESSAGE_DELETED: "messageDeleted",

  // Call events - Listen
  CALL_INCOMING: "call:incoming",
  CALL_INITIATED: "call:initiated",
  CALL_ACCEPTED: "call:accepted",
  CALL_REJECTED: "call:rejected",
  CALL_ENDED: "call:ended",
  CALL_ERROR: "call:error",
  CALL_MISSED: "call:missed",
  WEBRTC_ERROR: "webrtc:error",
};

// Message action types
export const MESSAGE_ACTIONS = {
  REPLY: "Reply",
  COPY: "Copy",
  DELETE: "Delete",
  FORWARD: "Forward",
  PIN: "Pin",
  UNPIN: "Unpin",
  STAR: "Star",
  UNSTAR: "Unstar",
};
