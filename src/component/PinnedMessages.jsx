import React from 'react';

const PinnedMessages = ({ pinnedMessage, setPinnedMessage, userId }) => {
  if (!pinnedMessage || pinnedMessage.length === 0) {
    return null;
  }

  return (
    <div className="absolute w-full top-[13%] z-20 bg-surface-800/95 backdrop-blur-sm border-b border-surface-700 flex flex-col gap-2 px-5 py-3 shadow-md">
      <button
        onClick={() => setPinnedMessage([])}
        className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors self-start"
      >
        Clear Pinned Messages
      </button>
      {pinnedMessage.map((pinnedMsg) => (
        <div
          key={pinnedMsg._id}
          className="flex gap-5 p-2 items-center bg-surface-900 rounded-lg"
        >
          <div className="flex gap-5 text-sm font-medium text-surface-200">
            <span className="text-sm">{pinnedMsg.content}</span>
            <span className="text-xs text-surface-400">
              {pinnedMsg.timestamp
                ? new Date(pinnedMsg.timestamp).toLocaleTimeString()
                : null}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PinnedMessages;