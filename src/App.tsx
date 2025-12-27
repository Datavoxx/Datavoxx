import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestAllowedRoute from "@/components/GuestAllowedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import AnnonsGenerator from "./pages/AnnonsGenerator";
import AnnonsResultat from "./pages/AnnonsResultat";
import BilResearch from "./pages/BilResearch";
import EmailAssistent from "./pages/EmailAssistent";
import Paket from "./pages/Paket";
import Auth from "./pages/Auth";
import AdminRoles from "./pages/AdminRoles";
import Bildgenerator from "./pages/Bildgenerator";
import BildgeneratorMallar from "./pages/BildgeneratorMallar";
import VadArPadding from "./pages/VadArPadding";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import OwnerDashboard from "./pages/OwnerDashboard";

// Product pages
import ProduktAnnonsgenerator from "./pages/produkter/Annonsgenerator";
import ProduktBilResearch from "./pages/produkter/BilResearch";
import ProduktEmailAssistent from "./pages/produkter/EmailAssistent";
import ProduktBildgenerator from "./pages/produkter/Bildgenerator";
import Integritetspolicy from "./pages/Integritetspolicy";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/integritetspolicy" element={<Integritetspolicy />} />
              
              {/* Guest-allowed routes - accessible to both logged-in users and guests */}
              <Route path="/" element={<GuestAllowedRoute><Landing /></GuestAllowedRoute>} />
              <Route path="/start" element={<GuestAllowedRoute><Index /></GuestAllowedRoute>} />
              <Route path="/annons-generator" element={<GuestAllowedRoute><AnnonsGenerator /></GuestAllowedRoute>} />
              <Route path="/annons-resultat" element={<GuestAllowedRoute><AnnonsResultat /></GuestAllowedRoute>} />
              <Route path="/bil-research" element={<GuestAllowedRoute><BilResearch /></GuestAllowedRoute>} />
              
              {/* Protected routes - require authentication */}
              <Route path="/email-assistent" element={<ProtectedRoute><EmailAssistent /></ProtectedRoute>} />
              <Route path="/paket" element={<ProtectedRoute><Paket /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-canceled" element={<ProtectedRoute><PaymentCanceled /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
              <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/bildgenerator-mallar" element={<ProtectedRoute><BildgeneratorMallar /></ProtectedRoute>} />
              <Route path="/bildgenerator" element={<ProtectedRoute><Bildgenerator /></ProtectedRoute>} />
              <Route path="/hur-fungerar-bildgenerator" element={<ProtectedRoute><VadArPadding /></ProtectedRoute>} />
              {/* Product pages */}
              <Route path="/produkt/annonsgenerator" element={<ProtectedRoute><ProduktAnnonsgenerator /></ProtectedRoute>} />
              <Route path="/produkt/bil-research" element={<ProtectedRoute><ProduktBilResearch /></ProtectedRoute>} />
              <Route path="/produkt/email-assistent" element={<ProtectedRoute><ProduktEmailAssistent /></ProtectedRoute>} />
              <Route path="/produkt/bildgenerator" element={<ProtectedRoute><ProduktBildgenerator /></ProtectedRoute>} />
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
