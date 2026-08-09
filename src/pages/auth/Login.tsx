import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, Lock, Mail, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { googleSignIn } from '../../lib/firebase';
import { cn } from '@/lib/utils';

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.error("Google sign in failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Logo Bar */}
      <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
        <div className="flex items-center gap-3 bg-white dark:bg-card p-3 px-5 rounded-2xl shadow-[var(--shadow-sm)] border border-border/60">
          <img src="/logo-garut.svg" alt="Garut" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <img src="/logo-pupr.svg" alt="PUPR" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="w-px h-8 bg-border/60" />
          <img src="/logo-sipeka.svg" alt="SIPEKA" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-xl)] bg-white dark:bg-card border border-border/40">
        <div className="p-8">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Masuk ke <span className="text-gradient-pupr">SIPEKA</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Masukkan email dan kata sandi yang telah terdaftar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email atau NIP</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={16} />
                <Input 
                  type="text" 
                  placeholder="nama@garutkab.go.id" 
                  className="pl-10 h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kata Sandi</label>
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-pupr-blue hover:text-pupr-blue-light transition-colors">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pupr-blue transition-colors" size={16} />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-11"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="pupr" 
              className="w-full h-12 text-base font-semibold shadow-md shadow-pupr-blue/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Masuk</span>
                  <ChevronRight size={18} />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card px-3 text-slate-400 font-medium">Atau masuk dengan</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 font-medium gap-2.5" 
              onClick={() => window.location.href = `https://pupr-id.vercel.app/login?redirect_url=${encodeURIComponent(window.location.origin + "/auth/callback")}`}
            >
              <div className="w-5 h-5 bg-pupr-blue rounded-md flex items-center justify-center">
                <Building className="w-3 h-3 text-white" />
              </div>
              SSO puprID
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 font-medium gap-2.5" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Workspace
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-8 space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Dinas PUPR Kabupaten Garut
        </p>
        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono" data-mono>
          Powered by SIPEKA v2.0 Enterprise
        </p>
      </div>
    </div>
  );
}
