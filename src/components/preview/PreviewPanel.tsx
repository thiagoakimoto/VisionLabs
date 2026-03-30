import React, { useEffect, useState } from 'react';
import { useGenerations, type Generation } from '../hooks/useGenerations';

interface CurrentResult {
    type: 'image' | 'video';
    url: string;
    title?: string;
    videoId?: string;
    aspectRatio?: string;
    generationId?: number;
}

interface PreviewPanelProps {
    currentResult?: CurrentResult | null;
    sessionId?: string;
}

export function PreviewPanel({ currentResult, sessionId }: PreviewPanelProps) {
    const { listGenerations } = useGenerations();
    const [recentThumbs, setRecentThumbs] = useState<Generation[]>([]);
    const [selected, setSelected] = useState<CurrentResult | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    // Atualiza quando chega resultado novo
    useEffect(() => {
        if (currentResult) {
            setSelected(currentResult);
            // Recarrega thumbnails restrito à sessão atual (se definida)
            listGenerations(6, 0, sessionId).then(gens => setRecentThumbs(gens.filter(g => g.status === 'complete')));
        }
    }, [currentResult, listGenerations, sessionId]);

    // Carrega thumbnails iniciais ou quando a sessão muda
    useEffect(() => {
        listGenerations(6, 0, sessionId).then(gens => {
            const completed = gens.filter(g => g.status === 'complete');
            setRecentThumbs(completed);
            // Ao trocar de sessão, reseta a imagem principal se necessário
            if (!currentResult && completed.length > 0) {
                // setSelected(null); // mantem focado na mais recente se não tiver seleção explicit
            } else if (!currentResult || completed.length === 0) {
                setSelected(null);
            }
        });
    }, [sessionId, listGenerations, currentResult]);

    const display = selected || (recentThumbs[0] ? {
        type: recentThumbs[0].type,
        url: recentThumbs[0].resultUrl || '',
        title: recentThumbs[0].title,
        aspectRatio: recentThumbs[0].aspectRatio,
    } : null);

    return (
        <>
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Live Preview</h3>
                <span className="material-symbols-outlined text-[#e27241] text-sm">auto_awesome</span>
            </div>

            {/* Preview principal */}
            <div className="group relative rounded-2xl overflow-hidden ghost-border bg-[#050505]"
                 style={{ aspectRatio: (display?.aspectRatio === '9:16') ? '9/16' : '16/9' }}>
                {display?.url ? (
                    display.type === 'video' ? (
                        <video
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            playsInline
                            loop
                            preload="auto"
                        >
                            <source src={display.url} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={display.url}
                            alt={display.title || 'Preview'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-zinc-700 text-4xl">image</span>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Aguardando geração</p>
                    </div>
                )}

                {display?.url && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-[#e27241] uppercase tracking-tighter drop-shadow-md">
                                    {display.type === 'video' ? 'Vídeo' : 'Imagem'}
                                </p>
                                <h4 className="text-sm font-medium text-white truncate w-40 drop-shadow-md">
                                    {display.title || 'Geração sem título'}
                                </h4>
                            </div>
                            <div className="flex gap-2">
                                {display.url && (
                                    <a
                                        href={display.url}
                                        download={display.type === 'video' ? 'visionlabs-video.mp4' : 'visionlabs-image.png'}
                                        className="w-9 h-9 rounded-full glass-panel flex items-center justify-center hover:bg-[#e27241]/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-white text-base">download</span>
                                    </a>
                                )}
                                <button
                                    onClick={() => setFullscreen(true)}
                                    className="w-9 h-9 rounded-full glass-panel flex items-center justify-center hover:bg-[#e27241]/20 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-white text-base">fullscreen</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails recentes */}
            {recentThumbs.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {recentThumbs.slice(0, 4).map(gen => (
                        <button
                            key={gen.id}
                            onClick={() => setSelected({ type: gen.type, url: gen.resultUrl!, title: gen.title, aspectRatio: gen.aspectRatio })}
                            className="aspect-square rounded-xl overflow-hidden ghost-border relative group cursor-pointer"
                        >
                            {gen.type === 'video' ? (
                                <video className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" muted playsInline preload="metadata">
                                    <source src={gen.resultUrl!} type="video/mp4" />
                                </video>
                            ) : (
                                <img src={gen.resultUrl!} alt={gen.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-sm">visibility</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Parâmetros */}
            {display && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Parâmetros</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                            #{display.generationId || '—'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3">
                        <div>
                            <p className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">Tipo</p>
                            <p className="text-xs text-zinc-300 font-light mt-1 capitalize">{display.type}</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">Proporção</p>
                            <p className="text-xs text-zinc-300 font-light mt-1">{display.aspectRatio || '16:9'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen */}
            {fullscreen && display?.url && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-pointer"
                    onClick={() => setFullscreen(false)}
                >
                    {display.type === 'video' ? (
                        <video controls autoPlay muted playsInline preload="auto" className="max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                            <source src={display.url} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={display.url} alt="Fullscreen" className="max-w-full max-h-full object-contain" />
                    )}
                    <button className="absolute top-6 right-6 text-white/60 hover:text-white">
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>
            )}
        </>
    );
}
