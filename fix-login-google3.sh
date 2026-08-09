#!/bin/bash
sed -i 's/<Button type="button" variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium" onClick={handleLogin}>/<Button type="button" variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium" onClick={handleGoogleLogin} disabled={isLoading}>/g' src/pages/auth/Login.tsx
