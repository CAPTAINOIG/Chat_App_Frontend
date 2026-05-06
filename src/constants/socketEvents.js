// Socket.io event names
export const SOCKET_EVENTS = {
  // Emit events
  USER_ONLINE: "user-online",
  GET_USERS: "getUsers",
  CHAT_MESSAGE: "chat message",
  TYPING: "typing",
  STOP_TYPING: "stopTyping",
  DELETE_MESSAGE: "deleteMessage",
  
  // Listen events
  RECEIVE_MESSAGE: "receiveMessage",
  NEW_MESSAGE: "newMessage", 
  UPDATE_ONLINE_USERS: "update-online-users",
  MESSAGE_DELETED: "messageDeleted",
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
