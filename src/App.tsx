import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
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

// Product pages
import ProduktAnnonsgenerator from "./pages/produkter/Annonsgenerator";
import ProduktBilResearch from "./pages/produkter/BilResearch";
import ProduktEmailAssistent from "./pages/produkter/EmailAssistent";

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
              <Route path="/" element={<Landing />} />
              <Route path="/start" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/annons-generator" element={<AnnonsGenerator />} />
              <Route path="/annons-resultat" element={<AnnonsResultat />} />
              <Route path="/bil-research" element={<BilResearch />} />
              <Route path="/email-assistent" element={<EmailAssistent />} />
              <Route path="/paket" element={<Paket />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
              <Route path="/bildgenerator-mallar" element={<BildgeneratorMallar />} />
              <Route path="/bildgenerator" element={<Bildgenerator />} />
              {/* Product pages */}
              <Route path="/produkt/annonsgenerator" element={<ProduktAnnonsgenerator />} />
              <Route path="/produkt/bil-research" element={<ProduktBilResearch />} />
              <Route path="/produkt/email-assistent" element={<ProduktEmailAssistent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
