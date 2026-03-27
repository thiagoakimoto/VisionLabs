import React from 'react';

export default function HowItWorks() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] py-24">
      {/* Stitch Hero equivalent for How It Works */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative z-10 w-full">
        <div className="max-w-3xl">
          <span className="text-[#e27241] font-light tracking-[0.2em] text-xs uppercase mb-4 block">
            The Methodology
          </span>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter leading-[0.9] text-white mb-8">
            Architecting <br />
            <span className="text-[#e27241]">Intelligence.</span>
          </h2>
          <p className="text-white/70 text-xl md:text-2xl font-light leading-relaxed max-w-2xl">
            Our process is a cinematic journey from raw data to refined insight. We've simplified the complex into a three-act structure.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection Path (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e27241]/30 to-transparent -translate-y-1/2 -z-10"></div>
          
          {/* Step 1: Concept */}
          <div className="group relative">
            <div className="bg-[#111] border border-white/5 rounded-xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(226,114,65,0.1)] hover:border-[#e27241]/40">
              <div className="flex flex-col gap-8">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#e27241]/20 flex items-center justify-center text-[#e27241] relative">
                  <span className="text-2xl">01</span>
                  <div className="absolute inset-0 bg-[#e27241]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h3 className="font-light text-3xl text-white mb-4">Concept</h3>
                  <p className="text-white/70 leading-relaxed">Defining the parameters of your vision. We start with the core intent, mapping out the intellectual architecture of your project.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-light uppercase tracking-widest text-[#e27241]/70">
                  <span>Phase 01</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Process */}
          <div className="group relative md:-translate-y-12">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(226,114,65,0.15)] hover:border-[#e27241]/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e27241]/5 rounded-full blur-3xl"></div>
              <div className="flex flex-col gap-8">
                <div className="w-16 h-16 rounded-full bg-[#e27241] flex items-center justify-center text-white">
                  <span className="text-2xl font-bold">02</span>
                </div>
                <div>
                  <h3 className="font-light text-3xl text-white mb-4">Process</h3>
                  <p className="text-white/70 leading-relaxed">Our neural engines begin the synthesis. Data is transformed into atmospheric visual intelligence through our proprietary obsidian-core pipelines.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-light uppercase tracking-widest text-[#e27241]">
                  <span>Phase 02</span>
                  <div className="h-px flex-1 bg-[#e27241]/30"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Result */}
          <div className="group relative">
            <div className="bg-[#111] border border-white/5 rounded-xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(226,114,65,0.1)] hover:border-[#e27241]/40">
              <div className="flex flex-col gap-8">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#e27241]/20 flex items-center justify-center text-[#e27241]">
                  <span className="text-2xl">03</span>
                  <div className="absolute inset-0 bg-[#e27241]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h3 className="font-light text-3xl text-white mb-4">Result</h3>
                  <p className="text-white/70 leading-relaxed">The final reveal. A curated, cinematic output that exceeds the initial parameters, ready for deployment or high-end presentation.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-light uppercase tracking-widest text-[#e27241]/70">
                  <span>Phase 03</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
