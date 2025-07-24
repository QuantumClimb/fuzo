import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ChatList from "./pages/ChatList";
import ChatConversation from "./pages/ChatConversation";
import Plate from "./pages/Plate";
import Onboarding from "./components/Onboarding";
import { hasSeenOnboarding } from "./lib/utils";

const queryClient = new QueryClient();

// DEMO MODE: Set this to true to always show onboarding (for investors)
const DEMO_MODE = true;

const App = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, always show onboarding
      setShowOnboarding(true);
    } else {
      // In normal mode, check if user has seen onboarding before
      if (!hasSeenOnboarding()) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    // Only save to localStorage if not in demo mode
    if (!DEMO_MODE) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  // Quick bypass for development - double-click logo area to skip onboarding
  const handleQuickBypass = (e: React.MouseEvent) => {
    if (e.detail === 2) { // double-click
      console.log('Quick bypass activated - skipping onboarding');
      setShowOnboarding(false);
    }
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="relative">
            {showOnboarding ? (
              <div onClick={handleQuickBypass}>
                <Onboarding onFinish={handleOnboardingFinish} />
              </div>
            ) : (
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:id" element={<ChatConversation />} />
              <Route path="/plate" element={<Plate />} />
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            )}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
