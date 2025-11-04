import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserRole } from "@/hooks/useUserRole";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Loader2, TrendingUp, Target, Trophy } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    birthDate: undefined as Date | undefined,
    heightFeet: "",
    heightInches: "",
    weight: "",
    battingHand: "",
    positions: [] as string[],
    experienceLevel: "",
    primaryGoal: "",
  });

  useEffect(() => {
    // Redirect coaches and admins away from onboarding
    if (!roleLoading && (role === "coach" || role === "admin")) {
      navigate("/coach-dashboard", { replace: true });
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    // Check if user already completed onboarding
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/dashboard", { replace: true });
      }
    };

    if (!roleLoading && role === "athlete") {
      checkOnboarding();
    }
  }, [roleLoading, role, navigate]);

  const progress = (currentStep / 3) * 100;

  const handleNext = () => {
    // Validation for Step 1
    if (currentStep === 1) {
      if (!profileData.fullName.trim()) {
        toast.error("Please enter your full name");
        return;
      }
      if (!profileData.birthDate) {
        toast.error("Please select your birth date");
        return;
      }
      if (!profileData.heightFeet || !profileData.heightInches) {
        toast.error("Please enter your height");
        return;
      }
      const feet = parseInt(profileData.heightFeet);
      const inches = parseInt(profileData.heightInches);
      if (feet < 4 || feet > 7 || inches < 0 || inches > 11) {
        toast.error("Please enter a valid height (4'0\" - 7'0\")");
        return;
      }
      if (!profileData.weight) {
        toast.error("Please enter your weight");
        return;
      }
      const weight = parseInt(profileData.weight);
      if (weight < 50 || weight > 400) {
        toast.error("Please enter a valid weight (50-400 lbs)");
        return;
      }
    }

    // Validation for Step 2
    if (currentStep === 2) {
      if (!profileData.battingHand) {
        toast.error("Please select your batting hand");
        return;
      }
      if (!profileData.experienceLevel) {
        toast.error("Please select your experience level");
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const togglePosition = (position: string) => {
    const positions = profileData.positions.includes(position)
      ? profileData.positions.filter(p => p !== position)
      : [...profileData.positions, position];
    updateField("positions", positions);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Calculate total height in inches
      const totalHeightInches = parseInt(profileData.heightFeet) * 12 + parseInt(profileData.heightInches);

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.fullName.split(" ")[0] || profileData.fullName,
          last_name: profileData.fullName.split(" ").slice(1).join(" ") || "",
          birth_date: profileData.birthDate?.toISOString().split('T')[0],
          height_inches: totalHeightInches,
          weight_lbs: parseInt(profileData.weight),
          batting_hand: profileData.battingHand,
          position: profileData.positions,
          experience_level: profileData.experienceLevel,
          primary_goal: profileData.primaryGoal || null,
          onboarding_completed: true,
          profile_last_updated: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile complete! Let's analyze your swing.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to H.I.T.S. Analyzer</h1>
            <p className="text-muted-foreground">
              Let's set up your athlete profile for personalized swing analysis
            </p>
          </div>

          <Progress value={progress} className="mb-8" />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Personal Information
                </h2>
                <p className="text-muted-foreground">
                  This helps us provide accurate momentum-based calculations
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={profileData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Birth Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1.5",
                          !profileData.birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {profileData.birthDate ? format(profileData.birthDate, "PPP") : "Select birth date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={profileData.birthDate}
                        onSelect={(date) => updateField("birthDate", date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heightFeet">Height (feet) *</Label>
                    <Input
                      id="heightFeet"
                      type="number"
                      placeholder="5"
                      min="4"
                      max="7"
                      value={profileData.heightFeet}
                      onChange={(e) => updateField("heightFeet", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heightInches">Height (inches) *</Label>
                    <Input
                      id="heightInches"
                      type="number"
                      placeholder="10"
                      min="0"
                      max="11"
                      value={profileData.heightInches}
                      onChange={(e) => updateField("heightInches", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="150"
                    min="50"
                    max="400"
                    value={profileData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Baseball Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Baseball Information
                </h2>
                <p className="text-muted-foreground">
                  Help us understand your playing style
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Batting Hand *</Label>
                  <RadioGroup
                    value={profileData.battingHand}
                    onValueChange={(value) => updateField("battingHand", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right" className="font-normal cursor-pointer">Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left" className="font-normal cursor-pointer">Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="switch" id="switch" />
                      <Label htmlFor="switch" className="font-normal cursor-pointer">Switch</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Position(s)</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Pitcher", "Catcher", "First Base", "Second Base",
                      "Third Base", "Shortstop", "Outfield", "Designated Hitter"
                    ].map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={position}
                          checked={profileData.positions.includes(position)}
                          onCheckedChange={() => togglePosition(position)}
                        />
                        <Label htmlFor={position} className="font-normal cursor-pointer">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select
                    value={profileData.experienceLevel}
                    onValueChange={(value) => updateField("experienceLevel", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (6-10 years)</SelectItem>
                      <SelectItem value="elite">Elite (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Your Goals
                </h2>
                <p className="text-muted-foreground">
                  What do you want to achieve with H.I.T.S.?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryGoal">Primary Goal</Label>
                  <Select
                    value={profileData.primaryGoal}
                    onValueChange={(value) => updateField("primaryGoal", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase_bat_speed">Increase bat speed</SelectItem>
                      <SelectItem value="improve_mechanics">Improve mechanics</SelectItem>
                      <SelectItem value="fix_swing_issues">Fix swing issues</SelectItem>
                      <SelectItem value="prepare_for_season">Prepare for season</SelectItem>
                      <SelectItem value="general_improvement">General improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-secondary/50 p-4 border-primary/20">
                  <h3 className="font-semibold mb-2">Why height & weight matter:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Required for momentum-based calculations</li>
                    <li>• Used for biomechanics analysis</li>
                    <li>• Helps personalize training recommendations</li>
                    <li>• Critical for accurate bat speed and power metrics</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep < 3 && (
                <Button onClick={handleNext}>
                  Continue
                </Button>
              )}

              {currentStep === 3 && (
                <Button onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground"
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
