import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Line, Circle, Text, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Pencil, 
  Circle as CircleIcon, 
  Minus, 
  Type, 
  Eraser, 
  Trash2, 
  Download,
  Undo,
  Redo
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoMarkupCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string;
}

const COLORS = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFFFFF", // White
  "#FFA500", // Orange
];

export function VideoMarkupCanvas({ videoRef, videoUrl }: VideoMarkupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "line" | "circle" | "text" | "eraser">("select");
  const [activeColor, setActiveColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: video.videoWidth || 640,
      height: video.videoHeight || 360,
      selection: activeTool === "select",
    });

    // Configure drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = lineWidth;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    // Save initial state
    saveHistory(canvas);

    return () => {
      canvas.dispose();
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!fabricCanvas || !videoRef.current) return;

    const video = videoRef.current;
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        fabricCanvas.setDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      }
    };

    video.addEventListener('loadedmetadata', updateCanvasSize);
    return () => video.removeEventListener('loadedmetadata', updateCanvasSize);
  }, [fabricCanvas, videoRef]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";

    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = lineWidth;
    }

    if (activeTool === "eraser") {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.on('mouse:down', handleEraserClick);
    } else {
      fabricCanvas.off('mouse:down', handleEraserClick);
    }

    if (activeTool === "line") {
      fabricCanvas.on('mouse:down', handleLineStart);
      fabricCanvas.on('mouse:move', handleLineMove);
      fabricCanvas.on('mouse:up', handleLineEnd);
    } else {
      fabricCanvas.off('mouse:down', handleLineStart);
      fabricCanvas.off('mouse:move', handleLineMove);
      fabricCanvas.off('mouse:up', handleLineEnd);
    }

    return () => {
      fabricCanvas.off('mouse:down');
      fabricCanvas.off('mouse:move');
      fabricCanvas.off('mouse:up');
    };
  }, [activeTool, activeColor, lineWidth, fabricCanvas]);

  const saveHistory = (canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => [...prev.slice(0, historyStep + 1), json]);
    setHistoryStep(prev => prev + 1);
  };

  const handleEraserClick = (e: any) => {
    if (!fabricCanvas) return;
    const target = fabricCanvas.findTarget(e.e);
    if (target && !target.isType('activeSelection')) {
      fabricCanvas.remove(target);
      saveHistory(fabricCanvas);
    }
  };

  const handleLineStart = (e: any) => {
    if (!fabricCanvas || isDrawingLine) return;
    const pointer = fabricCanvas.getPointer(e.e);
    setLineStart({ x: pointer.x, y: pointer.y });
    setIsDrawingLine(true);
  };

  const handleLineMove = (e: any) => {
    if (!fabricCanvas || !isDrawingLine || !lineStart) return;
    
    const pointer = fabricCanvas.getPointer(e.e);
    
    // Remove temporary line if exists
    const objects = fabricCanvas.getObjects();
    const tempLine = objects.find((obj: any) => obj.tempLine);
    if (tempLine) {
      fabricCanvas.remove(tempLine);
    }

    // Draw temporary line
    const line = new Line([lineStart.x, lineStart.y, pointer.x, pointer.y], {
      stroke: activeColor,
      strokeWidth: lineWidth,
      selectable: false,
      evented: false,
    });
    (line as any).tempLine = true;
    fabricCanvas.add(line);
    fabricCanvas.renderAll();
  };

  const handleLineEnd = (e: any) => {
    if (!fabricCanvas || !isDrawingLine || !lineStart) return;
    
    const pointer = fabricCanvas.getPointer(e.e);
    
    // Remove temporary line
    const objects = fabricCanvas.getObjects();
    const tempLine = objects.find((obj: any) => obj.tempLine);
    if (tempLine) {
      fabricCanvas.remove(tempLine);
    }

    // Add permanent line
    const line = new Line([lineStart.x, lineStart.y, pointer.x, pointer.y], {
      stroke: activeColor,
      strokeWidth: lineWidth,
      selectable: true,
    });
    fabricCanvas.add(line);
    fabricCanvas.renderAll();
    
    setIsDrawingLine(false);
    setLineStart(null);
    saveHistory(fabricCanvas);
  };

  const handleAddCircle = () => {
    if (!fabricCanvas) return;

    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      stroke: activeColor,
      strokeWidth: lineWidth,
      fill: "transparent",
    });
    
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    saveHistory(fabricCanvas);
  };

  const handleAddText = () => {
    if (!fabricCanvas) return;

    const text = new Text("Text", {
      left: 100,
      top: 100,
      fill: activeColor,
      fontSize: 24,
      fontWeight: "bold",
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    saveHistory(fabricCanvas);
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    saveHistory(fabricCanvas);
    toast({
      title: "Canvas cleared",
      description: "All annotations have been removed.",
    });
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const prevState = history[historyStep - 1];
      if (fabricCanvas && prevState) {
        fabricCanvas.loadFromJSON(JSON.parse(prevState), () => {
          fabricCanvas.renderAll();
        });
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      const nextState = history[historyStep + 1];
      if (fabricCanvas && nextState) {
        fabricCanvas.loadFromJSON(JSON.parse(nextState), () => {
          fabricCanvas.renderAll();
        });
      }
    }
  };

  const handleDownload = () => {
    if (!fabricCanvas || !videoRef.current) return;

    // Create a temporary canvas to combine video frame and annotations
    const tempCanvas = document.createElement('canvas');
    const video = videoRef.current;
    tempCanvas.width = fabricCanvas.width || 640;
    tempCanvas.height = fabricCanvas.height || 360;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      // Draw current video frame
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw annotations on top
      const canvasElement = fabricCanvas.getElement();
      ctx.drawImage(canvasElement, 0, 0);
      
      // Download
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `swing-analysis-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image saved!",
            description: "Your annotated frame has been downloaded.",
          });
        }
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Video Markup Tools</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyStep <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTool === "select" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("select")}
        >
          Select
        </Button>
        <Button
          variant={activeTool === "draw" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("draw")}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Draw
        </Button>
        <Button
          variant={activeTool === "line" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("line")}
        >
          <Minus className="h-4 w-4 mr-2" />
          Line
        </Button>
        <Button
          variant={activeTool === "circle" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTool("circle");
            handleAddCircle();
          }}
        >
          <CircleIcon className="h-4 w-4 mr-2" />
          Circle
        </Button>
        <Button
          variant={activeTool === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTool("text");
            handleAddText();
          }}
        >
          <Type className="h-4 w-4 mr-2" />
          Text
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("eraser")}
        >
          <Eraser className="h-4 w-4 mr-2" />
          Eraser
        </Button>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                activeColor === color ? "border-foreground scale-110" : "border-muted"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setActiveColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Line Width */}
      <div className="space-y-2">
        <Label>Line Width: {lineWidth}px</Label>
        <Slider
          value={[lineWidth]}
          onValueChange={(value) => setLineWidth(value[0])}
          min={1}
          max={10}
          step={1}
        />
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-10 pointer-events-auto" />
      </div>
    </Card>
  );
}
