import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Map as MapIcon, 
  Box, 
  BrainCircuit, 
  Database,
  Settings,
  ShieldAlert,
  Building2,
  Network,
  ClipboardCheck,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ClipboardList, label: 'Permohonan & Survey', path: '/survey-list' },
  { icon: ClipboardList, label: 'Field Workspace', path: '/survey' },
  { icon: ShieldAlert, label: 'Assessment Workspace', path: '/assessment' },
  { icon: TrendingDown, label: 'Predictive Maintenance', path: '/predictive-maintenance' },
  { icon: Building2, label: 'Portal Pemilik Gedung', path: '/stakeholder-portal' },
  { icon: ClipboardCheck, label: 'Review Penilaian', path: '/assessment/review' },
  { icon: BrainCircuit, label: 'AI Review', path: '/ai-review' },
  { icon: FileText, label: 'Pusat Persuratan', path: '/persuratan' },
  { icon: FileText, label: 'Report', path: '/report' },
  { icon: MapIcon, label: 'GIS', path: '/gis' },
  { icon: Box, label: 'BIM', path: '/bim' },
];

const adminItems = [
  { icon: Database, label: 'Master Data', path: '/master-data' },
  { icon: Building2, label: 'Users', path: '/admin/users' },
  { icon: ShieldAlert, label: 'Roles', path: '/admin/roles' },
  { icon: FileText, label: 'Activity Log', path: '/admin/activity' },
  { icon: Settings, label: 'Operations', path: '/admin/operations' },
  { icon: Network, label: 'Integrations', path: '/admin/integrations' },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (v: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const { activeRole } = useRole();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredNavItems = navItems.filter(item => {
    if (activeRole === 'Super Administrator') return true;
    if (activeRole === 'Pengelola') return ['Dashboard', 'Permohonan & Survey', 'Portal Pemilik Gedung', 'Pusat Persuratan', 'Report'].includes(item.label);
    if (activeRole === 'Kepala Dinas') return ['Dashboard', 'Predictive Maintenance', 'Portal Pemilik Gedung', 'Review Penilaian', 'Pusat Persuratan', 'Report', 'GIS', 'BIM'].includes(item.label);
    if (activeRole === 'Kepala Bidang') return ['Dashboard', 'Permohonan & Survey', 'Assessment Workspace', 'Predictive Maintenance', 'Portal Pemilik Gedung', 'Review Penilaian', 'AI Review', 'Pusat Persuratan', 'Report', 'GIS', 'BIM'].includes(item.label);
    if (activeRole === 'Reviewer Teknis') return ['Dashboard', 'Assessment Workspace', 'Predictive Maintenance', 'Portal Pemilik Gedung', 'Review Penilaian', 'AI Review', 'Pusat Persuratan', 'Report', 'GIS', 'BIM'].includes(item.label);
    if (activeRole === 'Surveyor') return ['Dashboard', 'Permohonan & Survey', 'Field Workspace', 'Assessment Workspace', 'Predictive Maintenance', 'Portal Pemilik Gedung', 'GIS', 'BIM'].includes(item.label);
    return true;
  });

  const filteredAdminItems = activeRole === 'Super Administrator' ? adminItems : [];

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[280px]';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside className={cn(
        "bg-sidebar text-white flex flex-col h-screen fixed left-0 top-0 z-50",
        "border-r border-sidebar-border",
        "transition-all duration-300 ease-out",
        sidebarWidth,
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-topography pointer-events-none" />
        
        {/* Logo Section */}
        <div className={cn(
          "relative z-10 border-b border-sidebar-border",
          isCollapsed ? "p-3 flex items-center justify-center" : "p-5"
        )}>
          {isCollapsed ? (
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                  <img src="/logo-sipeka.svg" alt="SIPEKA" className="w-7 h-7 object-contain" onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }} />
                  <Building2 size={18} className="text-white hidden fallback-icon" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold tracking-tight text-white leading-tight">SIPEKA</h1>
                  <p className="text-[10px] text-blue-300/70 font-medium">v2.0 Enterprise</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-1">
                <img src="/logo-garut.svg" alt="Garut" className="h-5 w-auto object-contain opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <img src="/logo-pupr.svg" alt="PUPR" className="h-5 w-auto object-contain opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="text-[10px] text-blue-300/50 ml-1">Dinas PUPR Kab. Garut</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-blue-300/50 uppercase tracking-[0.15em] mb-2">
                Menu Utama
              </p>
            )}
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sky-blue rounded-r-full" />
                    )}
                    <item.icon size={isCollapsed ? 20 : 18} className={cn(
                      "shrink-0 transition-all duration-200",
                      isActive ? "text-sky-blue" : "group-hover:text-white"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    
                    {/* Collapsed tooltip */}
                    {isCollapsed && hoveredItem === item.path && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 border border-slate-700 animate-fade-in">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {filteredAdminItems.length > 0 && (
            <div className="mt-6 space-y-0.5">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-blue-300/50 uppercase tracking-[0.15em] mb-2">
                  Administrasi
                </p>
              )}
              {isCollapsed && <div className="border-t border-sidebar-border my-3" />}
              {filteredAdminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                      isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5",
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sky-blue rounded-r-full" />
                      )}
                      <item.icon size={isCollapsed ? 20 : 18} className={cn(
                        "shrink-0 transition-all duration-200",
                        isActive ? "text-sky-blue" : "group-hover:text-white"
                      )} />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {isCollapsed && hoveredItem === item.path && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 border border-slate-700 animate-fade-in">
                          {item.label}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="relative z-10 px-3 py-2 border-t border-sidebar-border">
          <button
            onClick={() => setIsCollapsed?.(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-blue-300/60 hover:text-white hover:bg-white/5 transition-all text-xs"
          >
            {isCollapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile Card */}
        <div className={cn(
          "relative z-10 border-t border-sidebar-border",
          isCollapsed ? "p-2" : "p-3"
        )}>
          <NavLink 
            to="/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white/5",
              isCollapsed ? "p-2 justify-center" : "p-2.5"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-blue to-pupr-blue flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white/10">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{activeRole}</p>
                <p className="text-[10px] text-blue-300/60 truncate">Kab. Garut</p>
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
