import React, { useEffect, useState } from 'react';
import { useGenerations, type Generation } from '../hooks/useGenerations';

export function ProjectsGrid() {
    const { listGenerations } = useGenerations();
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Generation | null>(null);

    useEffect(() => {
        listGenerations(50)
            .then(gens => setGenerations(gens))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-video rounded-2xl bg-[#111] animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    if (!generations.length) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <span className="material-symbols-outlined text-zinc-700 text-6xl">video_library</span>
                <p className="text-zinc-500 text-sm">Nenhum projeto ainda. Comece gerando sua primeira imagem ou vídeo.</p>
                <a href="/" className="mt-2 px-6 py-3 bg-[#e27241] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
                    Criar primeiro projeto
                </a>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {generations.map(gen => (
                    <div
                        key={gen.id}
                        onClick={() => setSelected(gen)}
                        className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#e27241]/30 transition-all duration-300 bg-[#111]"
                    >
                        {gen.resultUrl ? (
                            gen.type === 'video' ? (
                                <video src={gen.resultUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" muted />
                            ) : (
                                <img src={gen.resultUrl} alt={gen.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-zinc-700 text-3xl">
                                    {gen.status === 'processing' ? 'hourglass_empty' : gen.status === 'error' ? 'error' : 'image'}
                                </span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${gen.type === 'video' ? 'text-blue-400' : 'text-[#e27241]'}`}>
                                    {gen.type}
                                </span>
                                {gen.status === 'processing' && (
                                    <span className="text-[9px] text-yellow-400 uppercase tracking-widest">• Processando</span>
                                )}
                                {gen.status === 'error' && (
                                    <span className="text-[9px] text-red-400 uppercase tracking-widest">• Erro</span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-white truncate">{gen.title || gen.prompt.substring(0, 60)}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">{new Date(gen.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white">
                                <span className="material-symbols-outlined text-sm">fullscreen</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de visualização */}
            {selected && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8"
                    onClick={() => setSelected(null)}
                >
                    <div className="max-w-4xl w-full bg-[#111] rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            {selected.resultUrl && (
                                selected.type === 'video' ? (
                                    <video src={selected.resultUrl} controls autoPlay className="w-full max-h-[70vh] object-contain" />
                                ) : (
                                    <img src={selected.resultUrl} alt={selected.title} className="w-full max-h-[70vh] object-contain" />
                                )
                            )}
                        </div>
                        <div className="p-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-white font-medium mb-1">{selected.title || 'Sem título'}</h3>
                                <p className="text-zinc-400 text-sm font-light">{selected.prompt}</p>
                                <p className="text-zinc-600 text-xs mt-2">{new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="flex gap-2">
                                {selected.resultUrl && (
                                    <a
                                        href={selected.resultUrl}
                                        download={selected.type === 'video' ? 'video.mp4' : 'image.png'}
                                        className="px-4 py-2 bg-[#e27241]/20 text-[#e27241] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#e27241]/30 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download
                                    </a>
                                )}
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-4 py-2 bg-white/5 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
