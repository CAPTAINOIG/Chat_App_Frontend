import { useState, useEffect } from 'react';
import { FaPhone, FaVideo } from 'react-icons/fa';
import callService from '../services/call.service';
import { toast } from 'sonner';

const CallButtons = ({ receiverId, receiverName, isOnline, accountOwner }) => {
  const [isCallServiceReady, setIsCallServiceReady] = useState(true);
  const [isInitiating, setIsInitiating] = useState(false);

  useEffect(() => {
    // Check if call service is ready (not already in a call)
    const checkCallStatus = () => {
      setIsCallServiceReady(!callService.isInCall());
    };
    
    checkCallStatus();
    
    // Listen for call status changes
    callService.on('callEnded', checkCallStatus);
    callService.on('callRejected', checkCallStatus);
    
    return () => {
      callService.off('callEnded', checkCallStatus);
      callService.off('callRejected', checkCallStatus);
    };
  }, []);

  const initiateVoiceCall = async () => {
    if (!isOnline) {
      toast.error('User is offline');
      return;
    }

    if (!isCallServiceReady) {
      toast.error('Already in a call');
      return;
    }

    setIsInitiating(true);
    try {
      console.log('📞 Initiating voice call to:', receiverId);
      await callService.initiateCall(receiverId, 'voice', {
        id: accountOwner._id,
        username: accountOwner.username,
        profilePicture: accountOwner.profilePicture
      });
      toast.success(`Voice call initiated to ${receiverName}`);
      setIsCallServiceReady(false);
    } catch (error) {
      console.error('Failed to start voice call:', error);
      toast.error('Failed to start call: ' + error.message);
    } finally {
      setIsInitiating(false);
    }
  };

  const initiateVideoCall = async () => {
    if (!isOnline) {
      toast.error('User is offline');
      return;
    }

    if (!isCallServiceReady) {
      toast.error('Already in a call');
      return;
    }

    setIsInitiating(true);
    try {
      console.log('📹 Initiating video call to:', receiverId);
      await callService.initiateCall(receiverId, 'video', {
        id: accountOwner._id,
        username: accountOwner.username,
        profilePicture: accountOwner.profilePicture
      });
      toast.success(`Video call initiated to ${receiverName}`);
      setIsCallServiceReady(false);
    } catch (error) {
      console.error('Failed to start video call:', error);
      toast.error('Failed to start video call: ' + error.message);
    } finally {
      setIsInitiating(false);
    }
  };

  const getButtonClass = (disabled) => `
    w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 shadow-md
    ${disabled 
      ? 'bg-surface-600 text-surface-400 cursor-not-allowed' 
      : 'bg-primary-600 hover:bg-primary-500 text-white hover:scale-105 active:scale-95'
    }
  `;

  const isDisabled = !isOnline || !isCallServiceReady || isInitiating;

  return (
    <div className="flex items-center gap-2">
      {/* Voice Call Button */}
      <button
        onClick={initiateVoiceCall}
        disabled={isDisabled}
        className={getButtonClass(isDisabled)}
        title={
          !isOnline ? 'User is offline' :
          !isCallServiceReady ? 'Already in a call' :
          `Voice call ${receiverName}`
        }
      >
        {isInitiating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaPhone />
        )}
      </button>

      {/* Video Call Button */}
      <button
        onClick={initiateVideoCall}
        disabled={isDisabled}
        className={getButtonClass(isDisabled)}
        title={
          !isOnline ? 'User is offline' :
          !isCallServiceReady ? 'Already in a call' :
          `Video call ${receiverName}`
        }
      >
        {isInitiating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaVideo />
        )}
      </button>

      {/* Status indicator */}
      {!isCallServiceReady && (
        <span className="text-xs text-surface-400 ml-1">In call</span>
      )}
    </div>
  );
};

export default CallButtons;