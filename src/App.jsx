import React, { useState, useEffect } from 'react';
        import { Navigate, Routes, Route } from 'react-router-dom';
        import { Toaster } from '@/components/ui/toaster';
        import HomePage from '@/pages/HomePage';
        import RiadDetailPage from '@/pages/RiadDetailPage';
        import DestinationPage from '@/pages/DestinationPage';
        import ExperiencePage from '@/pages/ExperiencePage';
        import ExperiencesIndexPage from '@/pages/ExperiencesIndexPage';
        import AllRiadsPage from '@/pages/AllRiadsPage';
        import AllPropertiesPage from '@/pages/AllPropertiesPage';
        import Header from '@/components/Header';
        import Footer from '@/components/Footer';
        import ScrollToTop from '@/components/ScrollToTop';
        import BackToTopButton from '@/components/BackToTopButton';
        import FloatingBookButton from '@/components/FloatingBookButton';
        import { useAuth } from '@/contexts/SupabaseAuthContext';
        import { QueryParamProvider } from 'use-query-params';
        import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
        import NotFoundPage from '@/pages/NotFoundPage';
        import DestinationsLandingPage from '@/pages/DestinationsLandingPage';
        import MedinaQuartiersPage from '@/pages/MedinaQuartiersPage';
        import QuartierDetailPage from '@/pages/QuartierDetailPage';
        import AboutPage from '@/pages/AboutPage';
        import { useLanguage } from '@/contexts/LanguageContext';
        import { fetchCatalog } from '@/lib/catalogs';

        const AppContent = () => {
          const { loading } = useAuth();
          const [date, setDate] = useState({ from: undefined, to: undefined });
          const { currentLanguage } = useLanguage();

          useEffect(() => {
            const catalogs = [
              "mgh_cities", "mgh_neighborhoods", "mgh_property_types",
              "mgh_amenities_catalog", "mgh_services_catalog"
            ];
            catalogs.forEach((table) => {
              fetchCatalog(table, currentLanguage).catch(() => {});
            });
          }, [currentLanguage]);

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
            <div className="min-h-screen bg-white grain-overlay">
              <ScrollToTop />
              <Header date={date} onDateChange={setDate} />
              <main className="bg-white">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/riad/:id" element={<RiadDetailPage />} />
                  <Route path="/riad/:id/:slug" element={<RiadDetailPage />} />
                  <Route path="/destinations" element={<DestinationsLandingPage />} />
                  <Route path="/destinations/:slug" element={<DestinationPage />} />
                  <Route path="/experiences" element={<ExperiencesIndexPage />} />
                  <Route path="/experiences/:slug" element={<ExperiencePage />} />
                  <Route path="/quartiers" element={<MedinaQuartiersPage />} />
                  <Route path="/quartiers-medina" element={<Navigate to="/quartiers" replace />} />
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
              <FloatingBookButton />
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
