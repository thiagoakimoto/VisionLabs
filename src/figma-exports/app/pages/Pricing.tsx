import React from 'react';

export default function Pricing() {
  return (
    <div className="relative pt-32 pb-40 overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#050505]">
      {/* Ambient Light Leakage */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none -mr-96 -mt-96 opacity-40" 
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(226, 114, 65, 0.08) 0%, transparent 70%)' }}>
      </div>
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none -ml-64 -mb-64 opacity-20" 
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(226, 114, 65, 0.08) 0%, transparent 70%)' }}>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        
        {/* Hero Header */}
        <div className="mb-20 text-center">
          <h2 className="font-light text-5xl md:text-7xl tracking-tighter text-white mb-6">
            Invest in <span className="text-[#e27241]" style={{ textShadow: '0 0 20px rgba(226, 114, 65, 0.3)' }}>Intelligence</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Scalable visual processing and neural architecture designed for the cinematic era of technology. Select the tier that matches your vision.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          
          {/* Starter Plan */}
          <div className="bg-[#111]/40 border border-white/10 backdrop-blur-md hover:bg-[#111]/80 transition-all duration-500 p-10 rounded-xl flex flex-col h-full">
            <div className="mb-8">
              <span className="text-xs font-light uppercase tracking-[0.2em] text-white/50">Entry Tier</span>
              <h3 className="text-3xl font-light font-bold mt-2 text-white">Starter</h3>
            </div>
            <div className="mb-10 text-white">
              <span className="text-4xl font-light font-bold">$49</span>
              <span className="text-white/50 text-sm font-light">/month</span>
            </div>
            <ul className="space-y-5 mb-12 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#e27241] text-base">check_circle</span>
                <span>100 AI Generations / mo</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#e27241] text-base">check_circle</span>
                <span>Standard Processing Priority</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#e27241] text-base">check_circle</span>
                <span>Single Node Access</span>
              </li>
            </ul>
            <button className="w-full py-4 border border-white/10 rounded-xl text-xs font-light text-white uppercase tracking-widest hover:bg-white/5 transition-all">
              Begin Journey
            </button>
          </div>

          {/* Pro Plan (Most Popular) */}
          <div className="relative bg-[#1a1a1a]/80 border border-[#e27241]/40 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(226,114,65,0.15)] ring-1 ring-[#e27241]/20 p-10 rounded-xl flex flex-col h-full scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#e27241] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap shadow-lg shadow-[#e27241]/30">
              Most Popular
            </div>
            <div className="mb-8">
              <span className="text-xs font-light font-bold uppercase tracking-[0.2em] text-[#e27241]">Advanced Tier</span>
              <h3 className="text-3xl font-light font-bold mt-2 text-white">Pro</h3>
            </div>
            <div className="mb-10 text-white">
              <span className="text-4xl font-light font-bold" style={{ textShadow: '0 0 20px rgba(226, 114, 65, 0.3)' }}>$149</span>
              <span className="text-white/50 text-sm font-light">/month</span>
            </div>
            <ul className="space-y-5 mb-12 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white/90">
                <span className="material-symbols-outlined text-[#e27241] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Unlimited Generations</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/90">
                <span className="material-symbols-outlined text-[#e27241] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Neural Upscaling (4K)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/90">
                <span className="material-symbols-outlined text-[#e27241] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Priority GPU Rendering</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/90">
                <span className="material-symbols-outlined text-[#e27241] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Custom Model Training</span>
              </li>
            </ul>
            <button className="w-full py-4 bg-[#e27241] text-white rounded-xl text-xs font-light font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#e27241]/20 transition-all cursor-pointer">
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#111]/40 border border-white/10 backdrop-blur-md hover:bg-[#111]/80 transition-all duration-500 p-10 rounded-xl flex flex-col h-full">
            <div className="mb-8">
              <span className="text-xs font-light font-bold uppercase tracking-[0.2em] text-white/50">Scalable Tier</span>
              <h3 className="text-3xl font-light font-bold mt-2 text-white">Enterprise</h3>
            </div>
            <div className="mb-10 text-white">
              <span className="text-4xl font-light font-bold">Custom</span>
            </div>
            <ul className="space-y-5 mb-12 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#ecc161] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>On-Premise Deployment</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#ecc161] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Dedicated Account Engineer</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#ecc161] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>SLA Support (24/7)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <span className="material-symbols-outlined text-[#ecc161] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Custom Neural Pipelines</span>
              </li>
            </ul>
            <button className="w-full py-4 border border-white/10 rounded-xl text-xs font-light text-white uppercase tracking-widest hover:bg-white/5 transition-all">
              Contact Sales
            </button>
          </div>

        </div>

        {/* Trust Section (Bento Lite) */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-[#161616] p-8 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="font-light text-white font-bold text-xl mb-1">Global Infrastructure</p>
              <p className="text-white/50 text-sm font-light">Processing nodes in 12 regions for zero latency.</p>
            </div>
            <div className="h-16 w-16 bg-[#e27241]/10 rounded-full flex items-center justify-center border border-[#e27241]/20">
              <span className="material-symbols-outlined text-[#e27241]">public</span>
            </div>
          </div>
          
          <div className="bg-[#161616] p-8 rounded-xl border border-white/5 flex flex-col justify-center text-center">
            <p className="text-3xl font-light font-bold text-[#e27241]">99.9%</p>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Uptime SLA</p>
          </div>
          
          <div className="bg-[#161616] p-8 rounded-xl border border-white/5 flex flex-col justify-center text-center">
            <p className="text-3xl font-light font-bold text-[#ecc161]">256-bit</p>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">AES Encryption</p>
          </div>
        </div>

      </div>
    </div>
  );
}
