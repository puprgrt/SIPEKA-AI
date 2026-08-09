import React from 'react';
import { Outlet } from 'react-router-dom';

function GarutSkylineSVG() {
  return (
    <svg className="absolute bottom-0 left-0 w-full h-auto opacity-[0.07]" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      {/* Gunung Papandayan */}
      <path d="M0 400L80 280L140 320L200 200L280 260L320 180L400 240L440 160L500 220L520 200L560 240L600 180" stroke="white" strokeWidth="1.5" fill="none" />
      {/* Gunung Cikuray */}
      <path d="M600 180L660 220L700 140L750 200L800 120L860 200L900 160L960 220L1000 180L1060 240L1100 200L1160 260L1200 220L1200 400" stroke="white" strokeWidth="1.5" fill="none" />
      {/* Puncak Cikuray */}
      <path d="M780 130L800 120L820 130" stroke="white" strokeWidth="2" fill="none" />
      {/* Terasering */}
      <path d="M100 360C200 340 300 350 400 340C500 330 600 345 700 335C800 325 900 340 1000 330C1050 325 1100 335 1200 328" stroke="white" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M0 380C100 370 200 375 350 365C500 355 600 368 750 358C900 348 1000 362 1200 352" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M50 395C200 388 350 392 500 385C650 378 800 385 950 378C1050 374 1150 380 1200 378" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Jembatan */}
      <path d="M300 340L320 310L340 340" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M310 340L320 315L330 340" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />
      <line x1="300" y1="340" x2="340" y2="340" stroke="white" strokeWidth="1" opacity="0.6" />
      {/* Kontur topografi tambahan */}
      <ellipse cx="200" cy="300" rx="60" ry="30" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
      <ellipse cx="200" cy="300" rx="90" ry="45" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15" />
      <ellipse cx="900" cy="280" rx="70" ry="35" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
      <ellipse cx="900" cy="280" rx="100" ry="50" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15" />
    </svg>
  );
}

function BlueprintGrid() {
  return (
    <div className="absolute inset-0 opacity-[0.04]" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
    }} />
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Left: Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-sunda-pattern pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Right: Visual Identity Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pupr-blue via-pupr-blue-dark to-[#061729] gradient-animate" />
        
        {/* Blueprint Grid */}
        <BlueprintGrid />
        
        {/* Garut Skyline SVG */}
        <GarutSkylineSVG />
        
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-blue/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            {/* Logo bar */}
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <img src="/logo-garut.svg" alt="Garut" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <img src="/logo-pupr.svg" alt="PUPR" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="w-px h-8 bg-white/10 mx-1" />
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <img src="/logo-sipeka.svg" alt="SIPEKA" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-blue-200 font-medium">Government Enterprise Platform</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              SIPEKA <span className="text-sky-blue-light">v2.0</span>
            </h1>
            <p className="text-blue-200/80 text-base leading-relaxed mb-8">
              Sistem Informasi Penilaian Kerusakan Bangunan Gedung Pemerintah Kabupaten Garut. 
              Platform enterprise manajemen aset dan pengambilan keputusan berbasis AI.
            </p>
            
            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {['AI-Powered', 'GIS Integration', 'BIM Viewer', 'Offline Survey', 'Real-time Dashboard'].map(f => (
                <span key={f} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-blue-200/70 font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-blue-300/40 text-xs mt-auto pt-8">
            <span>© {new Date().getFullYear()} Dinas PUPR Kabupaten Garut</span>
            <span className="font-mono" data-mono>v2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
