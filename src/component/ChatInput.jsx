import EmojiPicker from 'emoji-picker-react';
import React from 'react'

const ChatInput = ({
    handleSubmit,
    toggleEmojiPicker,
    showEmojiPicker,
    handleEmojiClick,
    message,
    setMessage,
    handleTyping,
    handleStopTyping,
    replyMessage,
    setReplyMessage,
}) => (
    <form
        className="p-4 bg-gray-500 border-t z-20 border-gray-300 fixed w-full -bottom-1"
        onSubmit={handleSubmit}
    >
        <div className="flex items-center">
            <button type="button" onClick={toggleEmojiPicker} className="mr-2 text-2xl">
                😊
            </button>

            <div className="w-full p-2 border border-gray-300 rounded">
                {replyMessage && (
                    <div className="reply-indicator text-white p-2 bg-blue-500 rounded mb-2 flex lg:gap-[64%] items-center cursor-pointer">
                        <p>Replying to: {replyMessage}</p>
                        <button
                            type="button"
                            onClick={() => setReplyMessage('')}
                            className="text-white hover:text-red-500 rounded-full px-2 cursor-pointer"
                        >
                            ✖
                        </button>
                    </div>
                )}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    onBlur={handleStopTyping}
                    placeholder="Type a message"
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>
        </div>
        <div className='absolute bottom-[100%] left-4 z-30 '>
            {showEmojiPicker && (
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
        </div>

        <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Send
        </button>
    </form>
);


export default ChatInput