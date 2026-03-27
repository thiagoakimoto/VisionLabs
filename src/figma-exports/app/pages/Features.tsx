import React from 'react';

export default function Features() {
  return (
    <div className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Misty Background Elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] pointer-events-none opacity-50" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(226, 114, 65, 0.08) 0%, transparent 70%)'}}></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(226, 114, 65, 0.08) 0%, transparent 70%)'}}></div>
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative z-10">
        <div className="max-w-3xl">
          <span className="text-[#e27241] font-light tracking-[0.2em] text-xs uppercase mb-6 block">Capabilities</span>
          <h2 className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-8 text-white">
            Beyond the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e27241] to-[#ffba20]">Visual Edge.</span>
          </h2>
          <p className="text-white/70 text-xl leading-relaxed font-light max-w-2xl">
            Experience an editorial-grade AI interface designed for creators. Precision automation meets generative brilliance in a cinematographic digital environment.
          </p>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-7xl mx-auto px-8 mb-40 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Large Feature: Vision Automation */}
          <div className="md:col-span-8 rounded-xl p-10 flex flex-col justify-between group h-[500px] relative overflow-hidden transition-all duration-300" 
               style={{ background: 'rgba(53, 53, 52, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(88, 66, 53, 0.15)' }}
               onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(226, 114, 65, 0.4)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(226, 114, 65, 0.05)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(88, 66, 53, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#e27241]/10 rounded-full flex items-center justify-center mb-8 border border-[#e27241]/20 group-hover:border-[#e27241]/50 transition-colors">
                <span className="material-symbols-outlined text-[#e27241] text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>visibility</span>
              </div>
              <h3 className="text-4xl font-light font-bold text-white mb-4">Vision Automation</h3>
              <p className="text-white/70 text-lg max-w-md">Real-time object detection and contextual scene understanding powered by neural pulse architecture.</p>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-40 group-hover:opacity-60 transition-opacity">
              <img alt="Vision Automation visualization" className="w-full h-full object-cover" src="/media/stitch-features-vision.jpg"/>
            </div>
          </div>
          
          {/* Small Feature: High-Fidelity Assets */}
          <div className="md:col-span-4 rounded-xl p-10 flex flex-col group h-[500px] transition-all duration-300"
               style={{ background: 'rgba(53, 53, 52, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(88, 66, 53, 0.15)' }}
               onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(226, 114, 65, 0.4)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(226, 114, 65, 0.05)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(88, 66, 53, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="w-16 h-16 bg-[#e27241]/10 rounded-full flex items-center justify-center mb-8 border border-[#e27241]/20 group-hover:border-[#e27241]/50 transition-colors">
              <span className="material-symbols-outlined text-[#e27241] text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
            </div>
            <h3 className="text-3xl font-light font-bold text-white mb-4">High-Fidelity Assets</h3>
            <p className="text-white/70 leading-relaxed">Synthesize ultra-high resolution textures and geometry with physically based rendering logic.</p>
            <div className="mt-auto pt-8 border-t border-white/10">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-white/80">
                  <span className="material-symbols-outlined text-[#e27241] text-sm">check_circle</span> 8K Texture Synthesis
                </li>
                <li className="flex items-center gap-3 text-sm text-white/80">
                  <span className="material-symbols-outlined text-[#e27241] text-sm">check_circle</span> Ray-Traced Shadows
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Feature: Generative Intelligence */}
          <div className="md:col-span-12 rounded-xl p-12 flex flex-col md:flex-row items-center gap-12 group transition-all duration-300"
               style={{ background: 'rgba(53, 53, 52, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(88, 66, 53, 0.15)' }}
               onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(226, 114, 65, 0.4)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(226, 114, 65, 0.05)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(88, 66, 53, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="flex-1">
              <div className="w-16 h-16 bg-[#e27241]/10 rounded-full flex items-center justify-center mb-8 border border-[#e27241]/20">
                <span className="material-symbols-outlined text-[#e27241] text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>psychology</span>
              </div>
              <h3 className="text-5xl font-light font-bold text-white mb-6">Generative Intelligence</h3>
              <p className="text-white/70 text-xl leading-relaxed mb-8">
                  Transform conceptual sketches into cinematic masterpieces. Our engines adapt to your creative intent, offering intelligent suggestions and non-destructive iterations.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="px-4 py-2 bg-[#1a1a1a] rounded-full text-xs font-light tracking-widest text-[#e27241] uppercase border border-white/20">Neural Core</span>
                <span className="px-4 py-2 bg-[#1a1a1a] rounded-full text-xs font-light tracking-widest text-[#e27241] uppercase border border-white/20">Real-Time Fluidics</span>
                <span className="px-4 py-2 bg-[#1a1a1a] rounded-full text-xs font-light tracking-widest text-[#e27241] uppercase border border-white/20">Latent Refinement</span>
              </div>
            </div>
            <div className="flex-1 w-full h-80 rounded-xl overflow-hidden border border-white/10">
              <img alt="Generative AI Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="/media/stitch-features-generative.jpg"/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
