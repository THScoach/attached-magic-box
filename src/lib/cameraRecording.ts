export interface RecordingConstraints {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    frameRate: { ideal: number; max: number };
    facingMode: string;
  };
  audio: boolean;
}

export class CameraRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private bufferChunks: Blob[] = []; // Rolling buffer for pre-capture
  private videoElement: HTMLVideoElement | null = null;
  private currentFacingMode: 'user' | 'environment' = 'environment';
  private recordingTimeout: number | null = null;
  private autoStopCallback: (() => void) | null = null;
  private isBuffering: boolean = false;
  private contactTimestamp: number | null = null; // Time when button pressed at contact
  private currentMimeType: string = 'video/mp4'; // Store the mime type being used

  async startPreview(
    videoElement: HTMLVideoElement,
    targetFps: number = 240, // Default to 240fps
    facingMode: 'user' | 'environment' = 'environment'
  ): Promise<{ success: boolean; actualFps?: number; error?: string }> {
    try {
      console.log('Requesting camera with target fps:', targetFps);
      
      // Request high frame rate video
      this.currentFacingMode = facingMode;
      const constraints: RecordingConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: targetFps, max: 240 },
          facingMode: this.currentFacingMode
        },
        audio: true // Enable audio for future contact detection
      };

      console.log('Camera constraints:', constraints);
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!this.stream) {
        throw new Error('No media stream received');
      }
      
      // Check what frame rate we actually got
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }
      
      const settings = videoTrack.getSettings();
      let actualFps = settings.frameRate || 30;
      
      console.log('Camera settings:', settings);
      console.log('Actual frame rate:', actualFps);

      // If we requested high FPS but got low FPS, try again with 120fps
      if (targetFps >= 240 && actualFps < 100) {
        console.log('Did not get high frame rate, trying 120fps...');
        this.stream.getTracks().forEach(track => track.stop());
        
        const fallbackConstraints: RecordingConstraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 120, max: 120 },
            facingMode: this.currentFacingMode
          },
          audio: true
        };
        
        this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        const newVideoTrack = this.stream.getVideoTracks()[0];
        const newSettings = newVideoTrack.getSettings();
        actualFps = newSettings.frameRate || 30;
        console.log('Fallback frame rate:', actualFps);
      }

      this.videoElement = videoElement;
      this.videoElement.srcObject = this.stream;
      
      await this.videoElement.play().catch(e => {
        console.error('Video play error:', e);
        throw new Error('Failed to play video stream');
      });

      return { 
        success: true, 
        actualFps: actualFps 
      };
    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Failed to access camera';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  async startBuffering(): Promise<{ success: boolean; error?: string }> {
    if (!this.stream) {
      return { success: false, error: 'No camera stream available' };
    }

    try {
      this.bufferChunks = [];
      this.isBuffering = true;
      
      // Use the highest quality codec available
      const mimeType = this.getSupportedMimeType();
      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 12000000 // 12 Mbps for high quality
      };

      console.log('Starting MediaRecorder with:', options);
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.currentMimeType = mimeType; // Store for later use

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.bufferChunks.push(event.data);
          
          // Keep only ~2 seconds of buffer (20 chunks at 100ms each)
          if (this.bufferChunks.length > 20) {
            this.bufferChunks.shift(); // Remove oldest chunk
          }
        }
      };

      this.mediaRecorder.start(100); // Capture data every 100ms
      console.log('Buffer recording started - keeping 2 second rolling buffer');

      return { success: true };
    } catch (error) {
      console.error('Error starting buffer recording:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start buffer recording' 
      };
    }
  }

  async captureAtContact(autoStopCallback?: () => void): Promise<{ success: boolean; error?: string }> {
    if (!this.isBuffering) {
      return { success: false, error: 'Buffer recording not active' };
    }

    try {
      console.log('Contact button pressed! Capturing 2 seconds before + 2 seconds after...');
      
      // Mark contact timestamp (relative to start of final video)
      this.contactTimestamp = 2000; // Contact happens at 2 seconds (after the 2-second buffer)
      
      // Transfer buffer chunks to final recording
      this.chunks = [...this.bufferChunks];
      this.autoStopCallback = autoStopCallback || null;
      
      // Continue recording for 2 more seconds
      this.recordingTimeout = window.setTimeout(() => {
        console.log('2 seconds after contact - stopping capture');
        if (this.autoStopCallback) {
          this.autoStopCallback();
        }
      }, 2000);

      return { success: true };
    } catch (error) {
      console.error('Error capturing at contact:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to capture at contact' 
      };
    }
  }

  async stopRecording(): Promise<{ success: boolean; blob?: Blob; contactTimestamp?: number; error?: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'No active recording' });
        return;
      }

      // Clear the auto-stop timeout
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.currentMimeType });
        console.log('Recording stopped, blob size:', blob.size, 'type:', this.currentMimeType);
        console.log('Contact occurred at:', this.contactTimestamp, 'ms');
        resolve({ 
          success: true, 
          blob,
          contactTimestamp: this.contactTimestamp || undefined
        });
        
        // Reset state
        this.isBuffering = false;
        this.contactTimestamp = null;
      };

      this.mediaRecorder.stop();
    });
  }

  stopPreview(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  async switchCamera(videoElement: HTMLVideoElement, targetFps: number = 240): Promise<{ success: boolean; actualFps?: number; error?: string }> {
    // Toggle between front and back camera
    const newFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Stop current stream
    this.stopPreview();
    
    // Start with new facing mode
    return this.startPreview(videoElement, targetFps, newFacingMode);
  }
  
  getCurrentFacingMode(): 'user' | 'environment' {
    return this.currentFacingMode;
  }

  private getSupportedMimeType(): string {
    // Detect iOS/iPad devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Prioritize MP4 for iOS devices, as they handle it best
    const types = isIOS 
      ? [
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
        ]
      : [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4;codecs=h264',
          'video/mp4'
        ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using mime type:', type, '(iOS device:', isIOS + ')');
        return type;
      }
    }

    // Fallback based on device
    return isIOS ? 'video/mp4' : 'video/webm';
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
