import imgHf20260214043841016869D1Cc0A4B2CBd96D3Dd6Bc7792D1 from "figma:asset/8dbaee134c10bc2243d18e95af68d70db5d8b521.png";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          alt="" 
          className="w-full h-full object-cover" 
          src={imgHf20260214043841016869D1Cc0A4B2CBd96D3Dd6Bc7792D1} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="font-['Geist:Regular',sans-serif] text-[48px] leading-[60px] tracking-[-0.48px] text-white mb-16">
            AI Automation,
            <br />
            <span className="text-[#e27241]">Made Human</span>
          </h1>
          
          <p className="font-['Geist:Regular',sans-serif] text-[28px] leading-[45px] tracking-[-0.28px] text-white max-w-2xl mx-auto">
            Vision Labs is an integrated generative intelligence platform designed to transform concepts into high-fidelity visual assets.
          </p>
        </div>
      </div>
    </div>
  );
}