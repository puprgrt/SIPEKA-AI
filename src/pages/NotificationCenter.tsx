import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotification, Notification } from '@/contexts/NotificationContext';
import { 
  Bell, Check, Trash2, Clock, AlertCircle, FileCheck, ClipboardList, 
  AlertTriangle, FileText, BrainCircuit, Timer, Search, Filter, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'urgent_repairs' | 'assessment_approvals' | 'system_alerts'>('all');
  const navigate = useNavigate();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assessment_reviewed': return <FileCheck size={18} className="text-success" />;
      case 'survey_assigned': return <ClipboardList size={18} className="text-pupr-blue" />;
      case 'system_alert': return <AlertCircle size={18} className="text-warning" />;
      case 'survey_delayed': return <Timer size={18} className="text-amber-500" />;
      case 'approval_pending': return <FileText size={18} className="text-blue-500" />;
      case 'building_critical': return <AlertTriangle size={18} className="text-danger" />;
      case 'document_completed': return <FileCheck size={18} className="text-emerald-500" />;
      case 'ai_alert': return <BrainCircuit size={18} className="text-purple-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'assessment_reviewed': return 'bg-success/10 border-success/20';
      case 'survey_assigned': return 'bg-pupr-blue/10 border-pupr-blue/20';
      case 'system_alert': return 'bg-warning/10 border-warning/20';
      case 'survey_delayed': return 'bg-amber-500/10 border-amber-500/20';
      case 'approval_pending': return 'bg-blue-500/10 border-blue-500/20';
      case 'building_critical': return 'bg-danger/10 border-danger/20';
      case 'document_completed': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'ai_alert': return 'bg-purple-500/10 border-purple-500/20';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
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

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesReadState = true;
    if (filter === 'unread') matchesReadState = !n.isRead;
    if (filter === 'read') matchesReadState = n.isRead;
    
    let matchesCategory = true;
    if (categoryFilter === 'urgent_repairs') {
      matchesCategory = n.type === 'building_critical';
    } else if (categoryFilter === 'assessment_approvals') {
      matchesCategory = ['assessment_reviewed', 'approval_pending', 'document_completed'].includes(n.type);
    } else if (categoryFilter === 'system_alerts') {
      matchesCategory = ['system_alert', 'ai_alert'].includes(n.type);
    }

    return matchesSearch && matchesReadState && matchesCategory;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Pusat Notifikasi
            {unreadCount > 0 && (
              <Badge className="bg-danger text-white">
                {unreadCount} Baru
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola dan pantau semua peringatan serta tugas</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead()} className="text-pupr-blue border-pupr-blue/20">
              <Check size={16} className="mr-2" />
              Tandai Semua Dibaca
            </Button>
          )}
          <Button variant="outline" className="text-slate-600">
            <Settings size={16} className="mr-2" />
            Pengaturan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <Button 
                variant={filter === 'all' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'text-slate-600'}
              >
                Semua
              </Button>
              <Button 
                variant={filter === 'unread' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'text-slate-600'}
              >
                Belum Dibaca
              </Button>
              <Button 
                variant={filter === 'read' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('read')}
                className={filter === 'read' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'text-slate-600'}
              >
                Sudah Dibaca
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari notifikasi..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1"><Filter size={14} /> Kategori:</div>
            <Button 
              variant={categoryFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategoryFilter('all')}
              className={`h-7 px-3 text-xs rounded-full ${categoryFilter === 'all' ? 'bg-pupr-blue text-white hover:bg-pupr-blue/90' : 'text-slate-600'}`}
            >
              Semua
            </Button>
            <Button 
              variant={categoryFilter === 'urgent_repairs' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategoryFilter('urgent_repairs')}
              className={`h-7 px-3 text-xs rounded-full ${categoryFilter === 'urgent_repairs' ? 'bg-danger text-white hover:bg-danger/90 border-danger' : 'text-slate-600 hover:text-danger hover:border-danger/30'}`}
            >
              Urgent Repairs
            </Button>
            <Button 
              variant={categoryFilter === 'assessment_approvals' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategoryFilter('assessment_approvals')}
              className={`h-7 px-3 text-xs rounded-full ${categoryFilter === 'assessment_approvals' ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600' : 'text-slate-600 hover:text-emerald-600 hover:border-emerald-600/30'}`}
            >
              Assessment Approvals
            </Button>
            <Button 
              variant={categoryFilter === 'system_alerts' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategoryFilter('system_alerts')}
              className={`h-7 px-3 text-xs rounded-full ${categoryFilter === 'system_alerts' ? 'bg-warning text-white hover:bg-warning/90 border-warning' : 'text-slate-600 hover:text-warning hover:border-warning/30'}`}
            >
              System Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                <Bell size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tidak ada notifikasi</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {searchTerm ? 'Tidak ada notifikasi yang sesuai dengan pencarian Anda.' : 'Anda belum memiliki notifikasi baru.'}
              </p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">
                  Hapus pencarian
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-4 sm:p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group flex flex-col sm:flex-row gap-4",
                    !notification.isRead ? "bg-blue-50/20 dark:bg-sky-900/10" : ""
                  )}
                >
                  <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm", 
                      getBgColor(notification.type)
                    )}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className={cn(
                          "text-base font-semibold",
                          !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium whitespace-nowrap">
                          <Clock size={12} />
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        {!notification.isRead && (
                          <Badge className="bg-pupr-blue/10 text-pupr-blue hover:bg-pupr-blue/20 border-transparent shadow-none">Baru</Badge>
                        )}
                        <span className="text-xs text-slate-400" title={formatTime(notification.createdAt)}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end sm:justify-start">
                    {!notification.isRead && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-pupr-blue" 
                        title="Tandai dibaca"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check size={14} />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-danger hover:border-danger/30 hover:bg-danger/5" 
                      title="Hapus"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
