import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Drill {
  id: string;
  name: string;
  pillar: string;
}

interface VideoTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { videoType: string; drillId?: string; drillName?: string }) => void;
  videoFileName?: string;
}

export function VideoTagModal({ open, onOpenChange, onSubmit, videoFileName }: VideoTagModalProps) {
  const [videoType, setVideoType] = useState<string>("practice");
  const [drillId, setDrillId] = useState<string>("");
  const [customDrillName, setCustomDrillName] = useState<string>("");
  const [drills, setDrills] = useState<Drill[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [useCustomDrill, setUseCustomDrill] = useState(false);

  useEffect(() => {
    const loadDrills = async () => {
      const { data } = await supabase
        .from('drills')
        .select('id, name, pillar')
        .order('name');
      
      if (data) {
        setDrills(data);
      }
    };

    if (open) {
      loadDrills();
    }
  }, [open]);

  const handleSubmit = () => {
    if (videoType === 'drill') {
      if (useCustomDrill) {
        if (!customDrillName.trim()) {
          return; // Don't submit without drill name
        }
        onSubmit({ videoType, drillName: customDrillName });
      } else {
        if (!drillId) {
          return; // Don't submit without selecting a drill
        }
        onSubmit({ videoType, drillId });
      }
    } else {
      onSubmit({ videoType });
    }
    
    // Reset form
    setVideoType("practice");
    setDrillId("");
    setCustomDrillName("");
    setUseCustomDrill(false);
  };

  const selectedDrill = drills.find(d => d.id === drillId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tag Your Video</DialogTitle>
          <DialogDescription>
            {videoFileName ? `Tagging: ${videoFileName}` : 'Help us track what type of video this is'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Video Type</Label>
            <RadioGroup value={videoType} onValueChange={setVideoType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="practice" id="practice" />
                <Label htmlFor="practice" className="font-normal cursor-pointer">
                  Practice - Regular practice session
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="drill" id="drill" />
                <Label htmlFor="drill" className="font-normal cursor-pointer">
                  Drill - Specific drill exercise
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="live_action" id="live_action" />
                <Label htmlFor="live_action" className="font-normal cursor-pointer">
                  Live Action - Game or live at-bats
                </Label>
              </div>
            </RadioGroup>
          </div>

          {videoType === 'drill' && (
            <div className="space-y-3">
              <Label>Select Drill</Label>
              
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="custom-drill"
                  checked={useCustomDrill}
                  onChange={(e) => {
                    setUseCustomDrill(e.target.checked);
                    if (e.target.checked) {
                      setDrillId("");
                    } else {
                      setCustomDrillName("");
                    }
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="custom-drill" className="font-normal cursor-pointer text-sm">
                  Enter custom drill name (not in database)
                </Label>
              </div>

              {useCustomDrill ? (
                <Input
                  placeholder="Enter drill name..."
                  value={customDrillName}
                  onChange={(e) => setCustomDrillName(e.target.value)}
                />
              ) : (
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-between"
                    >
                      {selectedDrill ? selectedDrill.name : "Search drills..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search drill..." />
                      <CommandList>
                        <CommandEmpty>No drill found.</CommandEmpty>
                        <CommandGroup>
                          {drills.map((drill) => (
                            <CommandItem
                              key={drill.id}
                              value={drill.name}
                              onSelect={() => {
                                setDrillId(drill.id);
                                setSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  drillId === drill.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center justify-between w-full">
                                <span>{drill.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {drill.pillar}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              
              {!useCustomDrill && (
                <p className="text-xs text-muted-foreground">
                  Select from our drill library to track effectiveness
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={videoType === 'drill' && !useCustomDrill && !drillId && !customDrillName}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
