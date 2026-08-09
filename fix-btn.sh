#!/bin/bash
sed -i '115s/.*/            <Button type=\"button\" variant=\"outline\" className=\"w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium\" onClick={handleLogin}>/' src/pages/auth/Login.tsx
