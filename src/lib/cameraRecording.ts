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
  private videoElement: HTMLVideoElement | null = null;
  private currentFacingMode: 'user' | 'environment' = 'environment';

  async startPreview(
    videoElement: HTMLVideoElement,
    targetFps: number = 120,
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
        audio: false
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
      const actualFps = settings.frameRate || 30;
      
      console.log('Camera settings:', settings);
      console.log('Actual frame rate:', actualFps);

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

  async startRecording(): Promise<{ success: boolean; error?: string }> {
    if (!this.stream) {
      return { success: false, error: 'No camera stream available' };
    }

    try {
      this.chunks = [];
      
      // Use the highest quality codec available
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Capture data every 100ms
      console.log('Recording started');

      return { success: true };
    } catch (error) {
      console.error('Error starting recording:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      };
    }
  }

  async stopRecording(): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'No active recording' });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        console.log('Recording stopped, blob size:', blob.size);
        resolve({ success: true, blob });
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

  async switchCamera(videoElement: HTMLVideoElement, targetFps: number = 120): Promise<{ success: boolean; actualFps?: number; error?: string }> {
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
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using mime type:', type);
        return type;
      }
    }

    return 'video/webm';
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
