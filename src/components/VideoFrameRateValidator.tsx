import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export interface FrameRateValidation {
  frameRate: number;
  isIdeal: boolean;        // >= 240fps
  isAcceptable: boolean;   // >= 120fps
  message: string;
  recommendation: string;
}

export function validateFrameRate(fps: number): FrameRateValidation {
  const frameRate = Math.round(fps);
  
  if (frameRate >= 240) {
    return {
      frameRate,
      isIdeal: true,
      isAcceptable: true,
      message: `Perfect! Video is ${frameRate}fps - ideal for tempo analysis!`,
      recommendation: 'No action needed - video quality is perfect!'
    };
  } else if (frameRate >= 120) {
    return {
      frameRate,
      isIdeal: false,
      isAcceptable: true,
      message: `Good! Video is ${frameRate}fps. 240fps is recommended for best accuracy.`,
      recommendation: 'For best results, try recording at 240fps next time.'
    };
  } else if (frameRate >= 60) {
    return {
      frameRate,
      isIdeal: false,
      isAcceptable: false,
      message: `Warning: Video is only ${frameRate}fps. Tempo analysis may be less accurate.`,
      recommendation: 'Please re-record at 240fps for accurate tempo analysis.'
    };
  } else {
    return {
      frameRate,
      isIdeal: false,
      isAcceptable: false,
      message: `Error: Video is only ${frameRate}fps. This is too low for tempo analysis.`,
      recommendation: 'Please re-record at 240fps for accurate tempo analysis. See instructions below.'
    };
  }
}

interface VideoFrameRateValidatorProps {
  validation: FrameRateValidation;
  onShowInstructions?: () => void;
}

export function VideoFrameRateValidator({ validation, onShowInstructions }: VideoFrameRateValidatorProps) {
  const getAlertVariant = () => {
    if (validation.isIdeal) return "default";
    if (validation.isAcceptable) return "default";
    return "destructive";
  };

  const getIcon = () => {
    if (validation.isIdeal) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (validation.isAcceptable) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <Alert variant={getAlertVariant()}>
      {getIcon()}
      <AlertTitle className="ml-2">
        {validation.isIdeal ? 'Perfect Frame Rate!' : validation.isAcceptable ? 'Good Frame Rate' : 'Frame Rate Too Low'}
      </AlertTitle>
      <AlertDescription className="ml-2 space-y-2">
        <p className="font-medium">{validation.message}</p>
        <p className="text-sm opacity-90">{validation.recommendation}</p>
        {!validation.isAcceptable && onShowInstructions && (
          <button
            onClick={onShowInstructions}
            className="text-sm font-medium underline hover:no-underline"
          >
            Show recording instructions →
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
