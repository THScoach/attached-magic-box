import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { RoleGuard } from "./components/RoleGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CelebrationProvider } from "./components/CelebrationProvider";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import Programs from "./pages/Programs";
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
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Challenges from "./pages/Challenges";
import VideoLibrary from "./pages/VideoLibrary";
import Timeline from "./pages/Timeline";
import TierDemo from "./pages/TierDemo";
import FourBsScorecard from "./pages/FourBsScorecard";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Admin pages (lazy loaded for better performance)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminPlayers = lazy(() => import("./pages/admin/AdminPlayers"));
const AdminPlayerDetail = lazy(() => import("./pages/admin/AdminPlayerDetail"));
const AdminRoster = lazy(() => import("./pages/admin/AdminRoster"));
const AdminAnalyses = lazy(() => import("./pages/admin/AdminAnalyses"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminComparisons = lazy(() => import("./pages/admin/AdminComparisons"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminTest = lazy(() => import("./pages/admin/AdminTest"));

const queryClient = new QueryClient();

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
            <Route path="/programs" element={<Programs />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/request-demo" element={<RequestDemo />} />
            <Route path="/book-call" element={<BookCall />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/coach-auth" element={<CoachAuth />} />
            
            {/* Admin Routes - New comprehensive admin dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminOverview />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/players" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminPlayers />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/players/:id" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminPlayerDetail />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/roster" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminRoster />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/analyses" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminAnalyses />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminAnalytics />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/comparisons" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminComparisons />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminReports />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminSettings />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/test" element={
              <ProtectedRoute>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <AdminLayout>
                    <RoleGuard allowedRoles={["admin", "coach"]}>
                      <AdminTest />
                    </RoleGuard>
                  </AdminLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            
            {/* Old Admin Route - Keep for backwards compatibility */}
            <Route path="/admin-old" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]}>
                  <Admin />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Coach Routes */}
            <Route 
              path="/coach-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["coach"]}>
                    <CoachDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coach-roster" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["coach"]}>
                    <CoachRoster />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coach/athlete/:athleteId" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["coach"]}>
                    <AthleteProfileDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            
            {/* Parent Portal Route */}
            <Route path="/parent-portal" element={<ProtectedRoute><ParentPortal /></ProtectedRoute>} />
            <Route path="/video-comparison" element={<ProtectedRoute><VideoComparison /></ProtectedRoute>} />
            <Route 
              path="/team-analytics" 
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={["coach"]}>
                    <TeamAnalytics />
                  </RoleGuard>
                </ProtectedRoute>
              } 
            />
            
            {/* Athlete/General Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/free-onboarding" element={<ProtectedRoute><FreeOnboarding /></ProtectedRoute>} />
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
            <Route path="/4bs" element={<ProtectedRoute><FourBsScorecard /></ProtectedRoute>} />
            <Route path="/scorecard" element={<ProtectedRoute><FourBsScorecard /></ProtectedRoute>} />
            <Route path="/tier-demo" element={<TierDemo />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
