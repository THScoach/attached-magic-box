import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smartphone, Circle, Square, Wifi, WifiOff, Copy, Check } from "lucide-react";
import { CameraRecorder } from "@/lib/cameraRecording";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface SyncRecordingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (masterVideo: File, clientVideo: File) => void;
}

type DeviceRole = 'master' | 'client';
type SessionStatus = 'waiting' | 'connected' | 'recording' | 'stopped';

export function SyncRecording({ isOpen, onClose, onComplete }: SyncRecordingProps) {
  const [deviceRole, setDeviceRole] = useState<DeviceRole | null>(null);
  const [sessionCode, setSessionCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('waiting');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<CameraRecorder>(new CameraRecorder());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const deviceId = useRef<string>(`device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Generate random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create master session
  const createSession = async () => {
    const code = generateCode();
    const { data, error } = await supabase
      .from('sync_recording_sessions')
      .insert({
        session_code: code,
        master_device_id: deviceId.current,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create session");
      console.error(error);
      return;
    }

    setSessionId(data.id);
    setSessionCode(code);
    setDeviceRole('master');
    subscribeToSession(data.id);
    initCamera();
  };

  // Join as client
  const joinSession = async () => {
    if (!inputCode || inputCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    // Find session with code
    const { data: session, error } = await supabase
      .from('sync_recording_sessions')
      .select('*')
      .eq('session_code', inputCode)
      .eq('status', 'waiting')
      .single();

    if (error || !session) {
      toast.error("Session not found or already started");
      return;
    }

    // Update session with client device
    const { error: updateError } = await supabase
      .from('sync_recording_sessions')
      .update({
        client_device_id: deviceId.current,
        status: 'connected'
      })
      .eq('id', session.id);

    if (updateError) {
      toast.error("Failed to join session");
      return;
    }

    setSessionId(session.id);
    setSessionCode(inputCode);
    setDeviceRole('client');
    setSessionStatus('connected');
    subscribeToSession(session.id);
    initCamera();
    toast.success("Connected to session!");
  };

  // Initialize camera
  const initCamera = async () => {
    setShowCamera(true);
    setTimeout(async () => {
      if (videoRef.current) {
        const result = await recorderRef.current.startPreview(videoRef.current, 240, 'environment');
        if (result.success) {
          // Start buffer recording immediately
          const bufferResult = await recorderRef.current.startBuffering();
          if (!bufferResult.success) {
            console.error('Failed to start buffer:', bufferResult.error);
          }
        } else {
          toast.error("Failed to start camera");
        }
      }
    }, 100);
  };

  // Subscribe to realtime updates
  const subscribeToSession = (sessionId: string) => {
    const channel = supabase
      .channel(`sync-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sync_recording_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session update:', payload);
          const newData = payload.new as any;
          
          // Update status
          if (newData.status) {
            setSessionStatus(newData.status);
            
            // Master received connection
            if (deviceRole === 'master' && newData.status === 'connected') {
              toast.success("Client connected! Ready to record.");
            }
            
            // Start recording triggered
            if (newData.status === 'recording' && newData.started_at) {
              handleRemoteRecordingStart();
            }
            
            // Stop recording triggered
            if (newData.status === 'stopped' && newData.stopped_at) {
              handleRemoteRecordingStop();
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  // Master initiates recording
  const startRecording = async () => {
    if (!sessionId) return;

    // Start buffer recording locally
    const result = await recorderRef.current.captureAtContact();
    if (!result.success) {
      toast.error("Failed to start recording");
      return;
    }

    setIsRecording(true);

    // Update session to trigger client recording
    await supabase
      .from('sync_recording_sessions')
      .update({
        status: 'recording',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    toast.success("Contact captured on both cameras!");
  };

  // Handle remote recording start (for client)
  const handleRemoteRecordingStart = async () => {
    const result = await recorderRef.current.captureAtContact();
    if (result.success) {
      setIsRecording(true);
    }
  };

  // Master stops recording
  const stopRecording = async () => {
    if (!sessionId) return;

    // Stop local recording
    const result = await recorderRef.current.stopRecording();
    if (!result.success || !result.blob) {
      toast.error("Failed to stop recording");
      return;
    }

    const file = new File([result.blob], `${deviceRole}-${Date.now()}.webm`, {
      type: 'video/webm'
    });
    setRecordedVideo(file);
    setIsRecording(false);

    // Update session to trigger client stop
    await supabase
      .from('sync_recording_sessions')
      .update({
        status: 'stopped',
        stopped_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    toast.success("Recording saved!");
  };

  // Handle remote recording stop (for client)
  const handleRemoteRecordingStop = async () => {
    const result = await recorderRef.current.stopRecording();
    if (result.success && result.blob) {
      const file = new File([result.blob], `${deviceRole}-${Date.now()}.webm`, {
        type: 'video/webm'
      });
      setRecordedVideo(file);
      setIsRecording(false);
    }
  };

  // Upload and complete
  const handleComplete = async () => {
    if (!recordedVideo || !sessionId) return;

    toast.info("Uploading video...");

    // Upload video
    const fileName = `${sessionId}/${deviceRole}-${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('swing-videos')
      .upload(fileName, recordedVideo);

    if (uploadError) {
      toast.error("Failed to upload video");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('swing-videos')
      .getPublicUrl(fileName);

    // Update session with video URL
    const updateField = deviceRole === 'master' ? 'master_video_url' : 'client_video_url';
    await supabase
      .from('sync_recording_sessions')
      .update({ [updateField]: publicUrl })
      .eq('id', sessionId);

    toast.success("Video uploaded! Waiting for other device...");

    // Check if both videos are uploaded
    const { data: session } = await supabase
      .from('sync_recording_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (session?.master_video_url && session?.client_video_url) {
      // Both videos ready - fetch them and complete
      const masterBlob = await fetch(session.master_video_url).then(r => r.blob());
      const clientBlob = await fetch(session.client_video_url).then(r => r.blob());
      
      const masterFile = new File([masterBlob], 'master.webm', { type: 'video/webm' });
      const clientFile = new File([clientBlob], 'client.webm', { type: 'video/webm' });
      
      onComplete(masterFile, clientFile);
      cleanup();
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied!");
  };

  // Cleanup
  const cleanup = () => {
    recorderRef.current.stopPreview();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    onClose();
  };

  useEffect(() => {
    return () => {
      recorderRef.current.stopPreview();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Synchronized Recording</DialogTitle>
        </DialogHeader>

        {!deviceRole ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose your device role to start synchronized recording
            </p>

            <div className="grid gap-3">
              <Button
                size="lg"
                onClick={createSession}
                className="h-auto py-4"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-bold">Create Session (Master)</div>
                  <div className="text-xs opacity-80">Generate code for other device</div>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Join Existing Session (Client)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <Button onClick={joinSession} disabled={inputCode.length !== 6}>
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Info */}
            <Card className="p-4 bg-muted">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    sessionStatus === 'connected' ? 'bg-green-500' :
                    sessionStatus === 'waiting' ? 'bg-yellow-500' :
                    sessionStatus === 'recording' ? 'bg-red-500 animate-pulse' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium capitalize">{sessionStatus}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {deviceRole === 'master' ? 'Master Device' : 'Client Device'}
                </span>
              </div>
              
              {deviceRole === 'master' && sessionStatus === 'waiting' && (
                <div className="mt-3">
                  <Label className="text-xs">Session Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-2xl font-bold tracking-wider bg-background px-3 py-2 rounded">
                      {sessionCode}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyCode}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this code with the other device
                  </p>
                </div>
              )}
            </Card>

            {/* Camera Preview */}
            {showCamera && (
              <Card className="overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full aspect-video bg-black"
                  autoPlay
                  playsInline
                  muted
                />
              </Card>
            )}

            {/* Controls */}
            <div className="space-y-2">
              {deviceRole === 'master' && sessionStatus === 'connected' && !isRecording && !recordedVideo && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={startRecording}
                >
                  <Circle className="h-5 w-5 mr-2 fill-current" />
                  Start Recording (Both Cameras)
                </Button>
              )}

              {isRecording && deviceRole === 'master' && (
                <Button
                  size="lg"
                  variant="destructive"
                  className="w-full"
                  onClick={stopRecording}
                >
                  <Square className="h-5 w-5 mr-2 fill-current" />
                  Stop Recording
                </Button>
              )}

              {isRecording && deviceRole === 'client' && (
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <Circle className="h-8 w-8 mx-auto mb-2 text-red-500 animate-pulse fill-current" />
                  <p className="font-medium">Recording in progress...</p>
                  <p className="text-xs text-muted-foreground">Master will stop recording</p>
                </div>
              )}

              {recordedVideo && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleComplete}
                >
                  Upload & Complete
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={cleanup}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
