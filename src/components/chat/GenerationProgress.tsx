import React, { useEffect, useState } from 'react';

interface GenerationProgressProps {
    type: 'image' | 'video';
}

export function GenerationProgress({ type }: GenerationProgressProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const label = type === 'video' ? 'Gerando vídeo...' : 'Gerando imagem...';
    const estimate = type === 'video' ? '~90s' : '~10s';

    return (
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#e27241]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#e27241] text-sm animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div
                className="rounded-2xl rounded-tl-none p-4 max-w-[80%] border border-[rgba(88,66,53,0.15)]"
                style={{ background: 'rgba(53,53,52,0.4)', backdropFilter: 'blur(40px)' }}
            >
                <p className="text-sm text-zinc-400 font-light mb-3">{label}</p>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e27241] rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-zinc-600">{elapsed}s decorridos</span>
                    <span className="text-[10px] text-zinc-600">Estimativa {estimate}</span>
                </div>
            </div>
        </div>
    );
}
