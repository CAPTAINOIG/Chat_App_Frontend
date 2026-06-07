import socketService from './socket.service';
import { SOCKET_EVENTS } from '../constants/socketEvents';

class CallService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.currentCall = null;
    this.isCallActive = false;
    this.eventHandlers = {};
    this.iceCandidatesQueue = []; // Queue for ICE candidates before remote description is set
    
    // WebRTC configuration - Use public STUN servers for NAT traversal
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };
    
    this.initializeSocketListeners();
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  emit(event, data) {
    console.log(`📡 Emitting local event: ${event}`, data);
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  // Initialize socket listeners for call signaling
  initializeSocketListeners() {
    if (!socketService) return;

    console.log('🔌 Initializing call socket listeners');

    // Incoming call
    socketService.on(SOCKET_EVENTS.CALL_INCOMING, (data) => {
      console.log('📞 [SOCKET] Incoming call received:', data);
      this.currentCall = {
        callId: data.callId,
        callerId: data.callerId,
        callerInfo: data.callerInfo,
        callType: data.callType,
        status: 'incoming'
      };
      this.emit('incomingCall', this.currentCall);
    });

    // Call initiated (confirmation from backend)
    socketService.on(SOCKET_EVENTS.CALL_INITIATED, (data) => {
      console.log('✅ [SOCKET] Call initiated (backend confirmation):', data);
      this.currentCall = { ...this.currentCall, ...data, status: 'calling' };
      this.emit('callInitiated', this.currentCall);
    });

    // Call accepted
    socketService.on(SOCKET_EVENTS.CALL_ACCEPTED, async (data) => {
      console.log('✅ [SOCKET] Call accepted by receiver:', data);
      this.currentCall = { ...this.currentCall, status: 'accepted' };
      this.emit('callAccepted', data);
      await this.handleCallAcceptedAsCaller(data);
    });

    // Call rejected
    socketService.on(SOCKET_EVENTS.CALL_REJECTED, (data) => {
      console.log('❌ [SOCKET] Call rejected:', data);
      this.emit('callRejected', data);
      this.cleanup();
    });

    // Call ended
    socketService.on(SOCKET_EVENTS.CALL_ENDED, (data) => {
      console.log('📞 [SOCKET] Call ended:', data);
      this.emit('callEnded', data);
      this.cleanup();
    });

    // Call error
    socketService.on(SOCKET_EVENTS.CALL_ERROR, (data) => {
      console.error('❌ [SOCKET] Call error:', data);
      this.emit('callError', data);
      this.cleanup();
    });

    // Call missed (receiver offline)
    socketService.on(SOCKET_EVENTS.CALL_MISSED, (data) => {
      console.log('📞 [SOCKET] Call missed:', data);
      this.emit('callMissed', data);
      this.cleanup();
    });

    // WebRTC signaling - Offer received
    socketService.on(SOCKET_EVENTS.WEBRTC_OFFER, async (data) => {
      console.log('📡 [SOCKET] WebRTC offer received:', data);
      await this.handleOffer(data);
    });

    // WebRTC signaling - Answer received
    socketService.on(SOCKET_EVENTS.WEBRTC_ANSWER, async (data) => {
      console.log('📡 [SOCKET] WebRTC answer received:', data);
      await this.handleAnswer(data);
    });

    // WebRTC signaling - ICE candidate received
    socketService.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, async (data) => {
      console.log('📡 [SOCKET] WebRTC ICE candidate received:', data);
      await this.handleIceCandidate(data);
    });

    // WebRTC error
    socketService.on(SOCKET_EVENTS.WEBRTC_ERROR, (data) => {
      console.error('❌ [SOCKET] WebRTC error:', data);
      this.emit('webrtcError', data);
    });
  }

  // Initiate a call
  async initiateCall(receiverId, callType = 'voice', callerInfo = null) {
    try {
      console.group('📞 Initiate Call');
      console.log('Receiver ID:', receiverId);
      console.log('Call Type:', callType);

      if (this.isCallActive) {
        throw new Error('Already in a call');
      }

      // 1. Get user media FIRST
      console.log('Step 1: Getting user media...');
      await this.getUserMedia(callType === 'video');

      // 2. Create current call object
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentCall = {
        callId,
        receiverId,
        callType,
        status: 'initiating',
        callerInfo: callerInfo || {
          id: socketService.userId,
          username: localStorage.getItem('username') || 'Unknown User'
        }
      };
      this.isCallActive = true;

      // 3. Emit event for local UI
      this.emit('callInitiated', this.currentCall);

      // 4. Send call initiation to backend
      console.log('Step 2: Sending call:initiate to backend...');
      socketService.emit(SOCKET_EVENTS.CALL_INITIATE, {
        receiverId,
        callType
      });

      console.log('Call initiation sent to backend');
      console.groupEnd();

      return this.currentCall;
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      console.groupEnd();
      this.cleanup();
      throw error;
    }
  }

  // Accept incoming call (as receiver)
  async acceptCall(callId) {
    try {
      console.group('✅ Accept Call');
      console.log('Call ID:', callId);

      if (!this.currentCall || this.currentCall.callId !== callId) {
        throw new Error('No active incoming call');
      }

      // 1. Get user media
      console.log('Step 1: Getting user media...');
      const isVideo = this.currentCall.callType === 'video';
      await this.getUserMedia(isVideo);

      // 2. Create peer connection
      console.log('Step 2: Creating peer connection...');
      this.createPeerConnection();

      this.isCallActive = true;
      this.currentCall.status = 'accepted';

      // 3. Notify backend
      console.log('Step 3: Sending call:accept to backend...');
      socketService.emit(SOCKET_EVENTS.CALL_ACCEPT, { callId });

      this.emit('callAccepted', { callId });
      console.log('Call acceptance sent to backend');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      console.groupEnd();
      this.rejectCall(callId);
      throw error;
    }
  }

  // Reject incoming call
  rejectCall(callId) {
    console.log('❌ Rejecting call:', callId);
    socketService.emit(SOCKET_EVENTS.CALL_REJECT, { callId });
    this.cleanup();
  }

  // End active call
  endCall() {
    console.log('📞 Ending call');
    
    if (this.currentCall) {
      socketService.emit(SOCKET_EVENTS.CALL_END, { callId: this.currentCall.callId });
    }
    
    this.cleanup();
    this.emit('callEnded', {});
  }

  // Get user media (camera/microphone)
  async getUserMedia(includeVideo = true) {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      console.log('🎤 Requesting user media with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 User media obtained successfully:', this.localStream);
      
      this.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  // Create peer connection
  createPeerConnection() {
    console.log('🔧 Creating peer connection with config:', this.rtcConfig);
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Add local stream tracks
    if (this.localStream) {
      console.log('🔧 Adding local stream tracks to peer connection...');
      this.localStream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📡 Received remote stream:', event);
      this.remoteStream = event.streams[0];
      this.emit('remoteStream', this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      console.log('❄️ ICE candidate generated:', event.candidate);
      if (event.candidate && this.currentCall) {
        // Determine target user ID based on role
        const targetUserId = this.currentCall.callerId || this.currentCall.receiverId;
        console.log(`📡 Sending ICE candidate to ${targetUserId}:`, event.candidate);
        
        socketService.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
          callId: this.currentCall.callId,
          candidate: event.candidate,
          targetUserId
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('🔗 Peer connection state changed:', state);
      
      this.emit('connectionState', state);
      
      if (state === 'connected') {
        console.log('✅ Peer connection established!');
        this.emit('callConnected', {});
      } else if (state === 'disconnected' || state === 'failed') {
        console.log('❌ Peer connection disconnected/failed');
        this.endCall();
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('❄️ ICE connection state:', this.peerConnection.iceConnectionState);
    };

    // Handle signaling state
    this.peerConnection.onsignalingstatechange = () => {
      console.log('📜 Signaling state:', this.peerConnection.signalingState);
    };

    console.log('✅ Peer connection created');
  }

  // Handle call accepted - ONLY CALLED BY CALLER (creates offer)
  async handleCallAcceptedAsCaller(data) {
    try {
      console.group('📞 Handle Call Accepted (Caller)');
      console.log('Data:', data);

      if (!this.currentCall) {
        console.warn('No current call found');
        return;
      }

      // 1. Create peer connection NOW that call is accepted!
      console.log('Step 1: Creating peer connection...');
      this.createPeerConnection();

      // 2. Create offer
      console.log('Step 2: Creating offer...');
      const offer = await this.peerConnection.createOffer();
      console.log('📜 Offer created:', offer);

      // 3. Set local description
      console.log('Step 3: Setting local description...');
      await this.peerConnection.setLocalDescription(offer);

      // 4. Send offer to receiver
      const targetUserId = this.currentCall.receiverId;
      console.log(`Step 4: Sending offer to ${targetUserId}...`);
      socketService.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
        callId: this.currentCall.callId,
        offer: offer,
        targetUserId
      });

      console.log('✅ Offer sent successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Failed to create/send offer:', error);
      console.groupEnd();
      this.endCall();
    }
  }

  // Handle WebRTC offer - CALLED BY RECEIVER
  async handleOffer(data) {
    try {
      console.group('📡 Handle WebRTC Offer (Receiver)');
      console.log('Data:', data);

      if (!this.peerConnection) {
        console.warn('No peer connection available for offer');
        return;
      }

      // 1. Set remote description
      console.log('Step 1: Setting remote description...');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

      // 2. Process queued ICE candidates
      console.log(`Step 2: Processing ${this.iceCandidatesQueue.length} queued ICE candidates...`);
      for (const candidate of this.iceCandidatesQueue) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.iceCandidatesQueue = [];

      // 3. Create answer
      console.log('Step 3: Creating answer...');
      const answer = await this.peerConnection.createAnswer();
      console.log('📜 Answer created:', answer);

      // 4. Set local description
      console.log('Step 4: Setting local description...');
      await this.peerConnection.setLocalDescription(answer);

      // 5. Send answer to caller
      const targetUserId = this.currentCall.callerId || data.fromUserId;
      console.log(`Step 5: Sending answer to ${targetUserId}...`);
      socketService.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
        callId: data.callId,
        answer: answer,
        targetUserId
      });

      console.log('✅ Answer sent successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
      console.groupEnd();
      this.endCall();
    }
  }

  // Handle WebRTC answer - CALLED BY CALLER
  async handleAnswer(data) {
    try {
      console.group('📡 Handle WebRTC Answer (Caller)');
      console.log('Data:', data);

      if (!this.peerConnection) {
        console.warn('No peer connection available for answer');
        return;
      }

      // 1. Set remote description
      console.log('Step 1: Setting remote description...');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

      // 2. Process queued ICE candidates
      console.log(`Step 2: Processing ${this.iceCandidatesQueue.length} queued ICE candidates...`);
      for (const candidate of this.iceCandidatesQueue) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.iceCandidatesQueue = [];

      console.log('✅ Answer processed successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
      console.groupEnd();
      this.endCall();
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    try {
      console.log('❄️ Handling ICE candidate:', data);

      if (!data.candidate) {
        console.log('No candidate in data');
        return;
      }

      if (!this.peerConnection) {
        console.warn('No peer connection - queueing ICE candidate');
        this.iceCandidatesQueue.push(data.candidate);
        return;
      }

      // Only add ICE candidate if remote description is set
      if (!this.peerConnection.remoteDescription) {
        console.warn('Remote description not set yet - queueing ICE candidate');
        this.iceCandidatesQueue.push(data.candidate);
        return;
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
    }
  }

  // Media controls
  toggleMicrophone() {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🎤 Microphone toggled:', audioTrack.enabled ? 'ON' : 'OFF');
      return audioTrack.enabled;
    }
    return false;
  }

  toggleCamera() {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📷 Camera toggled:', videoTrack.enabled ? 'ON' : 'OFF');
      return videoTrack.enabled;
    }
    return false;
  }

  async switchCamera() {
    try {
      if (!this.localStream) return;

      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) return;

      // Get current facing mode
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      console.log(`🔄 Switching camera from ${currentFacingMode} to ${newFacingMode}`);

      // Stop current track
      videoTrack.stop();

      // Get new stream with switched camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: newFacingMode }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Replace track in local stream
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);

      this.emit('localStream', this.localStream);
    } catch (error) {
      console.error('❌ Failed to switch camera:', error);
    }
  }

  // Utility methods
  isInCall() {
    return this.isCallActive;
  }

  getCurrentCall() {
    return this.currentCall;
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  // Cleanup
  cleanup() {
    console.log('🧹 Cleaning up call resources');
    
    this.isCallActive = false;
    this.currentCall = null;
    this.iceCandidatesQueue = [];

    // Stop local stream
    if (this.localStream) {
      console.log('🧹 Stopping local stream tracks');
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      console.log('🧹 Closing peer connection');
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    console.log('✅ Cleanup complete');
  }
}

// Create singleton instance
const callService = new CallService();
export default callService;
