import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import { EditModeProvider } from './context/EditModeContext';
import './App.css';

// Lazy-loaded pages for code splitting & optimal performance
const CentrePage = lazy(() => import('./pages/CentrePage'));
const SpacesPage = lazy(() => import('./pages/SpacesPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SoutienPage = lazy(() => import('./pages/SoutienPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Glassmorphism Loading Fallback
const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: '#22c55e'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(34, 197, 94, 0.2)',
      borderTopColor: '#22c55e',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 500 }}>Chargement en cours...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="app-container">
      <Header />
      <main className={`main-content ${isHome ? 'home-layout' : 'page-layout'}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/centre" element={<CentrePage />} />
            <Route path="/espaces" element={<SpacesPage />} />
            <Route path="/activites" element={<ActivitiesPage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route path="/evenements/:id" element={<EventDetailPage />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/partenaires" element={<PartnersPage />} />
            <Route path="/soutien" element={<SoutienPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <EditModeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </EditModeProvider>
    </AuthProvider>
  );
}

export default App;
