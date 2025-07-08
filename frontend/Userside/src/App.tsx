import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import SubmitComplaint from "./components/SubmitComplaint";
import TrackComplaint from "./components/TrackComplaint";
import PublicComplaints from "./components/PublicComplaints";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Profile from "./components/Profile";
import FeedbackPage from "./components/FeedbackPage";
import HelpPage from "./components/HelpPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/public" element={<PublicComplaints />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/terms" element={<div>Terms of Service</div>} />
              <Route path="/privacy" element={<div>Privacy Policy</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;