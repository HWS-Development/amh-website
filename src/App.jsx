
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/HomePage';
import RiadDetailPage from '@/pages/RiadDetailPage';
import CollectionPage from '@/pages/CollectionPage';
import CollectionsLandingPage from '@/pages/CollectionsLandingPage';
import DestinationPage from '@/pages/DestinationPage';
import ExperiencePage from '@/pages/ExperiencePage';
import AllRiadsPage from '@/pages/AllRiadsPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import BackToTopButton from '@/components/BackToTopButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import NotFoundPage from '@/pages/NotFoundPage';
import DestinationsLandingPage from '@/pages/DestinationsLandingPage';

const AppContent = () => {
  const { loading } = useAuth();
  const [date, setDate] = useState({ from: undefined, to: undefined });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
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
          <Route path="/collections" element={<CollectionsLandingPage />} />
          <Route path="/collection/:type" element={<CollectionPage />} />
          <Route path="/destinations" element={<DestinationsLandingPage />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/experiences/:slug" element={<ExperiencePage />} />
          <Route path="/all-riads" element={<AllRiadsPage />} />
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
