

const PinnedMessages = ({ pinnedMessage, setPinnedMessage, scrollToMessage, isDropdown = false }) => {
  if (!pinnedMessage || pinnedMessage.length === 0) {
    return null;
  }

  const handleMessageClick = (messageId) => {
    if (scrollToMessage) {
      scrollToMessage(messageId);
    }
  };

  const containerClass = isDropdown 
    ? "p-4" 
    : "absolute w-full top-[13%] z-20 bg-surface-800/95 backdrop-blur-sm border-b border-surface-700 shadow-md px-5 py-3";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-primary-400 font-semibold text-sm">
            Pinned Messages ({pinnedMessage.length})
          </h4>
          <button
            onClick={() => setPinnedMessage([])}
            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
        
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {pinnedMessage.map((pinnedMsg) => (
            <div
              key={pinnedMsg._id}
              className="p-3 bg-surface-900/50 hover:bg-surface-900/70 rounded-lg cursor-pointer transition-colors group"
              onClick={() => handleMessageClick(pinnedMsg.messageId || pinnedMsg._id)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm text-surface-200 group-hover:text-surface-100 transition-colors line-clamp-2">
                  {pinnedMsg.content}
                </span>
                <span className="text-xs text-surface-400">
                  {pinnedMsg.timestamp
                    ? new Date(pinnedMsg.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Unknown time'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedMessages;