/**
 * Audio Impact Detection Utilities
 * Detects ball strike sound for automatic impact synchronization
 */

export interface ImpactDetectionResult {
  detected: boolean;
  timestamp: number; // milliseconds from start
  confidence: number; // 0-1
}

export class AudioImpactDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private impactThreshold: number;
  private isListening: boolean = false;
  private startTime: number = 0;
  
  constructor(impactThreshold: number = 0.75) {
    this.impactThreshold = impactThreshold;
  }

  /**
   * Start listening for impact sound
   */
  async startListening(audioStream: MediaStream): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: 48000 });
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.3;

    const source = this.audioContext.createMediaStreamSource(audioStream);
    source.connect(this.analyser);

    this.isListening = true;
    this.startTime = Date.now();
  }

  /**
   * Detect impact from audio stream
   */
  async detectImpact(): Promise<ImpactDetectionResult> {
    if (!this.analyser || !this.isListening) {
      throw new Error('Not listening to audio stream');
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    return new Promise((resolve) => {
      let maxAmplitude = 0;
      let backgroundNoise = 0;
      let sampleCount = 0;

      const checkForImpact = () => {
        if (!this.analyser || !this.isListening) {
          resolve({ detected: false, timestamp: 0, confidence: 0 });
          return;
        }

        this.analyser.getByteTimeDomainData(dataArray);
        
        // Calculate current amplitude
        let amplitude = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = Math.abs(dataArray[i] - 128) / 128;
          amplitude = Math.max(amplitude, value);
        }

        // Track background noise (running average)
        sampleCount++;
        backgroundNoise = (backgroundNoise * (sampleCount - 1) + amplitude) / sampleCount;
        maxAmplitude = Math.max(maxAmplitude, amplitude);

        // Detect impact: sudden spike above threshold AND significantly above background
        const isSpike = amplitude > this.impactThreshold;
        const isSignificant = amplitude > backgroundNoise * 3;
        
        if (isSpike && isSignificant) {
          const impactTime = Date.now() - this.startTime;
          const confidence = Math.min(amplitude / maxAmplitude, 1.0);
          
          resolve({
            detected: true,
            timestamp: impactTime,
            confidence
          });
        } else {
          requestAnimationFrame(checkForImpact);
        }
      };

      checkForImpact();
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    this.isListening = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  /**
   * Get current audio level (for UI feedback)
   */
  getCurrentLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = Math.abs(dataArray[i] - 128) / 128;
      if (value > max) max = value;
    }
    
    return max;
  }

  /**
   * Analyze recorded audio to find impact timestamp
   */
  static async analyzeRecordedAudio(
    audioBlob: Blob,
    impactThreshold: number = 0.75
  ): Promise<ImpactDetectionResult> {
    const audioContext = new AudioContext({ sampleRate: 48000 });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    let maxAmplitude = 0;
    let impactIndex = -1;
    
    // Find maximum amplitude (impact)
    for (let i = 0; i < channelData.length; i++) {
      const amplitude = Math.abs(channelData[i]);
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        impactIndex = i;
      }
    }
    
    // Check if impact detected
    if (maxAmplitude > impactThreshold && impactIndex !== -1) {
      const timestamp = (impactIndex / sampleRate) * 1000;
      const confidence = Math.min(maxAmplitude, 1.0);
      
      return {
        detected: true,
        timestamp,
        confidence
      };
    }
    
    return { detected: false, timestamp: 0, confidence: 0 };
  }
}
