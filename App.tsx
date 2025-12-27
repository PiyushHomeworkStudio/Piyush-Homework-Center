
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingBackButton from './components/FloatingBackButton';
import CinematicIntro from './components/CinematicIntro';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHome from './pages/UserHome';
import RequestHomework from './pages/RequestHomework';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPanel from './pages/AdminPanel';
import OwnerDashboard from './pages/OwnerDashboard';
import ProfilePage from './pages/ProfilePage';
import OwnerChatPage from './pages/OwnerChatPage';
import CheckoutPage from './pages/CheckoutPage';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
};

const InitialRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isInitialEntry = !sessionStorage.getItem('piyush_initial_load_done');
    if (isInitialEntry) {
      sessionStorage.setItem('piyush_initial_load_done', 'true');
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('piyush_intro_played');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('piyush_intro_played', 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-black">
      {/* Background Atmosphere -pointer-events-none ensures no blocking */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="bg-glow w-64 h-64 sm:w-96 sm:h-96 bg-[#d4af37] top-0 -left-20"></div>
        <div className="bg-glow w-48 h-48 sm:w-64 sm:h-64 bg-amber-900 bottom-0 -right-10" style={{ animationDelay: '-5s' }}></div>
      </div>

      <Navbar />
      <FloatingBackButton />
      <InitialRedirect />
      
      <main className="flex-grow z-10 relative">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<div className="pt-40 text-center text-xl sm:text-3xl font-serif gold-text px-6 scroll-reveal reveal-zoom">Premium Handwritten Services - Since 2025</div>} />
            
            <Route path="/dashboard" element={currentUser ? <UserHome /> : <Navigate to="/" />} />
            <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/request-homework" element={currentUser ? (currentUser.isAdmin ? <Navigate to="/admin" /> : <RequestHomework />) : <Navigate to="/" />} />
            <Route path="/analytics" element={currentUser ? (currentUser.isAdmin ? <Navigate to="/admin" /> : <AnalyticsPage />) : <Navigate to="/" />} />
            <Route path="/checkout/:homeworkId" element={currentUser ? <CheckoutPage /> : <Navigate to="/login" />} />
            <Route path="/admin" element={currentUser?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/owner-dashboard" element={currentUser?.isAdmin ? <OwnerDashboard /> : <Navigate to="/" />} />
            <Route path="/owner-chat" element={currentUser?.isAdmin ? <OwnerChatPage /> : <Navigate to="/" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </PageWrapper>
      </main>
      
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <AppContent />
      </Router>
    </StoreProvider>
  );
};

export default App;
