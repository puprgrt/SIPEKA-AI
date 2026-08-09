#!/bin/bash
sed -i 's/<CardTitle className="text-2xl font-bold">Masuk ke Akun Anda<\/CardTitle>/<CardTitle className="text-2xl font-bold text-slate-900">Masuk ke <span className="text-garut-orange">SIPEKA<\/span><\/CardTitle>/g' src/pages/auth/Login.tsx
