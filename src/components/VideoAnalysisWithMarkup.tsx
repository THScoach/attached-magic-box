import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Maximize2 } from "lucide-react";
import { VideoMarkupCanvas } from "./VideoMarkupCanvas";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoAnalysisWithMarkupProps {
  videoUrl: string;
  title?: string;
  description?: string;
}

export function VideoAnalysisWithMarkup({ 
  videoUrl, 
  title = "Video Analysis",
  description = "Review your swing and add annotations"
}: VideoAnalysisWithMarkupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    if (isPlaying) {
      videoRef.current.play();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="video">Video Only</TabsTrigger>
              <TabsTrigger value="markup">Markup Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full"
                  playsInline
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="lg" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={handleFullscreen}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="markup" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full"
                  playsInline
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <Button variant="outline" size="icon" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="lg" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>

              <VideoMarkupCanvas videoRef={videoRef} videoUrl={videoUrl} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              className="w-full h-full"
              controls
              playsInline
              autoPlay={isPlaying}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
