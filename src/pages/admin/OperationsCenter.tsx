import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, ShieldAlert, Activity, RefreshCw, HardDrive, 
  Cpu, Terminal, Cloud, Database, Network, AlertTriangle, Settings, BookOpen,
  ClipboardList, CheckCircle2, XCircle, Clock, ArrowRight, User
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockNetworkData = [
  { time: '00:00', requests: 1200, cpu: 45 },
  { time: '04:00', requests: 800, cpu: 30 },
  { time: '08:00', requests: 3400, cpu: 65 },
  { time: '12:00', requests: 5600, cpu: 85 },
  { time: '16:00', requests: 4800, cpu: 75 },
  { time: '20:00', requests: 2200, cpu: 55 },
  { time: '24:00', requests: 1400, cpu: 40 },
];

const mockAuditTrail = [
  { id: '1', date: '2026-08-01 14:30:22', userId: 'REQ_7829', userRole: 'Surveyor', action: 'Submit', previousState: 'Draft', newState: 'Menunggu Verifikasi', entity: 'Assessment B-102', notes: 'Laporan kerusakan awal disubmit.' },
  { id: '2', date: '2026-08-02 09:15:00', userId: 'VER_4012', userRole: 'Verifikator', action: 'Approve', previousState: 'Menunggu Verifikasi', newState: 'Menunggu Validasi', entity: 'Assessment B-102', notes: 'Dokumen lengkap, foto kerusakan sesuai.' },
  { id: '3', date: '2026-08-02 11:45:10', userId: 'VAL_9088', userRole: 'Validator', action: 'Reject', previousState: 'Menunggu Validasi', newState: 'Revisi', entity: 'Assessment B-102', notes: 'Volume kerusakan atap tidak sinkron dengan foto.' },
  { id: '4', date: '2026-08-03 08:20:00', userId: 'REQ_7829', userRole: 'Surveyor', action: 'Resubmit', previousState: 'Revisi', newState: 'Menunggu Verifikasi', entity: 'Assessment B-102', notes: 'Volume atap diperbaiki menjadi 45m2.' },
  { id: '5', date: '2026-08-03 10:05:30', userId: 'VER_4012', userRole: 'Verifikator', action: 'Approve', previousState: 'Menunggu Verifikasi', newState: 'Menunggu Validasi', entity: 'Assessment B-102', notes: 'Revisi sudah sesuai.' },
];

