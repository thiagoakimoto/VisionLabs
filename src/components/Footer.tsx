import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#131313] w-full border-t border-white/5 relative z-20">
            <div className="flex flex-col md:flex-row justify-between items-center px-12 py-10 w-full max-w-7xl mx-auto">
                <div className="mb-6 md:mb-0">
                    <div className="text-lg font-black text-white tracking-widest uppercase font-light mb-2">VisionLab</div>
                    <p className="font-light text-xs text-white/50">© 2024 VisionLab. All rights reserved.</p>
                </div>
                <div className="flex gap-8">
                    <a className="font-light text-xs text-white/40 hover:text-[#e27241] transition-colors" href="#">Privacy Policy</a>
                    <a className="font-light text-xs text-white/40 hover:text-[#e27241] transition-colors" href="#">Terms of Service</a>
                    <a className="font-light text-xs text-white/40 hover:text-[#e27241] transition-colors" href="#">Twitter</a>
                    <a className="font-light text-xs text-white/40 hover:text-[#e27241] transition-colors" href="#">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};
