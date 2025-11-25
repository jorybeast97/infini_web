import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from './ui/utils';
import { LayoutGrid, Map, Image, FileText, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link to={to} className="relative flex flex-col items-center justify-center px-4 py-2 transition-colors hover:text-primary">
    <div className={cn("p-2 rounded-full transition-all", active ? "text-primary bg-primary/10" : "text-muted-foreground")}>
      <Icon size={20} />
    </div>
    <span className="text-[10px] font-medium mt-1 opacity-80">{label}</span>
    {active && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md shadow-2xl px-2 py-2 supports-[backdrop-filter]:bg-background/60">
        <NavItem to="/" icon={Home} label="Home" active={path === '/'} />
        <NavItem to="/apps" icon={LayoutGrid} label="Apps" active={path === '/apps'} />
        <NavItem to="/blog" icon={FileText} label="Blog" active={path === '/blog'} />
        <NavItem to="/gallery" icon={Image} label="Gallery" active={path === '/gallery'} />
      </div>
    </div>
  );
};

export default Navbar;