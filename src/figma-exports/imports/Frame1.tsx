import svgPaths from "./svg-xaikiqc2yh";
import imgHf20260214043841016869D1Cc0A4B2CBd96D3Dd6Bc7792D1 from "figma:asset/8dbaee134c10bc2243d18e95af68d70db5d8b521.png";

function InterfaceRadioUnchecked({ className }: { className?: string }) {
  return (
    <div className={className || "absolute bg-[#e27241] border border-[#e27241] border-solid left-[98px] overflow-clip size-[24px] top-[62px]"} data-name="Interface / Radio_Unchecked">
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

function ArrowCaretDownMd({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[491px] overflow-clip size-[24px] top-[62px]"} data-name="Arrow / Caret_Down_MD">
      <div className="absolute inset-[41.67%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
            <path d="M9 1L5 5L1 1" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute h-[903px] left-0 top-0 w-[1615px]" data-name="hf_20260214_043841_016869d1-cc0a-4b2c-bd96-d3dd6bc7792d 1">
        <div className="absolute inset-[0_-0.25%_-0.89%_-0.25%]">
          <img alt="" className="block max-w-none size-full" height="911" src={imgHf20260214043841016869D1Cc0A4B2CBd96D3Dd6Bc7792D1} width="1623" />
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Geist:Regular',sans-serif] font-normal h-[192px] justify-center leading-[60px] left-[415px] mix-blend-screen text-[48px] text-center text-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white top-[452px] tracking-[-0.48px] w-[502px]">
        <p className="mb-0">AI Automation,</p>
        <p className="text-[#e27241]">Made Human</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Geist:Regular',sans-serif] font-normal h-[149px] justify-center leading-[0] left-[1209.5px] mix-blend-screen text-[28px] text-center text-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white top-[797.5px] tracking-[-0.28px] w-[613px]">
        <p className="leading-[45px]">Vision Labs is an integrated generative intelligence platform designed to transform concepts into high-fidelity visual assets.</p>
      </div>
      <p className="-translate-x-1/2 absolute font-['Geist:Regular',sans-serif] font-normal h-[205px] leading-[120px] left-[196px] mix-blend-screen text-[#fff6f6] text-[28px] text-center top-[782px] tracking-[-0.28px] w-[196px]">Get Started</p>
      <p className="-translate-x-1/2 absolute font-['Geist:Regular',sans-serif] font-normal h-[205px] leading-[120px] left-[1418px] mix-blend-screen text-[#fff6f6] text-[28px] text-center top-[13px] tracking-[-0.28px] w-[196px]">Get Started</p>
      <p className="-translate-x-full absolute font-['Geist:Regular',sans-serif] font-normal leading-[96px] left-[249px] text-[24px] text-right text-white top-[26px] tracking-[-0.24px] whitespace-nowrap">VisionLab</p>
      <InterfaceRadioUnchecked />
      <p className="-translate-x-full absolute font-['Geist:Regular',sans-serif] font-normal leading-[96px] left-[491px] mix-blend-screen text-[22px] text-right text-white top-[26px] tracking-[-0.22px] whitespace-nowrap">Features</p>
      <ArrowCaretDownMd />
      <p className="-translate-x-full absolute font-['Geist:Regular',sans-serif] font-normal leading-[96px] left-[692px] mix-blend-screen text-[22px] text-right text-white top-[26px] tracking-[-0.22px] whitespace-nowrap">How it works</p>
      <p className="-translate-x-full absolute font-['Geist:Regular',sans-serif] font-normal leading-[96px] left-[820px] mix-blend-screen text-[22px] text-right text-white top-[26px] tracking-[-0.22px] whitespace-nowrap">Pricing</p>
    </div>
  );
}