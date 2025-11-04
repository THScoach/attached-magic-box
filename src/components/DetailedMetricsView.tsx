import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ResearchBenchmarks } from "@/components/ResearchBenchmarks";
import { VelocityChart } from "@/components/VelocityChart";
import { JointDataViewer } from "@/components/JointDataViewer";
import { MomentumMetrics } from "@/components/MomentumMetrics";
import { SwingAnalysis } from "@/types/swing";
import type { FrameJointData } from "@/lib/poseAnalysis";

interface DetailedMetricsViewProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SwingAnalysis;
  jointData: FrameJointData[];
  videoWidth?: number;
  videoHeight?: number;
}

export function DetailedMetricsView({
  isOpen,
  onClose,
  analysis,
  jointData,
  videoWidth = 1920,
  videoHeight = 1080
}: DetailedMetricsViewProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Detailed Biomechanics</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Momentum & Biomechanics */}
          <MomentumMetrics analysis={analysis} />
          
          {/* Research-Validated Benchmarks */}
          <ResearchBenchmarks analysis={analysis} />

          {/* Kinematic Sequence Graph */}
          <VelocityChart analysis={analysis} />

          {/* Advanced Joint Data */}
          {jointData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Frame-by-Frame Analysis</h3>
              <JointDataViewer
                frameData={jointData}
                videoWidth={videoWidth}
                videoHeight={videoHeight}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
