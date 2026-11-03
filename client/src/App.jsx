import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import WhatsAppButton from './components/common/WhatsAppButton/WhatsAppButton';
import EnquiryModal from './components/common/EnquiryModal/EnquiryModal';

// Lazy-loaded route pages for the 6 core school pages
const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/About/About'));
const Academics = lazy(() => import('./pages/Academics/Academics'));
const Admissions = lazy(() => import('./pages/Admissions/Admissions'));
const Campus = lazy(() => import('./pages/Campus/Campus'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy/Privacy'));
const Terms = lazy(() => import('./pages/Terms/Terms'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Minimal graceful loading placeholder
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label="Loading page content"
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--color-accent-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
    </div>
  );
}

export default function App() {
  const { t } = useTranslation();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const handleOpenEnquiry = () => setIsEnquiryOpen(true);
  const handleCloseEnquiry = () => setIsEnquiryOpen(false);

  return (
    <div className="app-layout">
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-to-content">
        {t('skipToContent')}
      </a>

      <ScrollToTop />
      
      {/* Global Header */}
      <Header onOpenEnquiry={handleOpenEnquiry} />

      {/* Main Content View with Code-Splitting Suspense */}
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home onOpenEnquiry={handleOpenEnquiry} isEnquiryOpen={isEnquiryOpen} />} />
            <Route path="/about" element={<About onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/admissions" element={<Admissions onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/campus" element={<Campus />} />
            <Route path="/contact" element={<Contact onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Reusable Footer */}
      <Footer />

      {/* Floating WhatsApp Contact Button */}
      <WhatsAppButton />

      {/* Admissions Enquiry Modal */}
      <EnquiryModal isOpen={isEnquiryOpen} onClose={handleCloseEnquiry} />
    </div>
  );
}
