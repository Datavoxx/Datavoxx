import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

// Product pages
import ProduktAnnonsgenerator from "./pages/produkter/Annonsgenerator";
import ProduktBilResearch from "./pages/produkter/BilResearch";
import ProduktEmailAssistent from "./pages/produkter/EmailAssistent";
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
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
              <Route path="/start" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/annons-generator" element={<ProtectedRoute><AnnonsGenerator /></ProtectedRoute>} />
              <Route path="/annons-resultat" element={<ProtectedRoute><AnnonsResultat /></ProtectedRoute>} />
              <Route path="/bil-research" element={<ProtectedRoute><BilResearch /></ProtectedRoute>} />
              <Route path="/email-assistent" element={<ProtectedRoute><EmailAssistent /></ProtectedRoute>} />
              <Route path="/paket" element={<ProtectedRoute><Paket /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-canceled" element={<ProtectedRoute><PaymentCanceled /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
              <Route path="/bildgenerator-mallar" element={<ProtectedRoute><BildgeneratorMallar /></ProtectedRoute>} />
              <Route path="/bildgenerator" element={<ProtectedRoute><Bildgenerator /></ProtectedRoute>} />
              {/* Product pages */}
              <Route path="/produkt/annonsgenerator" element={<ProtectedRoute><ProduktAnnonsgenerator /></ProtectedRoute>} />
              <Route path="/produkt/bil-research" element={<ProtectedRoute><ProduktBilResearch /></ProtectedRoute>} />
              <Route path="/produkt/email-assistent" element={<ProtectedRoute><ProduktEmailAssistent /></ProtectedRoute>} />
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
