import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Apps from './pages/Apps';
import Blog from './pages/Blog';
import Gallery from './pages/Gallery';
// Admin Imports
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminBlog from './pages/admin/AdminBlog';
import BlogEditor from './pages/admin/BlogEditor';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Wrapper to handle AnimatePresence based on location
const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/gallery" element={<Gallery />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="dashboard" element={<div className="text-2xl font-bold">Welcome back, Infini.</div>} />
           <Route path="blog" element={<AdminBlog />} />
           <Route path="blog/:id" element={<BlogEditor />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
};

// Separated to use useLocation hook for conditional rendering of Navbar
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative selection:bg-primary/20 selection:text-primary">
      {!isAdminRoute && <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>}
      
      {!isAdminRoute && <Navbar />}
      
      <main className={isAdminRoute ? '' : 'pt-4'}>
        <AnimatedRoutes />
      </main>
    </div>
  );
};

export default App;