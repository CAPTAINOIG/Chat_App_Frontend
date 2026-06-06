import socketService from './socket.service';

class CallService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.currentCall = null;
    this.isCallActive = false;
    this.eventHandlers = {};
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
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
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  // Initialize socket listeners for call signaling
  initializeSocketListeners() {
    if (!socketService) return;

    // Incoming call
    socketService.on('incomingCall', (data) => {
      console.log('📞 Incoming call:', data);
      this.emit('incomingCall', data);
    });

    // Call accepted
    socketService.on('callAccepted', async (data) => {
      console.log('✅ Call accepted:', data);
      this.emit('callAccepted', data);
      await this.handleCallAccepted(data);
    });

    // Call rejected
    socketService.on('callRejected', (data) => {
      console.log('❌ Call rejected:', data);
      this.emit('callRejected', data);
      this.cleanup();
    });

    // Call ended
    socketService.on('callEnded', (data) => {
      console.log('📞 Call ended:', data);
      this.emit('callEnded', data);
      this.cleanup();
    });

    // WebRTC signaling
    socketService.on('webrtc-offer', async (data) => {
      await this.handleOffer(data);
    });

    socketService.on('webrtc-answer', async (data) => {
      await this.handleAnswer(data);
    });

    socketService.on('webrtc-ice-candidate', async (data) => {
      await this.handleIceCandidate(data);
    });
  }

  // Initiate a call
  async initiateCall(receiverId, callType = 'voice') {
    try {
      if (this.isCallActive) {
        throw new Error('Already in a call');
      }

      console.log(`📞 Initiating ${callType} call to:`, receiverId);

      // Get user media
      await this.getUserMedia(callType === 'video');
      
      // Create peer connection
      this.createPeerConnection();

      // Generate call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentCall = {
        callId,
        receiverId,
        callType,
        status: 'initiating'
      };

      this.isCallActive = true;

      // Emit call initiation through socket
      socketService.emit('initiateCall', {
        callId,
        receiverId,
        callType,
        callerInfo: {
          id: socketService.userId,
          username: localStorage.getItem('username') || 'Unknown User'
        }
      });

      return this.currentCall;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.cleanup();
      throw error;
    }
  }

  // Accept incoming call
  async acceptCall(callId) {
    try {
      console.log('✅ Accepting call:', callId);
      
      if (!this.currentCall || this.currentCall.callId !== callId) {
        this.currentCall = { callId, status: 'accepting' };
      }

      // Get user media based on call type
      const isVideo = this.currentCall.callType === 'video';
      await this.getUserMedia(isVideo);
      
      // Create peer connection
      this.createPeerConnection();

      this.isCallActive = true;

      // Notify backend
      socketService.emit('acceptCall', { callId });

      this.emit('callAccepted', { callId });
    } catch (error) {
      console.error('Failed to accept call:', error);
      this.rejectCall(callId);
      throw error;
    }
  }

  // Reject incoming call
  rejectCall(callId) {
    console.log('❌ Rejecting call:', callId);
    socketService.emit('rejectCall', { callId });
    this.cleanup();
  }

  // End active call
  endCall() {
    console.log('📞 Ending call');
    
    if (this.currentCall) {
      socketService.emit('endCall', { callId: this.currentCall.callId });
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

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Got user media:', this.localStream);
      
      this.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  // Create peer connection
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
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
      if (event.candidate && this.currentCall) {
        socketService.emit('webrtc-ice-candidate', {
          callId: this.currentCall.callId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('🔗 Connection state:', state);
      
      this.emit('connectionState', state);
      
      if (state === 'connected') {
        this.emit('callConnected', {});
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };
  }

  // Handle call accepted (create offer)
  async handleCallAccepted(data) {
    try {
      if (!this.peerConnection) return;

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      socketService.emit('webrtc-offer', {
        callId: this.currentCall.callId,
        offer: offer
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
      this.endCall();
    }
  }

  // Handle WebRTC offer
  async handleOffer(data) {
    try {
      if (!this.peerConnection) return;

      await this.peerConnection.setRemoteDescription(data.offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      socketService.emit('webrtc-answer', {
        callId: data.callId,
        answer: answer
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.endCall();
    }
  }

  // Handle WebRTC answer
  async handleAnswer(data) {
    try {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Failed to handle answer:', error);
      this.endCall();
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    try {
      if (!this.peerConnection) return;
      await this.peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  // Media controls
  toggleMicrophone() {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  toggleCamera() {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
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
      console.error('Failed to switch camera:', error);
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

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
  }
}

// Create singleton instance
const callService = new CallService();
export default callService;