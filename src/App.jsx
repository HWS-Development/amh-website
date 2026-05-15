import React, { useState } from 'react';
        import { Routes, Route } from 'react-router-dom';
        import { Toaster } from '@/components/ui/toaster';
        import HomePage from '@/pages/HomePage';
        import RiadDetailPage from '@/pages/RiadDetailPage';
        import DestinationPage from '@/pages/DestinationPage';
        import ExperiencePage from '@/pages/ExperiencePage';
        import AllRiadsPage from '@/pages/AllRiadsPage';
        import AllPropertiesPage from '@/pages/AllPropertiesPage';
        import Header from '@/components/Header';
        import Footer from '@/components/Footer';
        import ScrollToTop from '@/components/ScrollToTop';
        import BackToTopButton from '@/components/BackToTopButton';
        import { useAuth } from '@/contexts/SupabaseAuthContext';
        import { QueryParamProvider } from 'use-query-params';
        import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
        import NotFoundPage from '@/pages/NotFoundPage';
        import DestinationsLandingPage from '@/pages/DestinationsLandingPage';
        import MedinaQuartiersPage from '@/pages/MedinaQuartiersPage';
        import QuartierDetailPage from '@/pages/QuartierDetailPage';
        import AboutPage from '@/pages/AboutPage';

        const AppContent = () => {
          const { loading } = useAuth();
          const [date, setDate] = useState({ from: undefined, to: undefined });

          if (loading) {
            return (
              <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-brand-beige border-t-brand-action animate-spin" />
                  <span className="text-sm text-brand-ink/50 font-montserrat tracking-wide">Chargement...</span>
                </div>
              </div>
            );
          }

          return (
            <div className="min-h-screen bg-white">
              <ScrollToTop />
              <Header date={date} onDateChange={setDate} />
              <main className="bg-white">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/riad/:id" element={<RiadDetailPage />} />
                  <Route path="/destinations" element={<DestinationsLandingPage />} />
                  <Route path="/destinations/:slug" element={<DestinationPage />} />
                  <Route path="/experiences/:slug" element={<ExperiencePage />} />
                  <Route path="/quartiers-medina" element={<MedinaQuartiersPage />} />
                  <Route path="/quartiers/:slug" element={<QuartierDetailPage />} />
                  <Route path="/all-riads" element={<AllRiadsPage />} />
                  <Route path="/all-properties" element={<AllPropertiesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
              <BackToTopButton />
            </div>
          );
        }

        function App() {
          return (
            <QueryParamProvider adapter={ReactRouter6Adapter}>
              <AppContent />
            </QueryParamProvider>
          );
        }

        export default App;
