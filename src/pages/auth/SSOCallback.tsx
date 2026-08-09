import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function SSOCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Mengautentikasi dengan PUPR-ID...');

  useEffect(() => {
    const processSSO = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token') || urlParams.get('code');
        
        if (token) {
          setStatus('Token berhasil diterima. Memverifikasi...');
          // Simulasi verifikasi token ke backend puprid.up.railway.app
          // Real case: fetch('https://puprid.up.railway.app/api/v1/userinfo', { headers: { Authorization: `Bearer ${token}` } })
          setTimeout(() => {
            setStatus('Autentikasi berhasil. Mengalihkan...');
            setTimeout(() => {
              navigate('/');
            }, 500);
          }, 1000);
        } else {
          // Fallback untuk demo jika redirect langsung kembali tanpa token
          setStatus('Mensimulasikan verifikasi SSO PUPR-ID...');
          setTimeout(() => {
             navigate('/');
          }, 1500);
        }
      } catch (error) {
        setStatus('Gagal melakukan autentikasi SSO.');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    };
    processSSO();
  }, [navigate, location]);

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/90">
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-garut-orange animate-spin" />
          <h2 className="text-lg font-semibold text-slate-800">SSO PUPR-ID</h2>
          <p className="text-sm text-slate-500 text-center">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
