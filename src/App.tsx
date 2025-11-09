// TODO: Replace placeholder GoHighLevel and Coachly URLs once finalized.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { RoleGuard } from "./components/RoleGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CelebrationProvider } from "./components/CelebrationProvider";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import TrainInPerson from "./pages/TrainInPerson";
import RemoteTraining from "./pages/RemoteTraining";
import Community from "./pages/Community";
import FreeTempoAssessment from "./pages/FreeTempoAssessment";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RequestDemo from "./pages/RequestDemo";
import BookCall from "./pages/BookCall";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import AnalysisResult from "./pages/AnalysisResult";
import Progress from "./pages/Progress";
import Comparison from "./pages/Comparison";
import Reports from "@/pages/Reports";
import DemoReport from "@/pages/DemoReport";
import Drills from "./pages/Drills";
import Training from "./pages/Training";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import CoachAuth from "./pages/CoachAuth";
import CoachDashboard from "./pages/CoachDashboard";
import LiveCoaching from "./pages/LiveCoaching";
import CoachRoster from "./pages/CoachRoster";
import AthleteProfileDashboard from "./pages/AthleteProfileDashboard";
import ParentPortal from "./pages/ParentPortal";
import VideoComparison from "./pages/VideoComparison";
import TeamAnalytics from "./pages/TeamAnalytics";
import PlayerProfile from "./pages/PlayerProfile";
import Goals from "./pages/Goals";
import FreeOnboarding from "./pages/FreeOnboarding";
import RebootAnalysis from "./pages/RebootAnalysis";
import Challenges from "./pages/Challenges";
import VideoLibrary from "./pages/VideoLibrary";
import Timeline from "./pages/Timeline";
import TierDemo from "./pages/TierDemo";
import FourBsScorecard from "./pages/FourBsScorecard";
import FourBApp from "./pages/FourBApp";
import BrainDashboard from "./pages/BrainDashboard";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Admin pages (lazy loaded for better performance)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminPlayers = lazy(() => import("./pages/admin/AdminPlayers"));
const AdminPlayerDetail = lazy(() => import("./pages/admin/AdminPlayerDetail"));
const AdminRoster = lazy(() => import("./pages/admin/AdminRoster"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const AdminAnalyses = lazy(() => import("./pages/admin/AdminAnalyses"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminComparisons = lazy(() => import("./pages/admin/AdminComparisons"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminTest = lazy(() => import("./pages/admin/AdminTest"));

const App = () => {
  // Set dark mode by default to match landing page branding
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CelebrationProvider />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/4b-app" element={<FourBApp />} />
            <Route path="/train-in-person" element={<TrainInPerson />} />
            <Route path="/programs" element={<Navigate to="/train-in-person" replace />} />
            <Route path="/remote-training" element={<RemoteTraining />} />
            <Route path="/community" element={<Community />} />
            <Route path="/free-tempo-assessment" element={<FreeTempoAssessment />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/request-demo" element={<RequestDemo />} />
            <Route path="/book-call" element={<BookCall />} />
            
            {/* Coach authentication */}
            <Route path="/coach-auth" element={<CoachAuth />} />
            
            {/* Athlete authentication */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes - New comprehensive admin dashboard */}
            <Route path="/admin" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminOverview />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/players" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminPlayers />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/players/:id" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminPlayerDetail />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/roster" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminRoster />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/calendar" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminCalendar />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/analyses" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminAnalyses />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/analytics" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminAnalytics />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/comparisons" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminComparisons />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/reports" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminReports />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/settings" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminSettings />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/test" element={
              <AuthGuard>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminTest />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </AuthGuard>
            } />
            
            {/* Old Admin Route - Keep for backwards compatibility */}
            <Route path="/admin-old" element={
              <AuthGuard>
                <RoleGuard allowedRoles={["admin"]}>
                  <Admin />
                </RoleGuard>
              </AuthGuard>
            } />
            
            {/* Coach Routes */}
            <Route 
              path="/coach-dashboard" 
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={["coach"]}>
                    <CoachDashboard />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            <Route 
              path="/coach-roster" 
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={["coach"]}>
                    <CoachRoster />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            <Route 
              path="/coach/athlete/:athleteId" 
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={["coach"]}>
                    <AthleteProfileDashboard />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            
            {/* Parent Portal Route */}
            <Route path="/parent-portal" element={<ProtectedRoute><ParentPortal /></ProtectedRoute>} />
            <Route path="/video-comparison" element={<ProtectedRoute><VideoComparison /></ProtectedRoute>} />
            <Route 
              path="/team-analytics" 
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={["coach"]}>
                    <TeamAnalytics />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            
            {/* Athlete/General Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            {/* Legacy free onboarding - redirect to main onboarding */}
            <Route path="/free-onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/result/:id" element={<ProtectedRoute><AnalysisResult /></ProtectedRoute>} />
            <Route path="/player/:playerId" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />
            <Route path="/player/:playerId/analysis/:analysisId" element={<ProtectedRoute><AnalysisResult /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/demo-report" element={<DemoReport />} />
            <Route path="/drills" element={<ProtectedRoute><Drills /></ProtectedRoute>} />
            <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/live-coaching" element={<ProtectedRoute><LiveCoaching /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/video-library" element={<ProtectedRoute><VideoLibrary /></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/reboot-analysis" element={<ProtectedRoute><RebootAnalysis /></ProtectedRoute>} />
            <Route path="/4bs" element={<ProtectedRoute><FourBsScorecard /></ProtectedRoute>} />
            <Route path="/scorecard" element={<ProtectedRoute><FourBsScorecard /></ProtectedRoute>} />
            <Route path="/brain/:playerId" element={<ProtectedRoute><BrainDashboard /></ProtectedRoute>} />
            <Route path="/tier-demo" element={<TierDemo />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
