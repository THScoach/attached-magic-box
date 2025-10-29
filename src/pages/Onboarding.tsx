import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, User, BarChart3, ChevronRight, Camera, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import hitsLogo from "@/assets/hits-logo-modern.png";
import { useUserRole } from "@/hooks/useUserRole";

export default function Onboarding() {
  const navigate = useNavigate();
  const { role, loading: roleLoading, isCoach, isAdmin } = useUserRole();
  const [step, setStep] = useState(1);
  const [athleteInfo, setAthleteInfo] = useState({
    name: "",
    birthDate: undefined as Date | undefined,
    position: "",
    handedness: "",
  });
  const [videos, setVideos] = useState<File[]>([]);

  // Redirect coaches/admins immediately
  useEffect(() => {
    if (!roleLoading && (isCoach || isAdmin)) {
      localStorage.setItem('onboardingComplete', 'true');
      if (isCoach) {
        navigate('/coach-dashboard');
      } else if (isAdmin) {
        navigate('/admin');
      }
    }
  }, [roleLoading, isCoach, isAdmin, navigate]);

  const progress = (step / 4) * 100;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!athleteInfo.name) {
        toast.error("Please enter your name");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (videos.length === 0) {
        toast.error("Please upload at least one swing video");
        return;
      }
      // Store athlete info
      localStorage.setItem('athleteInfo', JSON.stringify(athleteInfo));
      localStorage.setItem('onboardingComplete', 'true');
      setStep(4);
    } else if (step === 4) {
      // Redirect to analyze page with onboarding flag
      navigate('/analyze?from=onboarding');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (videos.length + files.length > 5) {
      toast.error("Maximum 5 videos allowed");
      return;
    }
    setVideos([...videos, ...files]);
    toast.success(`${files.length} video(s) added`);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 flex items-center justify-center">
        <Card className="p-8">
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

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
            Let's get you set up in 4 simple steps
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

        {/* Step 1: Welcome Message */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold">Welcome to H.I.T.S. Analyzer!</h2>
              
              {/* Video Placeholder */}
              <Card className="p-8 bg-zinc-900 border-zinc-700">
                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">🎥</div>
                    <p className="text-sm text-muted-foreground">Welcome Video</p>
                    <p className="text-xs text-muted-foreground">(Video will be placed here)</p>
                  </div>
                </div>
              </Card>
              
              <div className="text-left space-y-4 max-w-xl mx-auto">
                <p className="text-foreground leading-relaxed">
                  I'm excited to have you here! The H.I.T.S. Analyzer is built on cutting-edge biomechanics 
                  research to help you understand and improve your swing like never before.
                </p>
                
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h3 className="font-bold mb-3">What You'll Get:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span><strong>54+ Biomechanical Metrics</strong> - Deep analysis of every aspect of your swing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span><strong>The Three Pillars</strong> - ANCHOR (stability), ENGINE (tempo), and WHIP (release)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span><strong>Personalized Drills</strong> - Targeted exercises to fix your #1 opportunity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span><strong>Coach Rick AI</strong> - Get instant answers to your swing questions</span>
                    </li>
                  </ul>
                </Card>
                
                <p className="text-muted-foreground text-sm italic">
                  - From The Hitting Skool Team
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Athlete Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tell us about yourself</h2>
                <p className="text-sm text-muted-foreground">
                  Basic information to personalize your experience
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={athleteInfo.name}
                  onChange={(e) => setAthleteInfo({ ...athleteInfo, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !athleteInfo.birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {athleteInfo.birthDate ? (
                          format(athleteInfo.birthDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={athleteInfo.birthDate}
                        onSelect={(date) => setAthleteInfo({ ...athleteInfo, birthDate: date })}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Shortstop"
                    value={athleteInfo.position}
                    onChange={(e) => setAthleteInfo({ ...athleteInfo, position: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="handedness">Batting Stance</Label>
                <select
                  id="handedness"
                  className="w-full px-4 py-2 rounded-md border bg-background"
                  value={athleteInfo.handedness}
                  onChange={(e) => setAthleteInfo({ ...athleteInfo, handedness: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="right">Right-handed</option>
                  <option value="left">Left-handed</option>
                  <option value="switch">Switch hitter</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Videos */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Upload Your Swings</h2>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 swing videos
                </p>
              </div>
            </div>

            <Card className="p-6 bg-blue-500/10 border-blue-500/20">
              <p className="text-sm text-foreground">
                <strong>💡 Pro Tip:</strong> We get more accurate data and better insights with more swings. 
                Upload 3-5 videos for the best analysis!
              </p>
            </Card>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  Upload Videos ({videos.length}/5)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to upload or drag and drop
                </p>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={videos.length >= 5}
                />
                <Button 
                  onClick={() => document.getElementById('video-upload')?.click()}
                  disabled={videos.length >= 5}
                >
                  Choose Videos
                </Button>
              </div>

              {/* Video List */}
              {videos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Uploaded Videos:</h4>
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm truncate flex-1">{video.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVideo(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Ready to Analyze */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center">
              <div className="p-4 rounded-full bg-green-500/10">
                <BarChart3 className="h-16 w-16 text-green-500" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-muted-foreground">
                Your profile is ready. Let's analyze your swings and see your H.I.T.S. scores!
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-muted-foreground">Pillars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{videos.length}</div>
                  <div className="text-xs text-muted-foreground">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">54+</div>
                  <div className="text-xs text-muted-foreground">Metrics</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {step === 4 ? "Start Analyzing" : step === 1 ? "Get Started" : "Continue"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>

        {/* Skip Option */}
        {step < 4 && step > 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                localStorage.setItem('onboardingComplete', 'true');
                navigate('/');
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
