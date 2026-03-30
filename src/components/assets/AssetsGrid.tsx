import React, { useEffect, useState } from 'react';
import { useAssets, type Asset } from '../hooks/useAssets';

export function AssetsGrid() {
    const { listAssets, deleteAsset } = useAssets();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Asset | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 12;

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este asset?')) {
            const success = await deleteAsset(id);
            if (success) {
                setAssets(prev => prev.filter(a => a.id !== id));
                if (selected?.id === id) setSelected(null);
            }
        }
    };

    const loadAssets = (pageIndex: number) => {
        if (pageIndex === 0) setLoading(true);
        listAssets(limit, pageIndex * limit)
            .then(data => {
                if (data.length < limit) setHasMore(false);
                setAssets(prev => pageIndex === 0 ? data : [...prev, ...data]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAssets(0);
    }, []);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        loadAssets(next);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-[#111] animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    if (!assets.length) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <span className="material-symbols-outlined text-zinc-700 text-6xl">perm_media</span>
                <p className="text-zinc-500 text-sm">Nenhum asset carregado. Cole imagens ou vídeos no chat para salvá-los aqui.</p>
                <a href="/" className="mt-2 px-6 py-3 bg-[#e27241] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
                    Ir para o Workspace
                </a>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {assets.map(asset => (
                    <div
                        key={asset.id}
                        onClick={() => setSelected(asset)}
                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#e27241]/30 transition-all duration-300 bg-[#111]"
                    >
                        {asset.media_type.startsWith('video') ? (
                            <video className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" muted playsInline preload="metadata">
                                <source src={asset.media_url} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={asset.media_url} alt="User Asset" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${asset.media_type.startsWith('video') ? 'text-blue-400' : 'text-[#e27241]'}`}>
                                {asset.media_type.startsWith('video') ? 'Video' : 'Image'}
                            </span>
                            <p className="text-[10px] text-zinc-400 mt-1">{new Date(asset.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">fullscreen</span>
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, asset.id)}
                                className="w-8 h-8 rounded-full bg-red-500/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && assets.length > 0 && (
                <div className="flex justify-center mt-4 mb-10">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 border border-[#e27241]/30 text-[#e27241] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e27241]/10 transition-colors"
                    >
                        Carregar mais
                    </button>
                </div>
            )}

            {/* Modal de visualização */}
            {selected && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                >
                    <div className="max-w-4xl w-full flex flex-col items-center justify-center p-6 border border-white/5 bg-[#0a0a0a] rounded-3xl" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full flex justify-center max-h-[70vh]">
                            {selected.media_type.startsWith('video') ? (
                                <video controls autoPlay muted playsInline preload="auto" className="max-h-[70vh] rounded-lg object-contain">
                                    <source src={selected.media_url} type="video/mp4" />
                                </video>
                            ) : (
                                <img src={selected.media_url} alt="User Asset" className="max-h-[70vh] rounded-lg object-contain shadow-2xl" />
                            )}
                        </div>
                        <div className="w-full flex justify-between items-center mt-6">
                            <div>
                                <p className="text-zinc-400 text-sm font-light italic">" {selected.content} "</p>
                                <p className="text-zinc-600 text-xs mt-1">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={selected.media_url}
                                    download
                                    target="_blank"
                                    className="px-4 py-2 bg-[#e27241]/20 text-[#e27241] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#e27241]/30 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Abrir
                                </a>
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
