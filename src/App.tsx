/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from './contexts/RoleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { ProtectedGuard } from './components/auth/ProtectedGuard';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { Dashboard } from './pages/Dashboard';
import { SurveyWorkspace } from './pages/survey/SurveyWorkspace';
import { SurveyList } from './pages/survey/SurveyList';
import { SurveyForm } from './pages/survey/SurveyForm';
import { AssessmentWorkspace } from './pages/assessment/AssessmentWorkspace';
import { AssessmentReviewList } from './pages/assessment/AssessmentReviewList';
import { PredictiveMaintenanceDashboard } from './pages/assessment/PredictiveMaintenanceDashboard';
import { StakeholderPortal } from './pages/stakeholder/StakeholderPortal';
import { AIWorkspace } from './pages/ai/AIWorkspace';
import { ReportWorkspace } from './pages/report/ReportWorkspace';
import { PersuratanWorkspace } from './pages/persuratan/PersuratanWorkspace';
import { RequestWizard } from './pages/request/RequestWizard';
import { GISWorkspace } from './pages/gis/GISWorkspace';
import { BIMWorkspace } from './pages/bim/BIMWorkspace';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { SSOCallback } from './pages/auth/SSOCallback';
import { UserManagement } from './pages/admin/UserManagement';
import { RoleManagement } from './pages/admin/RoleManagement';
import { PermissionMatrix } from './pages/admin/PermissionMatrix';
import { ActivityLog } from './pages/admin/ActivityLog';
import { OperationsCenter } from './pages/admin/OperationsCenter';
import { IntegrationWorkspace } from './pages/admin/IntegrationWorkspace';
import { MasterDataWorkspace } from './pages/master-data/MasterDataWorkspace';
import { NotificationCenter } from './pages/NotificationCenter';
import { ProfileWorkspace } from './pages/profile/ProfileWorkspace';
import { VerifyDocument } from './pages/public/VerifyDocument';
import { NotFound } from './pages/error/NotFound';
import { AccessDenied } from './pages/error/AccessDenied';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
        <QueryClientProvider client={queryClient}>
          <RoleProvider>
            <NotificationProvider>
              <ToastProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/auth" element={<AuthLayout />}>
                      <Route path="login" element={<Login />} />
                      <Route path="callback" element={<SSOCallback />} />
                      <Route path="forgot-password" element={<ForgotPassword />} />
                    </Route>
                    
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="survey" element={<SurveyWorkspace />} />
                      <Route path="survey-list" element={<SurveyList />} />
                      <Route path="survey/new" element={<SurveyForm />} />
                      <Route path="assessment" element={<AssessmentWorkspace />} />
                      <Route path="predictive-maintenance" element={<PredictiveMaintenanceDashboard />} />
                      <Route path="stakeholder-portal" element={<StakeholderPortal />} />
                      <Route path="ai-review" element={<AIWorkspace />} />
                      <Route path="report" element={<ReportWorkspace />} />
                      <Route path="persuratan" element={<PersuratanWorkspace />} />
                      <Route path="gis" element={<GISWorkspace />} />
                      <Route path="bim" element={<BIMWorkspace />} />
                      <Route path="notifications" element={<NotificationCenter />} />
                      <Route path="profile" element={<ProfileWorkspace />} />
                      <Route path="403" element={<AccessDenied />} />

                      {/* Rute Teknis Terproteksi (Reviewer & Kadis/Kabid) */}
                      <Route element={<ProtectedGuard allowedRoles={['Super Administrator', 'Kepala Dinas', 'Kepala Bidang', 'Reviewer Teknis']} moduleName="Review Penilaian Kerusakan" />}>
                        <Route path="assessment/review" element={<AssessmentReviewList />} />
                        <Route path="assessment-review" element={<AssessmentReviewList />} />
                      </Route>

                      {/* Rute Master Data Terproteksi */}
                      <Route element={<ProtectedGuard allowedRoles={['Super Administrator', 'Kepala Dinas', 'Kepala Bidang', 'Reviewer Teknis']} moduleName="Pengelolaan Master Data" />}>
                        <Route path="master-data" element={<MasterDataWorkspace />} />
                      </Route>

                      {/* Rute Administrasi Terproteksi (Super Administrator Only) */}
                      <Route element={<ProtectedGuard allowedRoles={['Super Administrator']} moduleName="Manajemen Sistem & Pengaturan Admin" />}>
                        <Route path="admin/users" element={<UserManagement />} />
                        <Route path="admin/roles" element={<RoleManagement />} />
                        <Route path="admin/permissions" element={<PermissionMatrix />} />
                        <Route path="admin/activity" element={<ActivityLog />} />
                        <Route path="admin/operations" element={<OperationsCenter />} />
                        <Route path="admin/integrations" element={<IntegrationWorkspace />} />
                      </Route>

                      {/* Wildcard 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    
                    {/* Public Routes */}
                    <Route path="/verify/:documentId" element={<VerifyDocument />} />
                  </Routes>
                </BrowserRouter>
              </ToastProvider>
            </NotificationProvider>
          </RoleProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
