import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/svg-xaikiqc2yh";

function InterfaceRadioUnchecked({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#e27241] border border-[#e27241] border-solid overflow-clip size-[24px]"} data-name="Interface / Radio_Unchecked">
      <div className="absolute inset-[calc(16.67%-0.67px)]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
            <path d={svgPaths.p350ccb00} id="Vector" stroke="var(--stroke-0, #E27241)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <InterfaceRadioUnchecked className="relative size-[24px] bg-[#e27241]" />
          <span className="font-['Geist:Regular',sans-serif] text-[24px] text-white tracking-[-0.24px]">
            VisionLab
          </span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link 
            to="/features" 
            className={`font-['Geist:Regular',sans-serif] text-[22px] tracking-[-0.22px] transition-colors ${
              isActive('/features') ? 'text-[#e27241]' : 'text-white hover:text-[#e27241]'
            }`}
          >
            Features
          </Link>
          <Link 
            to="/how-it-works" 
            className={`font-['Geist:Regular',sans-serif] text-[22px] tracking-[-0.22px] transition-colors ${
              isActive('/how-it-works') ? 'text-[#e27241]' : 'text-white hover:text-[#e27241]'
            }`}
          >
            How it works
          </Link>
          <Link 
            to="/pricing" 
            className={`font-['Geist:Regular',sans-serif] text-[22px] tracking-[-0.22px] transition-colors ${
              isActive('/pricing') ? 'text-[#e27241]' : 'text-white hover:text-[#e27241]'
            }`}
          >
            Pricing
          </Link>
        </div>
        
        <Link
          to="#"
          className="font-['Geist:Regular',sans-serif] text-[22px] text-white tracking-[-0.22px] bg-[#e27241] hover:bg-[#d16635] transition-colors px-8 py-3 rounded-lg"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
