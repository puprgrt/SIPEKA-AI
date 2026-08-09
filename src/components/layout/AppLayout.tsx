import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { QuickTour } from '../ui/QuickTour';
import { AIAssistant } from '../ui/ai-assistant';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Show tour automatically on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sipeka_has_seen_tour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        localStorage.setItem('sipeka_has_seen_tour', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('sipeka_sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sipeka_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const mainMargin = isCollapsed ? 'md:ml-[72px]' : 'md:ml-[280px]';

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-out",
        mainMargin
      )}>
        <Topbar 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onOpenTour={() => setIsTourOpen(true)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <QuickTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      <AIAssistant />
    </div>
  );
}
