import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, Plus, Settings2, Users } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';



export function RoleManagement() {
  const { availableRoles: roles, setAvailableRoles: setRoles, activeRole, setActiveRole } = useRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'Custom', users: 0 });

  const handleSave = () => {
    setRoles([...roles, { ...formData, id: Date.now() } as any]);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Nonaktifkan role ini?')) {
      const roleToDelete = roles.find(r => r.id === id);
      const newRoles = roles.filter(r => r.id !== id);
      setRoles(newRoles);
      if (roleToDelete && activeRole === roleToDelete.name) {
        setActiveRole(newRoles[0]?.name || '');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold text-slate-800">Manajemen Peran (Role)</h1>
             <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5">Tahap 2</Badge>
          </div>
          <p className="text-slate-500">Kelola role dan konfigurasi Role-Based Access Control (RBAC)</p>
        </div>
        <Button variant="pupr" onClick={() => { setFormData({ name: '', description: '', type: 'Custom', users: 0 }); setIsModalOpen(true); }}>
          <Plus size={16} className="mr-2" />
          Buat Role Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-pupr-blue to-blue-800 text-white overflow-hidden relative">
            <div className="absolute -right-4 -top-4 text-white/10">
              <ShieldCheck size={120} />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg">Zero Trust Architecture</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-blue-100 mb-4">
                SIPEKA menggunakan sistem keamanan berlapis. Setiap fungsi bisnis diatur melalui matriks permission yang ketat.
              </p>
              <Link to="/admin/permissions" className="inline-block w-full">
                <Button onClick={() => alert('Fitur akan segera hadir!')}>
                  <Settings2 size={16} className="mr-2" />
                  Matriks Permission
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert size={18} className="text-warning" />
                Audit Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Role Aktif</span>
                  <span className="font-semibold text-slate-800">8</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Role Sistem Dasar</span>
                  <span className="font-semibold text-slate-800">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Role Kustom</span>
                  <span className="font-semibold text-slate-800">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          {roles.map((role) => (
            <Card key={role.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${role.type === 'System' ? 'bg-blue-50 text-pupr-blue' : 'bg-slate-50 text-slate-500'}`}>
                      <Shield size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{role.name}</h3>
                        <Badge variant="outline" className={role.type === 'System' ? 'bg-blue-50 text-pupr-blue border-pupr-blue/20' : 'bg-slate-50 text-slate-600'}>
                          {role.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{role.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Users size={14} className="text-slate-400" />
                        {role.users} Pengguna aktif
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <Button onClick={() => alert('Fitur akan segera hadir!')}>Edit Hak Akses</Button>
                    {role.type !== 'System' && <Button variant="outline" size="sm" className="text-danger border-danger/20 hover:bg-danger/10" onClick={() => handleDelete(role.id)}>Nonaktifkan</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Buat Role Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Role</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Auditor Internal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi tugas dan tanggung jawab..."
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button variant="pupr" onClick={handleSave}>Simpan Role</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
