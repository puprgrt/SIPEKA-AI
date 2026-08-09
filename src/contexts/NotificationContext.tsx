import React, { createContext, useContext, useState, useEffect } from 'react';

export type NotificationType = 
  | 'survey_assigned' 
  | 'survey_delayed'
  | 'assessment_reviewed' 
  | 'approval_pending'
  | 'building_critical'
  | 'document_completed'
  | 'ai_alert'
  | 'system_alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add some initial mock notifications based on user requests
  useEffect(() => {
    setNotifications([
      {
        id: 'notif-1',
        title: 'Assessment Direview',
        message: 'Assessment Bangunan Sekolah Dasar Negeri 1 Garut Kota telah direview oleh Kepala Bidang.',
        type: 'assessment_reviewed',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        link: '/assessment/review'
      },
      {
        id: 'notif-2',
        title: 'Tugas Survey Baru',
        message: 'Anda ditugaskan untuk melakukan survey di SMP Negeri 2 Tarogong Kidul.',
        type: 'survey_assigned',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        link: '/survey-list'
      },
      {
        id: 'notif-3',
        title: 'Peringatan Bangunan Kritis',
        message: 'RSUD dr. Slamet Garut terdeteksi memiliki kerusakan struktural kritis (>65%). Mohon segera tindak lanjuti.',
        type: 'building_critical',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        link: '/assessment/review'
      },
      {
        id: 'notif-4',
        title: 'AI Alert: Anomali Data',
        message: 'Terdapat anomali data pada persentase kerusakan atap Kantor Kecamatan Banyuresmi.',
        type: 'ai_alert',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        link: '/ai-review'
      },
      {
        id: 'notif-5',
        title: 'Dokumen BAP Selesai',
        message: 'Dokumen Berita Acara Penilaian (BAP) untuk SDN 1 Cilawu telah berhasil digenerate dan siap diunduh.',
        type: 'document_completed',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        link: '/report'
      }
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
