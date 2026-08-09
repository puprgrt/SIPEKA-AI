import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, History, CheckCircle2 } from 'lucide-react';

export interface AuditLog {
  id: string;
  nomorSurat: string;
  hal: string;
  signerId: string;
  signerName: string;
  timestamp: string;
  hash: string;
  version: number;
}

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('sipeka_signature_audit');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Failed to parse audit logs');
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="text-pupr-blue" />
          Riwayat Tanda Tangan (Audit Trail)
        </CardTitle>
        <CardDescription>
          Catatan lengkap penandatanganan dokumen elektronik beserta informasi versi dan hash kriptografis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">Belum Ada Riwayat</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
              Dokumen yang ditandatangani secara elektronik akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>No. Dokumen</TableHead>
                  <TableHead>Penandatangan</TableHead>
                  <TableHead>Versi</TableHead>
                  <TableHead>Signature Hash (SHA-256)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-slate-700 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{log.nomorSurat}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{log.hal}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 font-normal">
                        <CheckCircle2 size={12} className="mr-1 text-emerald-500" />
                        {log.signerName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">v{log.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 text-slate-600 p-1 rounded font-mono truncate block max-w-[200px]">
                        {log.hash}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
