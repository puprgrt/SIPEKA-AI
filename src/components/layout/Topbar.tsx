import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, UserCircle, Lightbulb, MessageCircle, PanelLeftClose, PanelLeft, Bell, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRole, Role } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { NotificationDropdown } from './NotificationDropdown';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/survey-list': 'Permohonan & Survey',
  '/survey': 'Field Workspace',
  '/assessment': 'Assessment',
  '/predictive-maintenance': 'Predictive Maintenance',
  '/stakeholder-portal': 'Portal Pemilik Gedung',
  '/assessment/review': 'Review Penilaian',
  '/ai-review': 'AI Review',
  '/persuratan': 'Persuratan',
  '/report': 'Report',
  '/gis': 'GIS',
  '/bim': 'BIM',
  '/master-data': 'Master Data',
  '/notifications': 'Notifikasi',
  '/profile': 'Profil',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles',
  '/admin/activity': 'Activity Log',
  '/admin/operations': 'Operations',
  '/admin/integrations': 'Integrations',
};

interface TopbarProps {
  toggleSidebar?: () => void;
  onOpenTour?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Topbar({ toggleSidebar, onOpenTour, isCollapsed, onToggleCollapse }: TopbarProps) {
  const { activeRole, setActiveRole, availableRoles } = useRole();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = breadcrumbMap[location.pathname] || 'SIPEKA';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className={cn(
      "h-16 glass-strong sticky top-0 z-30",
      "flex items-center justify-between px-4 md:px-6",
      "border-b border-border/40"
    )}>
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button 
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-muted rounded-xl transition-colors" 
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>

        {/* Desktop collapse toggle */}
        <button 
          className="hidden md:flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-muted dark:hover:bg-slate-800 rounded-xl transition-all"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-slate-400 dark:text-slate-500">SIPEKA</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{currentPage}</span>
        </div>

        {/* Search */}
        <div className="hidden lg:flex relative w-72 ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Cari bangunan, laporan..." 
            className="pl-9 h-9 bg-muted dark:bg-slate-800/50 border-transparent rounded-xl text-sm focus-visible:border-pupr-blue/30"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* WhatsApp Pelayanan */}
        <a 
          href="https://wa.me/6285117211173?text=Halo%20Layanan%20Publik%20DPUPR%20Kab.%20Garut,%20saya%20ingin%20berkonsultasi/bertanya" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 rounded-xl transition-colors border border-emerald-200/60 dark:border-emerald-800/60"
          title="Hubungi WhatsApp Pelayanan Publik"
        >
          <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono text-emerald-800 dark:text-emerald-200" data-mono>085117211173</span>
        </a>

        {/* Quick Tour */}
        {onOpenTour && (
          <button 
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pupr-blue bg-pupr-blue-50 dark:bg-pupr-blue/10 hover:bg-pupr-blue/15 rounded-xl transition-colors border border-pupr-blue/10 dark:border-pupr-blue/20"
          >
            <Lightbulb size={13} />
            Tour
          </button>
        )}

        {/* Role Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-muted dark:bg-slate-800 border border-border/60 dark:border-slate-700 rounded-xl p-1 px-2.5">
          <UserCircle size={14} className="text-slate-400 shrink-0" />
          <select 
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as Role)}
            className="bg-transparent border-none text-xs font-medium text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer outline-none max-w-[140px]"
          >
            {availableRoles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <ModeToggle />
        
        {/* Notifications */}
        <NotificationDropdown />
        
        {/* Divider */}
        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Profile */}
        <Link 
          to="/profile" 
          className="flex items-center gap-3 hover:bg-muted dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name || 'Pengguna'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{activeRole}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pupr-blue to-sky-blue flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.name?.charAt(0) || activeRole.charAt(0)).toUpperCase()
            )}
          </div>
        </Link>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="p-2 ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
