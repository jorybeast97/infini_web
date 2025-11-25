import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { FileText, Image, LogOut, Home, User as UserIcon, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

  const [currentUser, setCurrentUser] = React.useState<any>(() => {
    try { const s = localStorage.getItem('infini_user'); return s ? JSON.parse(s) : null } catch { return null }
  });
  useEffect(() => {
    (async () => { const u = await api.getCurrentUser(); if (u) setCurrentUser(u); })();
  }, []);

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
          <NavItem to="/admin/blog" icon={FileText} label="Blog" />
          <div className="h-px bg-white/10 my-4" />
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-white text-sm font-medium transition-colors">
            <Home size={18} />
            View Site
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          {currentUser && (
            <div className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-zinc-900/50">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-muted-foreground" />
              )}
              <div className="text-xs">
                <div className="font-semibold">{currentUser.nickName || currentUser.userName}</div>
                <div className="text-muted-foreground">{currentUser.userName}</div>
              </div>
              <div className="ml-auto">
                <Dialog>
                  <DialogTrigger className="text-primary hover:underline text-xs flex items-center gap-1"><Edit size={14}/> Edit</DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="nick">Nickname</Label>
                        <Input id="nick" defaultValue={currentUser.nickName || ''} onChange={(e)=>setCurrentUser({...currentUser, nickName: e.target.value})} className="bg-zinc-950 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input id="avatar" defaultValue={currentUser.avatar || ''} onChange={(e)=>setCurrentUser({...currentUser, avatar: e.target.value})} className="bg-zinc-950 border-white/10" />
                      </div>
                      <button
                        onClick={async ()=>{ await api.updateUser(currentUser.id, { nickName: currentUser.nickName, avatar: currentUser.avatar }); }}
                        className="mt-2 px-3 py-2 rounded bg-primary text-white text-sm"
                      >Save</button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
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
