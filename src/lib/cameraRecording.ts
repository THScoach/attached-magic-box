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

  async startPreview(
    videoElement: HTMLVideoElement,
    targetFps: number = 120
  ): Promise<{ success: boolean; actualFps?: number; error?: string }> {
    try {
      // Request high frame rate video
      const constraints: RecordingConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: targetFps, max: 240 }, // Request up to 240fps if available
          facingMode: 'user' // Can be changed to 'environment' for back camera
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check what frame rate we actually got
      const videoTrack = this.stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const actualFps = settings.frameRate || 30;
      
      console.log('Camera settings:', settings);
      console.log('Actual frame rate:', actualFps);

      this.videoElement = videoElement;
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      return { 
        success: true, 
        actualFps: actualFps 
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to access camera' 
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

  switchCamera(): void {
    // Toggle between front and back camera
    if (this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0];
      const constraints = videoTrack.getConstraints();
      const currentFacing = (constraints as any).facingMode;
      
      // This would require stopping and restarting with new constraints
      console.log('Camera switching not yet implemented, current:', currentFacing);
    }
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
