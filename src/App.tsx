import '@/lib/react-fix'; // Ensure React is loaded first
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsentBanner from "./components/ConsentBanner";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { Skeleton } from "./components/ui/skeleton";
import { ErrorBoundary } from "./components/ErrorBoundary";

const MapPage = lazy(() => import("./pages/MapPage"));
const About = lazy(() => import("./pages/About"));
const SuggestLocation = lazy(() => import("./pages/SuggestLocation"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminQueue = lazy(() => import("./pages/AdminQueue"));
const EventsCalendar = lazy(() => import("./pages/EventsCalendar"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const CGU = lazy(() => import("./pages/CGU"));
const Partenaires = lazy(() => import("./pages/Partenaires"));

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname === '/carte';

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Aller au contenu principal
      </a>
      <Header />
      <main id="main-content">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Skeleton className="h-96 w-full max-w-4xl" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carte" element={<MapPage />} />
            <Route path="/agenda" element={<EventsCalendar />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/suggerer-un-lieu" element={<SuggestLocation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/queue" element={<AdminQueue />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/partenaires" element={<Partenaires />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isMapPage && <Footer />}
      <ConsentBanner />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