export function OperationsCenter() {
  const [activeTab, setActiveTab] = useState('health');

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operations Center</h1>
            <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5">Tahap 11</Badge>
            <Badge variant="outline" className="border-success text-success bg-success/5">Production Ready</Badge>
          </div>
          <p className="text-slate-500 mt-1">Platform DevOps, Security, dan Monitoring Berkelanjutan.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        {[
          { id: 'health', label: 'System Health', icon: Activity },
          { id: 'security', label: 'Security Dashboard', icon: ShieldAlert },
          { id: 'audit-trail', label: 'Workflow Audit Trail', icon: ClipboardList },
          { id: 'deployment', label: 'Deployment Status', icon: Cloud },
          { id: 'monitoring', label: 'Monitoring & Logs', icon: Terminal },
          { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'health' && (
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <Server size={20} />
                    </div>
                    <Badge variant="outline" className="bg-success/5 border-success/20 text-success">99.99% Uptime</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">API Services</h3>
                  <p className="text-2xl font-bold text-slate-900">Operational</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-pupr-blue/10 flex items-center justify-center text-pupr-blue">
                      <Database size={20} />
                    </div>
                    <Badge variant="outline" className="bg-success/5 border-success/20 text-success">Healthy</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Database Cluster</h3>
                  <p className="text-2xl font-bold text-slate-900">14.2 GB</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                      <Cpu size={20} />
                    </div>
                    <Badge variant="outline" className="bg-warning/5 border-warning/20 text-warning">Medium Load</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Average CPU Load</h3>
                  <p className="text-2xl font-bold text-slate-900">62.4%</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <RefreshCw size={20} />
                    </div>
                    <Badge variant="outline" className="bg-success/5 border-success/20 text-success">Synced</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Background Sync</h3>
                  <p className="text-2xl font-bold text-slate-900">0 Queue</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">System Performance Timeline</CardTitle>
                <CardDescription>Metrics from the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockNetworkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="cpu" name="CPU Load (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert size={18} className="text-warning" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[
                    { type: 'Failed Login', desc: '5 failed attempts from IP 192.168.1.45', time: '10 mins ago', severity: 'medium' },
                    { type: 'Suspicious Activity', desc: 'Unusual data export volume detected', time: '2 hours ago', severity: 'high' },
                    { type: 'MFA Disabled', desc: 'User "Surveyor_04" disabled MFA', time: '1 day ago', severity: 'low' },
                  ].map((alert, i) => (
                    <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        alert.severity === 'high' ? 'bg-danger' : 
                        alert.severity === 'medium' ? 'bg-warning' : 'bg-slate-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{alert.type}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{alert.desc}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50 bg-slate-900 text-slate-100">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal size={18} className="text-success" />
                  Audit & Compliance Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-xs space-y-2 h-[300px] overflow-y-auto custom-scrollbar">
                <div className="text-slate-400">[2026-08-01 10:14:22] <span className="text-blue-400">INFO</span> - RLS Policy 'surveys_select' evaluated for user req_7829</div>
                <div className="text-slate-400">[2026-08-01 10:15:01] <span className="text-success">AUTH</span> - MFA OTP verified successfully for user admin@garut.go.id</div>
                <div className="text-slate-400">[2026-08-01 10:22:15] <span className="text-blue-400">INFO</span> - Document hash generated for Report B.02/PUPR-BG/VIII/2026</div>
                <div className="text-slate-400">[2026-08-01 10:45:33] <span className="text-warning">WARN</span> - Rate limit threshold reached for endpoint /api/v1/gis/layers</div>
                <div className="text-slate-400">[2026-08-01 11:02:10] <span className="text-success">AUTH</span> - Session rotated for device ID dev_9921</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'audit-trail' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList size={18} className="text-indigo-600" />
                      Workflow Audit Trail
                    </CardTitle>
                    <CardDescription>Detailed log of every approval, rejection, and state transition in the damage assessment process.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw size={14} /> Refresh Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                  {mockAuditTrail.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center
                        ${log.action === 'Approve' ? 'bg-success' : 
                          log.action === 'Reject' ? 'bg-danger' : 
                          'bg-indigo-500'}`}>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={
                                log.action === 'Approve' ? 'border-success/30 text-success bg-success/5' :
                                log.action === 'Reject' ? 'border-danger/30 text-danger bg-danger/5' :
                                log.action === 'Submit' || log.action === 'Resubmit' ? 'border-indigo-500/30 text-indigo-600 bg-indigo-500/5' :
                                'border-slate-300 text-slate-600 bg-slate-50'
                              }
                            >
                              <span className="flex items-center gap-1">
                                {log.action === 'Approve' && <CheckCircle2 size={12} />}
                                {log.action === 'Reject' && <XCircle size={12} />}
                                {(log.action === 'Submit' || log.action === 'Resubmit') && <ArrowRight size={12} />}
                                {log.action}
                              </span>
                            </Badge>
                            <span className="text-sm font-medium text-slate-900">{log.entity}</span>
                          </div>
                          
                          <p className="text-sm text-slate-600">{log.notes}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                              <User size={12} className="text-slate-400" />
                              <span className="font-medium text-slate-700">{log.userId}</span>
                              <span className="text-slate-400">({log.userRole})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Clock size={12} />
                            {log.date}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                              {log.previousState}
                            </span>
                            <ArrowRight size={14} className="text-slate-400" />
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-100">
                              {log.newState}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm text-slate-500 font-medium">Production Environment</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1 text-sm font-semibold">Active</Badge>
                    <span className="text-xs text-slate-400">us-central-1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">v2.4.1-stable</h3>
                  <p className="text-sm text-slate-500 mb-4">Deployed 2 hours ago</p>
                  <Button onClick={() => alert('Fitur akan segera hadir!')}>View Release Notes</Button>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm text-slate-500 font-medium">Staging Environment</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1 text-sm font-semibold">Building</Badge>
                    <span className="text-xs text-slate-400">us-central-1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">v2.5.0-rc.2</h3>
                  <p className="text-sm text-slate-500 mb-4">Triggered by PR #412</p>
                  <Button onClick={() => alert('Fitur akan segera hadir!')}>
                    <RefreshCw size={14} className="animate-spin text-slate-400" /> Cancel Build
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm text-slate-500 font-medium">Development (Preview)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 text-sm font-semibold">Inactive</Badge>
                    <span className="text-xs text-slate-400">us-central-1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-400 mb-1">--</h3>
                  <p className="text-sm text-slate-400 mb-4">No active previews</p>
                  <Button variant="outline" className="w-full text-sm" disabled>Manage Previews</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg">Recent Deployments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[
                    { env: 'Production', version: 'v2.4.1', status: 'Success', time: '2 hours ago', commit: 'fix: gis layer toggle', author: 'ahmad.dev' },
                    { env: 'Staging', version: 'v2.5.0-rc.1', status: 'Failed', time: '5 hours ago', commit: 'feat: add bim viewer integration', author: 'siti.eng' },
                    { env: 'Production', version: 'v2.4.0', status: 'Success', time: '2 days ago', commit: 'chore: release v2.4.0', author: 'admin_sys' },
                  ].map((dep, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dep.status === 'Success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {dep.status === 'Success' ? <Cloud size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{dep.version}</span>
                            <Badge variant="outline" className={`text-[10px] ${dep.env === 'Production' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{dep.env}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{dep.commit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{dep.time}</p>
                        <p className="text-xs text-slate-500 mt-1">by {dep.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'monitoring' && (
          <div className="space-y-6 pb-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200/50">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg">Network Traffic & API Requests</CardTitle>
                    <CardDescription>Real-time incoming request volume and latency</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 p-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockNetworkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg">Error Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="space-y-6">
                        <div>
                           <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-slate-700">4xx Client Errors</span>
                              <span className="text-warning font-bold">1.2%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-warning h-2 rounded-full" style={{ width: '15%' }}></div>
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-slate-700">5xx Server Errors</span>
                              <span className="text-danger font-bold">0.05%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-danger h-2 rounded-full" style={{ width: '2%' }}></div>
                           </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                           <Button onClick={() => alert('Fitur akan segera hadir!')}>View Error Traces</Button>
                        </div>
                     </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 pb-6">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen size={18} className="text-pupr-blue" />
                  Pengaturan Panduan Komponen
                </CardTitle>
                <CardDescription>Atur visibilitas panduan perhitungan dan contoh foto kerusakan untuk form survey mandiri.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium text-slate-900">Tampilkan Panduan Komponen</h4>
                      <p className="text-xs text-slate-500">Tampilkan icon Info yang berisi panduan perhitungan per komponen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked={localStorage.getItem('showComponentGuide') !== 'false'}
                        onChange={(e) => localStorage.setItem('showComponentGuide', e.target.checked.toString())}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pupr-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pupr-blue"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium text-slate-900">Tampilkan Contoh Foto Kerusakan</h4>
                      <p className="text-xs text-slate-500">Tampilkan galeri contoh kerusakan (Ringan, Sedang, Berat) pada panduan</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked={localStorage.getItem('showDamagePhotos') !== 'false'}
                        onChange={(e) => localStorage.setItem('showDamagePhotos', e.target.checked.toString())}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pupr-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pupr-blue"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
