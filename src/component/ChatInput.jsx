import EmojiPicker from "emoji-picker-react";
import React, { useRef } from "react";

const ChatInput = ({
  handleSubmit,
  toggleEmojiPicker,
  showEmojiPicker,
  handleEmojiClick,
  message,
  setMessage,
  emitTyping,
  emitStopTyping,
  replyMessage,
  setReplyMessage,
  isSending = false,
}) => {
  
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    emitTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2000);
  };

  return (
    <form
      className="p-4 bg-surface-800 border-t border-surface-700 fixed w-full -bottom-1 shadow-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleEmojiPicker}
          className="text-2xl hover:scale-110 transition-transform"
          title="Add emoji"
        >
          😊
        </button>

        <div className="w-full bg-surface-900 border border-surface-600 rounded-lg p-3 focus-within:border-primary-500 transition-colors">
          {replyMessage && (
            <div className="reply-indicator text-surface-50 p-2 bg-primary-600 rounded-lg mb-2 flex justify-between items-center">
              <p className="text-sm">Replying to: <span className="font-semibold">{replyMessage}</span></p>
              <button
                type="button"
                onClick={() => setReplyMessage("")}
                className="text-surface-200 hover:text-red-400 rounded-full px-2 cursor-pointer transition-colors"
              >
                ✖
              </button>
            </div>
          )}

          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="w-full bg-transparent text-surface-50 placeholder-surface-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className={`px-6 py-3 rounded-lg font-semibold shadow-card transition-all duration-200 flex items-center gap-2 ${
            isSending || !message.trim()
              ? 'bg-surface-600 text-surface-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-500'
          }`}
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
      <div className="absolute bottom-[100%] left-4 z-30">
        {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
      </div>
    </form>
  );
};

export default ChatInput;
