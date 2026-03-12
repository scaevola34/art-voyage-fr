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
const AdminGaleries = lazy(() => import("./pages/AdminGaleries"));
const EventsCalendar = lazy(() => import("./pages/EventsCalendar"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const CGU = lazy(() => import("./pages/CGU"));
const Partenaires = lazy(() => import("./pages/Partenaires"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const DevenirPartenaire = lazy(() => import("./pages/DevenirPartenaire"));
const GalerieLogin = lazy(() => import("./pages/GalerieLogin"));
const GalerieDashboard = lazy(() => import("./pages/GalerieDashboard"));
const GalerieProfil = lazy(() => import("./pages/GalerieProfil"));
const GalerieEvenements = lazy(() => import("./pages/GalerieEvenements"));
const GalerieArtistes = lazy(() => import("./pages/GalerieArtistes"));
const GalerieStats = lazy(() => import("./pages/GalerieStats"));
const Developers = lazy(() => import("./pages/Developers"));
const AdminApiKeys = lazy(() => import("./pages/AdminApiKeys"));

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
            <Route path="/admin/galeries" element={<AdminGaleries />} />
            <Route path="/devenir-partenaire" element={<DevenirPartenaire />} />
            <Route path="/galerie/login" element={<GalerieLogin />} />
            <Route path="/galerie/dashboard" element={<GalerieDashboard />} />
            <Route path="/galerie/profil" element={<GalerieProfil />} />
            <Route path="/galerie/evenements" element={<GalerieEvenements />} />
            <Route path="/galerie/artistes" element={<GalerieArtistes />} />
            <Route path="/galerie/stats" element={<GalerieStats />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/partenaires" element={<Partenaires />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
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
