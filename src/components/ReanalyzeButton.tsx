import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReanalyzeButtonProps {
  analysisId: string;
  createdAt: string;
  onReanalysisComplete?: () => void;
}

export function ReanalyzeButton({ analysisId, createdAt, onReanalysisComplete }: ReanalyzeButtonProps) {
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Only show for analyses created before the fix (before 2025-11-03 21:00 UTC)
  const analysisFixDate = new Date('2025-11-03T21:00:00Z');
  const analysisDate = new Date(createdAt);
  
  if (analysisDate >= analysisFixDate) {
    return null; // Don't show button for analyses after the fix
  }

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('reanalyze-swing', {
        body: { analysisId }
      });

      if (error) {
        console.error('Reanalysis error:', error);
        toast.error('Failed to re-analyze video', {
          description: error.message || 'Please try again'
        });
        return;
      }

      toast.success('Video re-analyzed successfully!', {
        description: 'A new analysis with corrected FPS calculations has been created.'
      });

      // Refresh the analysis list or navigate to new result
      if (onReanalysisComplete) {
        onReanalysisComplete();
      } else {
        // Navigate to the new analysis result
        if (data?.newAnalysisId) {
          window.location.href = `/result/${data.newAnalysisId}`;
        } else {
          // Refresh current page
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Re-analyze with Correct FPS
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Re-analyze Video with Corrected FPS?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This analysis was created before we fixed the frame rate calculation issue. 
              Re-analyzing will create a new report with correct tempo calculations.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p className="font-medium">What will be corrected:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Accurate frame rate detection (240fps for uploaded videos)</li>
                <li>Correct timing calculations for Load and Fire phases</li>
                <li>More precise tempo ratio measurements</li>
                <li>Improved absolute timing values (ms before contact)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              The original analysis will be preserved for comparison.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReanalyze}
            disabled={isReanalyzing}
          >
            {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze Video'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
