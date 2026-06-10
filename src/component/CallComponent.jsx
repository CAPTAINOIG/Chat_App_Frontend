import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaPhoneSlash, FaSyncAlt, FaVolumeUp, FaUserPlus, FaPause, FaComment } from 'react-icons/fa';
import callService from '../services/call.service';
import defaultAvatar from '../assets/image/user.png';

const CallComponent = ({ currentUserId, username, selectedUser }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [connectionState, setConnectionState] = useState('new');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);
  const notificationRef = useRef(null);

  const handleIncomingCall = (call) => {
    setIncomingCall(call);
    setCallStatus('ringing');
    // Show browser notification for incoming call
    if ('Notification' in window && Notification.permission === 'granted') {
      const callerName = call.callerInfo?.username || 'Unknown';
      const callType = call.callType === 'video' ? 'Video Call' : 'Voice Call';
      
      try {
        notificationRef.current = new Notification(`Incoming ${callType}`, {
          body: `${callerName} is calling...`,
          icon: call.callerInfo?.profilePicture || defaultAvatar,
          tag: 'incoming-call',
          requireInteraction: true,
          badge: defaultAvatar
        });
        // Close notification when call is answered or rejected
        notificationRef.current.onclick = () => {
          window.focus();
          notificationRef.current.close();
        };
      } catch (e) {
      }
    } else if ('Notification' in window && Notification.permission !== 'granted') {
    }
  };

  const handleCallAccepted = (data) => {
    // Close notification
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    setCallStatus('connecting');
    setActiveCall(data);
  };

  const handleCallRejected = () => {
    // Close notification
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    setCallStatus('rejected');
    setTimeout(() => {
      setCallStatus('idle');
      setActiveCall(null);
      setIncomingCall(null);
    }, 2000);
  };

  const handleCallEnded = () => {
    // Close notification
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setActiveCall(null);
      setIncomingCall(null);
    }, 2000);
  };

  const handleCallConnected = () => {
    setCallStatus('connected');
  };

  const handleLocalStream = (stream) => {
    console.log('🎥 Setting local stream:', stream);
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      console.log('✅ Local stream attached to video element');
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
    }
  };

  const handleRemoteStream = (stream) => {
    console.log('🎥 Setting remote stream:', stream);
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      console.log('✅ Remote stream attached to video element');
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = stream;
    }
  };

  const handleConnectionState = (state) => {
    setConnectionState(state);
  };

  const handleCallInitiated = (call) => {
    // Close notification when call is initiated locally
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    setActiveCall(call);
    setCallStatus('connecting');
  };

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('📢 Notification permission:', permission);
      });
    }
    
    // Listen for incoming calls
    console.log('🎧 CallComponent: Registering event listeners...');
    callService.on('incomingCall', handleIncomingCall);
    callService.on('callAccepted', handleCallAccepted);
    callService.on('callRejected', handleCallRejected);
    callService.on('callEnded', handleCallEnded);
    callService.on('callConnected', handleCallConnected);
    callService.on('localStream', handleLocalStream);
    callService.on('remoteStream', handleRemoteStream);
    callService.on('connectionState', handleConnectionState);
    callService.on('callInitiated', handleCallInitiated);
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
      callService.off('callInitiated', handleCallInitiated);
      // Cleanup timer
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync streams to refs when they change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log('📹 Local stream synced to ref');
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('📹 Remote stream synced to ref');
    }
  }, [remoteStream]);

  // Timer for call duration
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Format duration (MM:SS)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Actual speaker routing would be handled by callService
  };

  // Toggle hold
  const toggleHold = () => {
    setIsHeld(!isHeld);
    // Note: Actual hold logic would be handled by callService
  };

  // Call actions
  const acceptCall = async () => {
    try {
      await callService.acceptCall(incomingCall.callId);
      setActiveCall(incomingCall);
      setIncomingCall(null);
      setCallStatus('connecting');
    } catch (error) {
      alert('Failed to accept call: ' + error.message);
    }
  };

  const rejectCall = () => {
    callService.rejectCall(incomingCall.callId);
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 bg-[#0a1628]">
        {/* Top: Caller Info */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
            <img 
              src={incomingCall.callerInfo?.profilePicture || defaultAvatar} 
              alt="Caller"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">
            {incomingCall.callerInfo?.username || 'Unknown'}
          </h2>
          <p className="text-lg text-gray-300">
            {isVideoCall ? 'WhatsApp Video' : 'WhatsApp Voice'} • Ringing...
          </p>
        </div>

        {/* Bottom: Controls */}
        <div className="w-full max-w-md px-8">
          <div className="flex justify-between items-end mb-8">
            <div className="flex flex-col items-center gap-2">
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors">
                <FaVolumeUp />
              </button>
              <span className="text-xs text-white/70">Speaker</span>
            </div>

            <div className="flex gap-8">
              <button 
                onClick={rejectCall} 
                className="w-20 h-20 bg-[#ff3b30] hover:bg-[#ff2d55] text-white rounded-full flex items-center justify-center text-3xl transition-all shadow-lg"
              >
                <FaPhoneSlash />
              </button>
              <button 
                onClick={acceptCall} 
                className="w-20 h-20 bg-[#34c759] hover:bg-[#30d158] text-white rounded-full flex items-center justify-center text-3xl transition-all shadow-lg"
              >
                {isVideoCall ? <FaVideo /> : <FaPhone />}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors">
                <FaComment />
              </button>
              <span className="text-xs text-white/70">Message</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render active call interface
  if (activeCall || callStatus !== 'idle') {
    const isVideoCall = activeCall?.callType === 'video' || incomingCall?.callType === 'video';
    // Determine if we are the caller (initiated the call)
    const isCaller = activeCall && (activeCall.callerInfo?.id === currentUserId || activeCall.callerInfo?._id === currentUserId);
    // Get the user to display (incoming: caller, outgoing: selectedUser)
    const displayUser = isCaller ? selectedUser : (activeCall?.callerInfo || incomingCall?.callerInfo || {});
    
    let callUI;

    if (isVideoCall) {
      // VIDEO CALL UI
      callUI = (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Remote video (full screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover bg-[#1c1c1e]"
            onLoadedMetadata={() => console.log('📹 Remote video metadata loaded')}
            onPlay={() => console.log('▶️ Remote video playing')}
            onError={(e) => console.error('❌ Remote video error:', e)}
          />
          
          {/* Local video (floating) */}
          <div className="absolute top-6 right-6 w-36 h-48 bg-[#1c1c1e] rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="w-full h-full object-cover"
              onLoadedMetadata={() => console.log('📹 Local video metadata loaded')}
              onPlay={() => console.log('▶️ Local video playing')}
              onError={(e) => console.error('❌ Local video error:', e)}
            />
          </div>

          {/* Audio elements */}
          <audio ref={localAudioRef} autoPlay muted={true} />
          <audio ref={remoteAudioRef} autoPlay muted={false} />

          {/* Top Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-1">
                {displayUser?.username || 'Unknown'}
              </h3>
              <p className="text-lg text-white/80">
                {callStatus === 'connected' ? formatDuration(callDuration) : getStatusText()}
              </p>
            </div>
          </div>

          {/* Bottom Controls */}
          {callStatus === 'connected' && (
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-around items-center max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isMuted 
                        ? 'bg-[#ff3b30] text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </button>
                  <span className="text-xs text-white/80">Mute</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleCamera}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      !isCameraOn 
                        ? 'bg-[#ff3b30] text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                  <span className="text-xs text-white/80">Camera</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={endCall}
                    className="w-20 h-20 bg-[#ff3b30] text-white rounded-full flex items-center justify-center text-3xl transition-all hover:bg-[#ff2d55] shadow-lg"
                  >
                    <FaPhoneSlash />
                  </button>
                  <span className="text-xs text-white/80">End</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={switchCamera}
                    className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center text-2xl transition-all hover:bg-white/30"
                  >
                    <FaSyncAlt />
                  </button>
                  <span className="text-xs text-white/80">Flip</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleSpeaker}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isSpeakerOn 
                        ? 'bg-[#34c759] text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <FaVolumeUp />
                  </button>
                  <span className="text-xs text-white/80">Speaker</span>
                </div>
              </div>
            </div>
          )}

          {/* Connecting overlay */}
          {callStatus !== 'connected' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-between py-10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="w-10 h-10 border-3 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {displayUser?.username || 'Unknown'}
                </h3>
                <p className="text-lg text-white/80">
                  {getStatusText()}
                </p>
              </div>

              {/* End Call Button */}
              <div>
                <button
                  onClick={endCall}
                  className="w-20 h-20 bg-[#ff3b30] text-white rounded-full flex items-center justify-center text-3xl transition-all hover:bg-[#ff2d55] shadow-lg"
                >
                  <FaPhoneSlash />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // VOICE CALL UI
      callUI = (
        <div className="fixed inset-0 bg-[#0a1628] z-50 flex flex-col items-center justify-between py-10">
          {/* Top Section */}
          <div className="text-center">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img
                src={displayUser?.profilePicture || defaultAvatar}
                alt="Caller"
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = defaultAvatar}
              />
            </div>
            <h2 className="text-3xl font-semibold text-white mb-2">
              {displayUser?.username || 'Unknown'}
            </h2>
            <p className="text-xl text-gray-300">
              {callStatus === 'connected' ? formatDuration(callDuration) : getStatusText()}
            </p>
          </div>

          {/* Audio elements */}
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />

          {/* Bottom Controls */}
          <div className="w-full max-w-lg px-8">
            {callStatus === 'connected' && (
              <div className="flex justify-around items-center mb-8">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={toggleSpeaker}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isSpeakerOn 
                        ? 'bg-[#34c759] text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <FaVolumeUp />
                  </button>
                  <span className="text-sm text-white/70">Speaker</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isMuted 
                        ? 'bg-[#ff3b30] text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </button>
                  <span className="text-sm text-white/70">Mute</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={toggleHold}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isHeld 
                        ? 'bg-[#ff3b30] text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <FaPause />
                  </button>
                  <span className="text-sm text-white/70">Hold</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-around items-center">
              {callStatus === 'connected' && (
                <div className="flex flex-col items-center gap-3">
                  <button
                    className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl transition-all hover:bg-white/20"
                  >
                    <FaUserPlus />
                  </button>
                  <span className="text-sm text-white/70">Add call</span>
                </div>
              )}

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={endCall}
                  className="w-20 h-20 bg-[#ff3b30] text-white rounded-full flex items-center justify-center text-3xl transition-all hover:bg-[#ff2d55] shadow-lg"
                >
                  <FaPhoneSlash />
                </button>
                <span className="text-sm text-white/70">End</span>
              </div>

              {callStatus === 'connected' && (
                <div className="flex flex-col items-center gap-3">
                  <button
                    className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl transition-all hover:bg-white/20"
                  >
                    <FaComment />
                  </button>
                  <span className="text-sm text-white/70">Message</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {callUI}
      </>
    );
  }

  return (
    <>
      {/* Using browser notifications instead of audio for better reliability */}
    </>
  );
};

export default CallComponent;