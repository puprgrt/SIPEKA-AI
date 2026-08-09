import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, MoreVertical, Shield, User, Mail, ShieldAlert, Edit, Trash2 } from 'lucide-react';


const USERS = [
  { id: 1, name: 'Budi Santoso', email: 'budi@garutkab.go.id', role: 'Super Admin', unit: 'Sekretariat', status: 'Active', lastLogin: '2023-10-25 08:30' },
  { id: 2, name: 'Siti Aminah', email: 'siti@garutkab.go.id', role: 'Reviewer Teknis', unit: 'Bidang Tata Bangunan', status: 'Active', lastLogin: '2023-10-25 09:15' },
  { id: 3, name: 'Ahmad Ridwan', email: 'ahmad@garutkab.go.id', role: 'Surveyor', unit: 'UPT Wilayah 1', status: 'Inactive', lastLogin: '2023-10-20 16:45' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@garutkab.go.id', role: 'Kepala Bidang', unit: 'Bidang Tata Bangunan', status: 'Active', lastLogin: '2023-10-24 13:20' },
];

export function UserManagement() {
  const { availableRoles } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Surveyor', unit: '', status: 'Active' });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Surveyor', unit: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      setUsers([...users, { ...formData, id: Date.now(), lastLogin: '-' }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
             <Badge variant="outline" className="border-pupr-blue text-pupr-blue bg-pupr-blue/5">Tahap 1</Badge>
          </div>
          <p className="text-slate-500">Kelola identitas, akses, dan peran pengguna SIPEKA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert('Fitur akan segera hadir!')}>
            <ShieldAlert size={16} className="mr-2" />
            Audit Log
          </Button>
          <Button variant="pupr" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 rounded-t-xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari nama, email, atau NIP..." 
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => alert('Fitur akan segera hadir!')}>
                <Filter size={16} className="mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Pengguna</th>
                  <th className="px-6 py-4 font-medium">Role / Peran</th>
                  <th className="px-6 py-4 font-medium">Unit Kerja</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Login Terakhir</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium shrink-0">
                          {(user.name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <div className="flex items-center text-slate-500 text-xs mt-0.5">
                            <Mail size={12} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={user.role === 'Super Admin' ? 'text-pupr-blue' : 'text-slate-400'} />
                        <span className="font-medium text-slate-700">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.unit}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'} className="font-normal">
                        {user.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-pupr-blue" onClick={() => handleOpenModal(user)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-danger" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50 rounded-b-xl">
            <div>Menampilkan 1 hingga 4 dari 4 entri</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
              <Button onClick={() => alert('Fitur akan segera hadir!')}>1</Button>
              <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama Lengkap" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Unit Kerja</label>
                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Unit Kerja" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button variant="pupr" onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
