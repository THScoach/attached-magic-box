import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, User, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import hitsLogo from "@/assets/hits-logo-modern.png";

export default function FreeOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentLevel: "",
    yearsPlaying: "",
    primaryGoal: "",
    biggestChallenge: "",
    motivation: "",
    referralSource: ""
  });
  const [loading, setLoading] = useState(false);

  const progress = (step / 4) * 100;

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.currentLevel || !formData.yearsPlaying) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.primaryGoal || !formData.biggestChallenge) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be signed in to complete onboarding");
        navigate('/auth');
        return;
      }

      // Update profile with onboarding data
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          current_level: formData.currentLevel,
          years_playing: parseInt(formData.yearsPlaying) || null,
          primary_goal: formData.primaryGoal,
          biggest_challenge: formData.biggestChallenge,
          motivation: formData.motivation,
          referral_source: formData.referralSource,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast.error("Failed to save profile");
        setLoading(false);
        return;
      }

      // Create initial free membership if doesn't exist
      const { data: existingMembership } = await supabase
        .from('user_memberships')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingMembership) {
        await supabase
          .from('user_memberships')
          .insert({
            user_id: user.id,
            tier: 'free',
            status: 'active',
            swing_count: 0
          });
      }

      toast.success("Welcome to HITS! You have 10 free swing analyses.");
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={hitsLogo} 
            alt="HITS Logo" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome to HITS</h1>
          <p className="text-muted-foreground">
            Get 10 free swing analyses - no credit card required
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Let's get started</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us who you are
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use this for important updates about your training
                </p>
              </div>

              <div>
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <select
                  id="referralSource"
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  value={formData.referralSource}
                  onChange={(e) => updateField('referralSource', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="social_media">Social Media</option>
                  <option value="coach">My Coach</option>
                  <option value="friend">Friend/Teammate</option>
                  <option value="search">Google Search</option>
                  <option value="youtube">YouTube</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your experience</h2>
                <p className="text-sm text-muted-foreground">
                  Help us understand your skill level
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentLevel">Current Level *</Label>
                <select
                  id="currentLevel"
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  value={formData.currentLevel}
                  onChange={(e) => updateField('currentLevel', e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="youth">Youth (Under 13)</option>
                  <option value="high_school">High School</option>
                  <option value="college">College</option>
                  <option value="pro">Professional</option>
                  <option value="adult_rec">Adult Recreational</option>
                </select>
              </div>

              <div>
                <Label htmlFor="yearsPlaying">Years Playing Baseball *</Label>
                <Input
                  id="yearsPlaying"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="5"
                  value={formData.yearsPlaying}
                  onChange={(e) => updateField('yearsPlaying', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Challenges */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your goals</h2>
                <p className="text-sm text-muted-foreground">
                  What are you working towards?
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryGoal">Primary Goal *</Label>
                <Textarea
                  id="primaryGoal"
                  placeholder="E.g., Make varsity team, increase exit velocity, fix my swing path..."
                  value={formData.primaryGoal}
                  onChange={(e) => updateField('primaryGoal', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="biggestChallenge">Biggest Challenge *</Label>
                <Textarea
                  id="biggestChallenge"
                  placeholder="E.g., Inconsistent contact, rolling over, timing issues..."
                  value={formData.biggestChallenge}
                  onChange={(e) => updateField('biggestChallenge', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Motivation */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Target className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold">One last thing...</h2>
              <p className="text-muted-foreground">
                What drives you to improve?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="motivation">Your Motivation (Optional)</Label>
                <Textarea
                  id="motivation"
                  placeholder="E.g., I want to earn a college scholarship, prove doubters wrong, be the best player I can be..."
                  value={formData.motivation}
                  onChange={(e) => updateField('motivation', e.target.value)}
                  rows={4}
                />
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-2">You're getting:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span><strong>10 Free Swing Analyses</strong> - Full biomechanical breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span><strong>H.I.T.S. Scores</strong> - ANCHOR, ENGINE, and WHIP ratings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span><strong>Personalized Drills</strong> - Fix your #1 opportunity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span><strong>Coach Rick AI</strong> - 24/7 swing guidance</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                {step === 4 ? "Complete Setup" : "Continue"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
