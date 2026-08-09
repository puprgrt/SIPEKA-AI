import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, ShieldCheck, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';

const MODULES = [
  { id: 'dashboard', name: 'Dashboard & Analytics' },
  { id: 'survey', name: 'Survey Lapangan' },
  { id: 'assessment', name: 'Assessment & Penilaian' },
  { id: 'report', name: 'Laporan & Dokumen' },
  { id: 'gis', name: 'GIS & Peta' },
  { id: 'admin', name: 'Administrasi Sistem' },
];



// Mock permission data
const PERMISSIONS: Record<string, Record<string, boolean>> = {
  'dashboard': { 'Super Admin': true, 'Kepala Dinas': true, 'Reviewer Teknis': true, 'Surveyor': true },
  'survey': { 'Super Admin': true, 'Kepala Dinas': false, 'Reviewer Teknis': true, 'Surveyor': true },
  'assessment': { 'Super Admin': true, 'Kepala Dinas': false, 'Reviewer Teknis': true, 'Surveyor': false },
  'report': { 'Super Admin': true, 'Kepala Dinas': true, 'Reviewer Teknis': true, 'Surveyor': false },
  'gis': { 'Super Admin': true, 'Kepala Dinas': true, 'Reviewer Teknis': true, 'Surveyor': true },
  'admin': { 'Super Admin': true, 'Kepala Dinas': false, 'Reviewer Teknis': false, 'Surveyor': false },
};

export function PermissionMatrix() {
  const { availableRoles } = useRole();
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link to="/admin/roles" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-pupr-blue transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Kembali ke Manajemen Role
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Matriks Permission</h1>
          <p className="text-slate-500">Konfigurasi hak akses (Create, Read, Update, Delete) per modul untuk setiap Role</p>
        </div>
        <Button onClick={() => alert('Fitur akan segera hadir!')}>
          <Save size={16} className="mr-2" />
          Simpan Perubahan
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-800 bg-slate-100/50 sticky left-0 z-10 w-64">Modul Sistem</th>
                  {availableRoles.map((role) => (
                    <th key={role.id} className="px-6 py-4 font-medium text-center border-l border-slate-100">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck size={16} className="text-slate-400" />
                        {role.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULES.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#f1f5f9]">
                      {mod.name}
                    </td>
                    {availableRoles.map((role) => {
                      const hasAccess = (PERMISSIONS[mod.id]?.[role.name] || role.name === 'Super Administrator' || false) || false;
                      return (
                        <td key={`${mod.id}-${role.name}`} className="px-6 py-4 text-center border-l border-slate-100">
                          <button 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                              role.name === 'Super Administrator' 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : hasAccess 
                                  ? 'bg-blue-50 text-pupr-blue hover:bg-blue-100' 
                                  : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400'
                            }`}
                            disabled={role.name === 'Super Administrator'}
                          >
                            {hasAccess ? <Check size={16} /> : <X size={16} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <h4 className="font-semibold text-slate-800 mb-2">Informasi Matriks</h4>
            <ul className="text-sm text-slate-500 space-y-1 list-disc pl-5">
              <li>Role <b>Super Admin</b> tidak dapat diubah (selalu memiliki akses penuh).</li>
              <li>Klik pada kotak ceklis untuk mengubah hak akses suatu role terhadap modul tertentu.</li>
              <li>Pastikan menekan tombol <b>Simpan Perubahan</b> setelah selesai melakukan konfigurasi.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
