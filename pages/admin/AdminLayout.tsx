import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { LayoutGrid, FileText, Image, LogOut, Home } from 'lucide-react';
import { cn } from '../../components/ui/utils';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/admin/blog/');

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    api.logout();
    navigate('/admin/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-zinc-800 hover:text-white"
      )}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-zinc-950 flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            Infini Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/admin/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavItem to="/admin/blog" icon={FileText} label="Blog" />
          <div className="h-px bg-white/10 my-4" />
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-white text-sm font-medium transition-colors">
            <Home size={18} />
            View Site
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 bg-background relative flex flex-col min-w-0",
        isEditor ? "overflow-hidden" : "overflow-auto"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className={cn(
          "relative z-10 w-full flex-1 flex flex-col",
          isEditor ? "p-0 h-full" : "max-w-6xl mx-auto p-8"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;