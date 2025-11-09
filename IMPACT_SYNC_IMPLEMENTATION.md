# Impact-Synchronized Recording Implementation

## ✅ Phase 1: COMPLETE

Impact-synchronized recording has been implemented and is ready to test!

## What Was Implemented

### 1. ImpactSyncRecorder Component (`src/components/ImpactSyncRecorder.tsx`)
- **Continuous frame buffer**: Captures 2 seconds of video continuously before impact
- **IMPACT! button**: User presses at the moment they hear ball contact
- **Post-impact capture**: Records 0.5 seconds after impact
- **Known impact frame**: Tracks exact frame index where impact occurred
- **Recording metadata**: Includes timing, frame rate, and impact timestamp

### 2. Integration in RebootAnalysis Page
- New "Video Capture" tab added alongside Upload, Compare, and History
- Instructions and workflow explanation
- Coming soon features preview (Bat Tracking, Audio Detection)

## How to Test

### 1. Navigate to Reboot Analysis Page
```
/reboot-analysis
```

### 2. Click "Video Capture" Tab
- You'll see the ImpactSyncRecorder component

### 3. Recording Flow
1. **Click "Start Buffer Recording"**
   - Grants camera/mic permissions
   - Starts continuous recording
   - Buffer fills to 2 seconds (100% progress)

2. **Press "IMPACT!" Button**
   - Press when you hear/see ball contact
   - Marks exact impact frame
   - Captures 0.5s more video

3. **Recording Processed**
   - Video uploaded to Supabase Storage
   - Metadata saved (impact frame index, total frames, timing)
   - Ready for future analysis

## Technical Details

### Recording Specs
- **Frame Rate**: 120fps (ideal), minimum 60fps
- **Resolution**: 1280x720 (HD)
- **Format**: WebM (VP9 codec)
- **Audio**: Enabled (for future audio detection)
- **Buffer Duration**: 2 seconds before impact
- **Post-Impact Duration**: 0.5 seconds after impact

### Storage
Videos are saved to Supabase Storage bucket: `swing-videos`
Path format: `{user_id}/impact-sync-{timestamp}.webm`

### Recording Data Structure
```typescript
interface RecordingData {
  videoBlob: Blob;              // Video file
  impactFrameIndex: number;     // Frame where impact occurred
  totalFrames: number;          // Total frames in recording
  impactTimestamp: number;      // Time (ms) from start to impact
  metadata: {
    preImpactSeconds: number;   // 2.0
    postImpactSeconds: number;  // 0.5
    frameRate: number;          // Actual camera frame rate
  };
}
```

## Benefits Over Traditional Recording

| Aspect | Traditional Recording | Impact-Sync Recording |
|--------|---------------------|---------------------|
| **Timing Accuracy** | Impact frame estimated | Impact frame known precisely |
| **File Size** | 5+ seconds (large) | 2.5 seconds (smaller) |
| **User Experience** | Record before swing | Press at impact (natural) |
| **Processing** | Search entire video | Known impact frame |
| **Tempo Analysis** | Less accurate | Highly accurate |

## Next Steps (Future Phases)

### Phase 2: Pose Estimation Integration
1. Extract frames from recorded video
2. Run MediaPipe Pose on all frames
3. Calculate timing metrics using known impact frame:
   - Load duration (stance → max pelvis)
   - Fire duration (max pelvis → impact)
   - Tempo ratio (load / fire)
4. Extract rotational velocities from pose landmarks
5. Save results to `reboot_reports` table

### Phase 3: Bat Tracking (Optional)
- Detect bat in video using TensorFlow.js
- Track bat position across frames
- Calculate bat angular velocity
- Add to momentum analysis (when detection confidence is high)
- Gracefully handle when bat can't be detected

### Phase 4: Audio-Based Detection (Future)
- Analyze audio waveform in real-time
- Detect ball strike sound (amplitude spike)
- Automatically mark impact frame
- Fully automatic recording (no button press needed)

## Usage Example

```typescript
// In RebootAnalysis.tsx
<ImpactSyncRecorder
  frameRate={120}
  bufferSeconds={2}
  onRecordingComplete={async (recording) => {
    // 1. Upload video
    await supabase.storage
      .from('swing-videos')
      .upload(fileName, recording.videoBlob);
    
    // 2. Process with pose estimation (future)
    const { data } = await supabase.functions.invoke('analyze-impact-video', {
      body: {
        videoPath: fileName,
        impactFrameIndex: recording.impactFrameIndex,
        frameRate: recording.metadata.frameRate
      }
    });
    
    // 3. Save metrics to database
    // ...
  }}
/>
```

## Testing Checklist

- [ ] Camera permission granted
- [ ] Buffer fills to 100%
- [ ] IMPACT button enabled after buffer full
- [ ] Recording captures on button press
- [ ] Video uploaded to Storage
- [ ] Correct impact frame index calculated
- [ ] File size reasonable (~2-5 MB for 2.5s)
- [ ] Works on mobile devices
- [ ] Works with different cameras (front/rear)

## Known Limitations

1. **Frame Rate**: Not all cameras support 120fps or 240fps
   - Solution: Works with minimum 60fps, shows warning if lower
   
2. **Browser Compatibility**: MediaRecorder API support varies
   - Chrome/Edge: ✅ Excellent support
   - Safari: ⚠️ Limited codec support
   - Firefox: ✅ Good support
   
3. **File Size**: Higher frame rates = larger files
   - 60fps: ~2 MB for 2.5s
   - 120fps: ~4 MB for 2.5s
   - 240fps: ~8 MB for 2.5s (rarely supported)

## API Reference

### ImpactSyncRecorder Props

```typescript
interface ImpactSyncRecorderProps {
  onRecordingComplete: (recording: RecordingData) => void;
  frameRate?: number;        // Default: 120
  bufferSeconds?: number;    // Default: 2
}
```

### RecordingData Interface

```typescript
interface RecordingData {
  videoBlob: Blob;
  impactFrameIndex: number;
  totalFrames: number;
  impactTimestamp: number;
  metadata: {
    preImpactSeconds: number;
    postImpactSeconds: number;
    frameRate: number;
  };
}
```

## Questions?

For implementation questions or feature requests, refer to the original specification document.
