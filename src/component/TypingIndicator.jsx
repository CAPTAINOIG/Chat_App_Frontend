import React from 'react';

const TypingIndicator = ({ isTyping, typingUser, users }) => {
  if (!isTyping || !typingUser) {
    return null;
  }

  const typingUsername = users.find(u => u._id === typingUser)?.username;

  return (
    <div className="absolute top-24 right-10 z-50 bg-surface-800 border border-surface-700 px-4 py-2 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-accent-400 flex items-center gap-2">
        <span>{typingUsername} is typing</span>
        <span className="flex gap-1">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </span>
      </p>
    </div>
  );
};

export default TypingIndicator;