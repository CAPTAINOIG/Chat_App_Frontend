import EmojiPicker from "emoji-picker-react";
import React, { useRef, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

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
  sendVoiceMessage,
  receiverId,
}) => {
  
  const typingTimeoutRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [isSendingVoice, setIsSendingVoice] = useState(false);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder) return;
    
    clearInterval(recordingTimer);
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      setIsSendingVoice(true);
      try {
        await sendVoiceMessage(audioBlob, recordingTime, receiverId, replyMessage);
      } catch (error) {
        console.error("Error sending voice note:", error);
      } finally {
        setIsSendingVoice(false);
        setIsRecording(false);
        setRecordingTime(0);
        setAudioChunks([]);
        setMediaRecorder(null);
      
        // Stop all tracks in the stream
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.stop();
  };

  const cancelRecording = () => {
    if (!mediaRecorder) return;
    
    clearInterval(recordingTimer);
    
    mediaRecorder.onstop = () => {
      setIsRecording(false);
      setRecordingTime(0);
      setAudioChunks([]);
      setMediaRecorder(null);
      
      // Stop all tracks in the stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.stop();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Generate fake waveform bars
  const waveformBars = Array.from({ length: 20 }, (_, i) => {
    const height = Math.max(10, Math.random() * 40);
    return { id: i, height };
  });

  return (
    <form
      className="p-4 bg-surface-800 border-t border-surface-700 fixed w-full -bottom-1 shadow-lg"
      onSubmit={handleSubmit}
    >
      {isRecording ? (
        <div className="flex items-center justify-between gap-4 bg-surface-900 rounded-lg p-4 border border-surface-700">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={cancelRecording}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-700 hover:bg-surface-600 text-white transition-all"
            title="Cancel"
          >
            <FaTrash className="w-6 h-6" />
          </button>

          {/* Recording Indicator and Timer */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-lg font-medium">{formatTime(recordingTime)}</span>
            
            {/* Waveform Animation */}
            <div className="flex items-center gap-1 ml-4">
              {waveformBars.map((bar) => (
                <div
                  key={bar.id}
                  className="w-1 bg-white/70 rounded-full"
                  style={{
                    height: `${bar.height}px`,
                    animation: isRecording ? 'wave 0.5s ease-in-out infinite' : 'none',
                    animationDelay: `${bar.id * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={stopRecording}
            disabled={isSendingVoice}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-500 text-white transition-all disabled:opacity-50"
          >
            {isSendingVoice ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      ) : (
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
            type="button"
            onClick={startRecording}
            disabled={isSending}
            className="px-4 py-3 rounded-lg font-semibold shadow-card transition-all duration-200 bg-surface-600 text-white hover:bg-surface-500 disabled:opacity-50"
            title="Record voice note"
          >
            🎤
          </button>
          
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
      )}

      <div className="absolute bottom-[100%] left-4 z-30">
        {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
      </div>
      
      {/* Add waveform animation styles */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </form>
  );
};

export default ChatInput;
