import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaPhoneSlash, FaSyncAlt } from 'react-icons/fa';
import callService from '../services/call.service';

const CallComponent = ({ currentUserId, username }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [connectionState, setConnectionState] = useState('new');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // Listen for incoming calls
    callService.on('incomingCall', handleIncomingCall);
    callService.on('callAccepted', handleCallAccepted);
    callService.on('callRejected', handleCallRejected);
    callService.on('callEnded', handleCallEnded);
    callService.on('callConnected', handleCallConnected);
    callService.on('localStream', handleLocalStream);
    callService.on('remoteStream', handleRemoteStream);
    callService.on('connectionState', handleConnectionState);

    return () => {
      // Cleanup listeners
      callService.off('incomingCall', handleIncomingCall);
      callService.off('callAccepted', handleCallAccepted);
      callService.off('callRejected', handleCallRejected);
      callService.off('callEnded', handleCallEnded);
      callService.off('callConnected', handleCallConnected);
      callService.off('localStream', handleLocalStream);
      callService.off('remoteStream', handleRemoteStream);
      callService.off('connectionState', handleConnectionState);
    };
  }, []);

  const handleIncomingCall = (call) => {
    console.log('📞 Incoming call received:', call);
    setIncomingCall(call);
    setCallStatus('ringing');
  };

  const handleCallAccepted = (data) => {
    console.log('✅ Call accepted:', data);
    setCallStatus('connecting');
    setActiveCall(data);
  };

  const handleCallRejected = () => {
    console.log('❌ Call rejected');
    setCallStatus('rejected');
    setTimeout(() => {
      setCallStatus('idle');
      setActiveCall(null);
      setIncomingCall(null);
    }, 2000);
  };

  const handleCallEnded = () => {
    console.log('📞 Call ended');
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setActiveCall(null);
      setIncomingCall(null);
    }, 2000);
  };

  const handleCallConnected = () => {
    console.log('🔗 Call connected');
    setCallStatus('connected');
  };

  const handleLocalStream = (stream) => {
    console.log('📹 Local stream received:', stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
    }
  };

  const handleRemoteStream = (stream) => {
    console.log('📡 Remote stream received:', stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = stream;
    }
  };

  const handleConnectionState = (state) => {
    console.log('🔗 Connection state changed:', state);
    setConnectionState(state);
  };

  // Call actions
  const acceptCall = async () => {
    try {
      console.log('✅ Accepting call:', incomingCall.callId);
      await callService.acceptCall(incomingCall.callId);
      setActiveCall(incomingCall);
      setIncomingCall(null);
      setCallStatus('connecting');
    } catch (error) {
      console.error('Failed to accept call:', error);
      alert('Failed to accept call: ' + error.message);
    }
  };

  const rejectCall = () => {
    console.log('❌ Rejecting call');
    callService.rejectCall(incomingCall.callId);
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    console.log('📞 Ending call');
    callService.endCall();
    setActiveCall(null);
    setCallStatus('idle');
  };

  const toggleMute = () => {
    const enabled = callService.toggleMicrophone();
    setIsMuted(!enabled);
  };

  const toggleCamera = () => {
    const enabled = callService.toggleCamera();
    setIsCameraOn(enabled);
  };

  const switchCamera = () => {
    callService.switchCamera();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing': return 'Incoming call...';
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'ended': return 'Call ended';
      case 'rejected': return 'Call rejected';
      default: return '';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected':
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Render incoming call modal
  if (incomingCall) {
    const isVideoCall = incomingCall.callType === 'video';
    
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface-800 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl border border-surface-700">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-surface-700 rounded-full flex items-center justify-center">
              <img 
                src={incomingCall.callerInfo?.profilePicture || '/default-avatar.png'} 
                alt="Caller"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-surface-50 mb-2">
              {incomingCall.callerInfo?.username || 'Unknown'}
            </h3>
            <p className="text-surface-300 flex items-center justify-center gap-2">
              {isVideoCall ? <FaVideo /> : <FaPhone />}
              {isVideoCall ? 'Video Call' : 'Voice Call'}
            </p>
          </div>
          
          <div className="flex justify-center gap-6">
            <button 
              onClick={rejectCall} 
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl transition-colors shadow-lg"
            >
              <FaPhoneSlash />
            </button>
            <button 
              onClick={acceptCall} 
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xl transition-colors shadow-lg"
            >
              <FaPhone />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render active call interface
  if (activeCall || callStatus !== 'idle') {
    const isVideoCall = activeCall?.callType === 'video' || incomingCall?.callType === 'video';
    
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Call Header */}
        <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm p-4 text-center">
          <h3 className="text-xl font-semibold text-white mb-1">
            {getStatusText()}
          </h3>
          <p className={`text-sm ${getConnectionStatusColor()}`}>
            {connectionState === 'connected' ? '🟢 Connected' : 
             connectionState === 'connecting' ? '🟡 Connecting' : 
             connectionState === 'failed' ? '🔴 Connection failed' : 
             '⚪ Initializing'}
          </p>
        </div>

        {/* Video Container */}
        {isVideoCall && (
          <div className="flex-1 relative overflow-hidden">
            {/* Remote video (full screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-surface-900"
            />
            
            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-surface-800 rounded-lg overflow-hidden border-2 border-surface-600 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Audio elements (always present) */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />

        {/* Call Controls */}
        {callStatus === 'connected' && (
          <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm p-6">
            <div className="flex justify-center items-center gap-4">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-surface-700 hover:bg-surface-600 text-surface-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              {/* Video controls (only for video calls) */}
              {isVideoCall && (
                <>
                  <button
                    onClick={toggleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                      !isCameraOn 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-surface-700 hover:bg-surface-600 text-surface-200'
                    }`}
                    title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                  
                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-full flex items-center justify-center text-lg transition-all"
                    title="Switch camera"
                  >
                    <FaSyncAlt />
                  </button>
                </>
              )}

              {/* End call button */}
              <button
                onClick={endCall}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl transition-all shadow-lg"
                title="End call"
              >
                <FaPhoneSlash />
              </button>
            </div>
          </div>
        )}

        {/* Status overlay for non-connected states */}
        {callStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-700 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white text-lg font-medium">
                {getStatusText()}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default CallComponent;