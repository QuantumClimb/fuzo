import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CameraView from "./pages/CameraView";
import AIAssistant from "./pages/AIAssistant";
import LogoSplash from "./components/onboarding/LogoSplash";
import LoadingStatus from "./components/onboarding/LoadingStatus";
import LoginForm from "./components/onboarding/LoginForm";
import RegisterForm from "./components/onboarding/RegisterForm";
import CuisinePreferences from "./components/onboarding/CuisinePreferences";
import SettingsPanel from "./components/onboarding/SettingsPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding/splash" element={<LogoSplash />} />
          <Route path="/onboarding/loading" element={<LoadingStatus />} />
          <Route path="/onboarding/login" element={<LoginForm />} />
          <Route path="/onboarding/register" element={<RegisterForm />} />
          <Route path="/onboarding/preferences" element={<CuisinePreferences />} />
          <Route path="/settings" element={<SettingsPanel />} />
          <Route path="*" element={<Index />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/camera" element={<CameraView />} />
          <Route path="/assistant" element={<AIAssistant />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
