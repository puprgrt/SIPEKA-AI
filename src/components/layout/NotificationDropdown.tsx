import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, AlertCircle, FileCheck, ClipboardList, AlertTriangle, FileText, BrainCircuit, Timer } from 'lucide-react';
import { useNotification, Notification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assessment_reviewed': return <FileCheck size={16} className="text-success" />;
      case 'survey_assigned': return <ClipboardList size={16} className="text-pupr-blue" />;
      case 'system_alert': return <AlertCircle size={16} className="text-warning" />;
      case 'survey_delayed': return <Timer size={16} className="text-amber-500" />;
      case 'approval_pending': return <FileText size={16} className="text-blue-500" />;
      case 'building_critical': return <AlertTriangle size={16} className="text-danger" />;
      case 'document_completed': return <FileCheck size={16} className="text-emerald-500" />;
      case 'ai_alert': return <BrainCircuit size={16} className="text-purple-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'assessment_reviewed': return 'bg-success/10';
      case 'survey_assigned': return 'bg-pupr-blue/10';
      case 'system_alert': return 'bg-warning/10';
      case 'survey_delayed': return 'bg-amber-500/10';
      case 'approval_pending': return 'bg-blue-500/10';
      case 'building_critical': return 'bg-danger/10';
      case 'document_completed': return 'bg-emerald-500/10';
      case 'ai_alert': return 'bg-purple-500/10';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMins < 1) return 'Baru saja';
    if (diffInMins < 60) return `${diffInMins} menit lalu`;
    
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger rounded-full ring-2 ring-white dark:ring-slate-900 text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-100 flex items-center gap-2">
              Notifikasi
              {unreadCount > 0 && (
                <Badge variant="outline" className="bg-pupr-blue text-white border-transparent">
                  {unreadCount} Baru
                </Badge>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-pupr-blue dark:text-sky-400 font-medium hover:underline flex items-center gap-1"
              >
                <Check size={14} /> Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <Bell size={32} className="text-slate-300 dark:text-slate-600 dark:text-slate-400 mb-3" />
                <p className="text-sm">Tidak ada notifikasi saat ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 relative",
                      !notification.isRead ? "bg-blue-50/30 dark:bg-sky-900/10" : ""
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pupr-blue"></div>
                    )}
                    
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", getBgColor(notification.type))}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        <Clock size={12} />
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center">
              <Link 
                to="/notifications"
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-pupr-blue dark:hover:text-pupr-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Lihat Semua Notifikasi ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
