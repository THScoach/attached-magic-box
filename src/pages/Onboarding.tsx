import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight, ChevronLeft, User, Activity, Target } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  // Form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    height: "",
    weight: "",
    battingHand: "right",
    throwingHand: "right",
    position: "",
    experienceLevel: "intermediate",
    goals: "",
  });

  useEffect(() => {
    // Redirect non-athletes
    if (!roleLoading && (role === "coach" || role === "admin")) {
      navigate("/coach-dashboard");
      return;
    }

    // Check if already completed onboarding
    checkOnboardingStatus();
  }, [role, roleLoading, navigate]);

  const checkOnboardingStatus = async () => {
    if (roleLoading) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 2) {
      if (!profileData.firstName || !profileData.lastName || !profileData.email) {
        toast.error("Please fill out all required fields");
        return;
      }
    }
    if (currentStep === 3) {
      if (!profileData.age || !profileData.height || !profileData.weight) {
        toast.error("Please fill out all required fields");
        return;
      }
    }
    if (currentStep === 4) {
      if (!profileData.position) {
        toast.error("Please select your primary position");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Calculate birth year from age
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(profileData.age);
      const birthDate = `${birthYear}-01-01`;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Create or update player
      const { error: playerError } = await supabase
        .from("players")
        .upsert({
          user_id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          birth_date: birthDate,
          height: parseFloat(profileData.height),
          weight: parseFloat(profileData.weight),
          handedness: profileData.battingHand,
          throws: profileData.throwingHand,
          position: profileData.position,
        });

      if (playerError) throw playerError;

      toast.success("Welcome to HITS! 🎉", {
        description: "Your profile has been created successfully.",
      });

      navigate("/home");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          {/* Step 1: Welcome Video */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">Welcome to HITS! 🎉</CardTitle>
                <CardDescription className="text-base">
                  Watch this quick message from Coach Rick
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Player - Temporarily showing Coach Rick image until video is uploaded */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Coach Rick Says:</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        "Welcome to HITS! I'm excited to help you transform your swing using cutting-edge biomechanics. 
                        Let's get your profile set up so we can start personalizing your training."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Welcome Text */}
                <div className="text-center space-y-2">
                  <p className="text-lg">
                    Your subscription is active and you're ready to transform your swing!
                  </p>
                  <p className="text-muted-foreground">
                    Let's set up your profile so we can personalize your training experience.
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleNext}
                  className="w-full"
                  size="lg"
                >
                  Let's Get Started
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Basic Information</span>
                </div>
                <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
                <CardDescription>
                  We'll use this to personalize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Physical Stats */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Physical Stats</span>
                </div>
                <CardTitle className="text-2xl">Your measurements</CardTitle>
                <CardDescription>
                  This helps us calculate momentum and power metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="16"
                    min="8"
                    max="99"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="72"
                    min="48"
                    max="96"
                    value={profileData.height}
                    onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: 6'0" = 72 inches, 5'10" = 70 inches
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="180"
                    min="50"
                    max="400"
                    value={profileData.weight}
                    onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Baseball Details */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Baseball Details</span>
                </div>
                <CardTitle className="text-2xl">Your playing style</CardTitle>
                <CardDescription>
                  Tell us how you play the game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="battingHand">Batting Hand</Label>
                    <Select
                      value={profileData.battingHand}
                      onValueChange={(value) => setProfileData({ ...profileData, battingHand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="throwingHand">Throwing Hand</Label>
                    <Select
                      value={profileData.throwingHand}
                      onValueChange={(value) => setProfileData({ ...profileData, throwingHand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Primary Position *</Label>
                  <Select
                    value={profileData.position}
                    onValueChange={(value) => setProfileData({ ...profileData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="catcher">Catcher</SelectItem>
                      <SelectItem value="first-base">First Base</SelectItem>
                      <SelectItem value="second-base">Second Base</SelectItem>
                      <SelectItem value="third-base">Third Base</SelectItem>
                      <SelectItem value="shortstop">Shortstop</SelectItem>
                      <SelectItem value="outfield">Outfield</SelectItem>
                      <SelectItem value="pitcher">Pitcher</SelectItem>
                      <SelectItem value="dh">Designated Hitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Experience & Goals */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-medium">Experience & Goals</span>
                </div>
                <CardTitle className="text-2xl">Almost done!</CardTitle>
                <CardDescription>
                  Help us tailor your training program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={profileData.experienceLevel}
                    onValueChange={(value) => setProfileData({ ...profileData, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (6+ years)</SelectItem>
                      <SelectItem value="elite">Elite (College/Pro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Training Goals (Optional)</Label>
                  <Textarea
                    id="goals"
                    className="min-h-[120px]"
                    placeholder="What do you want to improve? (e.g., increase bat speed, fix swing mechanics, improve consistency)"
                    value={profileData.goals}
                    onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 The more specific you are, the better we can help!
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index + 1 === currentStep
                  ? 'bg-primary'
                  : index + 1 < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
