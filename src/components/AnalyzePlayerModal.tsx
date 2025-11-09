import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerSelector } from "@/components/PlayerSelector";
import { useNavigate } from "react-router-dom";
import { Camera, Upload } from "lucide-react";

interface AnalyzePlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyzePlayerModal({ open, onOpenChange }: AnalyzePlayerModalProps) {
  const navigate = useNavigate();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleAnalyze = (action: 'record' | 'upload') => {
    if (!selectedPlayerId) return;

    // Store the selected player in sessionStorage
    sessionStorage.setItem('selectedPlayerId', selectedPlayerId);

    // Navigate to reboot analysis page
    navigate('/reboot-analysis');
    
    // Close the modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analyze Player</DialogTitle>
          <DialogDescription>
            Select a player to record or upload their swing analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <PlayerSelector
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
          />

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => handleAnalyze('record')}
              disabled={!selectedPlayerId}
              className="w-full"
            >
              <Camera className="mr-2 h-5 w-5" />
              Record New Swing
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleAnalyze('upload')}
              disabled={!selectedPlayerId}
              className="w-full"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Video
            </Button>
          </div>

          {!selectedPlayerId && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a player to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
