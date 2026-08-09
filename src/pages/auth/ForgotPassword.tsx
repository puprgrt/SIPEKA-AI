import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/auth/login');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-pupr-blue mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Kembali ke Login
      </Link>

      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/90">
        {step === 1 && (
          <>
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 bg-blue-50 text-pupr-blue rounded-xl flex items-center justify-center mb-4">
                <KeyRound size={24} />
              </div>
              <CardTitle className="text-2xl font-bold">Lupa Kata Sandi</CardTitle>
              <CardDescription>
                Masukkan email Anda untuk menerima kode verifikasi (OTP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="email" 
                      placeholder="nama@garutkab.go.id" 
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="pupr" 
                  className="w-full h-11 mt-2 text-base font-medium shadow-md shadow-pupr-blue/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Memproses...' : 'Kirim Kode Verifikasi'}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 bg-blue-50 text-pupr-blue rounded-xl flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <CardTitle className="text-2xl font-bold">Cek Email Anda</CardTitle>
              <CardDescription>
                Kami telah mengirimkan 6 digit kode OTP ke <span className="font-semibold text-slate-800">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kode OTP</label>
                  <Input 
                    type="text" 
                    placeholder="000000" 
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="pupr" 
                  className="w-full h-11 mt-2 text-base font-medium shadow-md shadow-pupr-blue/20"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi Kode'}
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Belum menerima kode? <button type="button" className="text-pupr-blue font-semibold hover:underline">Kirim ulang</button>
                </p>
              </form>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <CardTitle className="text-2xl font-bold">Buat Sandi Baru</CardTitle>
              <CardDescription>
                Verifikasi berhasil. Silakan buat kata sandi baru untuk akun Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kata Sandi Baru</label>
                  <Input 
                    type="password" 
                    placeholder="Minimal 8 karakter" 
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ulangi Kata Sandi Baru</label>
                  <Input 
                    type="password" 
                    placeholder="Minimal 8 karakter" 
                    className="h-11"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="pupr" 
                  className="w-full h-11 mt-4 text-base font-medium shadow-md shadow-pupr-blue/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
