import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { Skeleton } from "./components/ui/skeleton";
import { ErrorBoundary } from "./components/ErrorBoundary";

const MapPage = lazy(() => import("./pages/MapPage"));
const About = lazy(() => import("./pages/About"));
const SuggestLocation = lazy(() => import("./pages/SuggestLocation"));

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  useEffect(() => {
    console.log('[App] Mounted at route:', location.pathname);
  }, []);
  useEffect(() => {
    console.log('[App] Route changed:', location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-96 w-full max-w-4xl" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/suggest" element={<SuggestLocation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isMapPage && <Footer />}
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
