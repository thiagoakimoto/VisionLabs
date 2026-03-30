import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageBubble, type Message } from './MessageBubble';
import { ImageAttachment } from './ImageAttachment';
import { GenerationProgress } from './GenerationProgress';
import { useAuth } from '../hooks/useAuth';
import { useGenerations, type GenerationResult } from '../hooks/useGenerations';

interface ChatInterfaceProps {
    onResult?: (result: GenerationResult & { type: 'image' | 'video' }) => void;
    sessionId?: string;
    onSessionCreated?: (id: string) => void;
}

function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatInterface({ onResult, sessionId: propSessionId, onSessionCreated }: ChatInterfaceProps) {
    const { authFetch } = useAuth();
    const { createImageGeneration, createVideoGeneration, pollStatus } = useGenerations();

    const [sessionId, setSessionId] = useState<string>(propSessionId || 'default-session');
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'image' | 'video'>('image');
    const [attachedImages, setAttachedImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingType, setGeneratingType] = useState<'image' | 'video'>('image');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stopPollingRef = useRef<(() => void) | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const currentSessionIdRef = useRef(sessionId);

    // Mantém o ref atualizado com o sessionId currente da UI
    useEffect(() => {
        currentSessionIdRef.current = sessionId;
    }, [sessionId]);

    // Atualiza sessão quando a prop muda (ao clicar numa conversa anterior)
    useEffect(() => {
        if (propSessionId && propSessionId !== sessionId) {
            setSessionId(propSessionId);
        }
    }, [propSessionId]);

    // Carrega histórico de mensagens da sessão atual
    useEffect(() => {
        setMessages([]); // Limpa mensagens da sessão anterior
        let cancelled = false; // Previne atualizacao dupla (React StrictMode)
        
        authFetch(`/api/chat/messages?sessionId=${sessionId}&limit=50`)
            .then(r => r.json())
            .then(data => {
                if (cancelled) return;
                const loaded: Message[] = (data.messages || []).map((m: any) => ({
                    id: String(m.id),
                    role: m.role,
                    content: m.content,
                    mediaUrl: m.media_url || undefined,
                    mediaType: m.media_type || undefined,
                    createdAt: m.created_at,
                }));
                if (loaded.length === 0) {
                    setMessages([{
                        id: 'welcome',
                        role: 'assistant',
                        content: "Estou pronto para renderizar sua visão. Você pode especificar movimentos de câmera, condições de iluminação e densidade atmosférica. O que vamos criar hoje?",
                    }]);
                } else {
                    setMessages(loaded);
                }
            })
            .catch(() => {
                if (cancelled) return;
                setMessages([{
                    id: 'welcome',
                    role: 'assistant',
                    content: "Estou pronto para renderizar sua visão. O que vamos criar hoje?",
                }]);
            });
        
        return () => { cancelled = true; }; // Cleanup previne duplicata
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string, mediaUrl?: string, mediaType?: string, generationId?: number, targetSessionId?: string) => {
        try {
            await authFetch('/api/chat/messages', {
                method: 'POST',
                body: JSON.stringify({ role, content, mediaUrl, mediaType, generationId, sessionId: targetSessionId || sessionId }),
            });
        } catch { /* ignora erros de persistência */ }
    }, [authFetch, sessionId]);

    const addMessage = useCallback((msg: Message) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    // Nova conversa: gera um novo sessionId localmente sem apagar o histórico
    const handleNewChat = useCallback(() => {
        const newId = generateSessionId();
        setSessionId(newId);
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: "Nova conversa iniciada! O que vamos criar?",
        }]);
        setAttachedImages([]);
        setPrompt('');
        onSessionCreated?.(newId);

        // Notifica a sidebar via evento customizado
        window.dispatchEvent(new CustomEvent('chat:new-session', { detail: { sessionId: newId } }));
    }, [onSessionCreated]);

    const handleSubmit = useCallback(async () => {
        const trimmedPrompt = prompt.trim();
        if ((!trimmedPrompt && attachedImages.length === 0) || isGenerating) return;

        const localSessionId = sessionId; // captura o ID no momento do envio
        const mediaList = [...attachedImages];
        
        setAttachedImages([]);
        setPrompt('');
        setIsGenerating(true);
        setGeneratingType(mode);

        // Cria mensagens separadas para cada mídia anexada
        mediaList.forEach((mediaUrl, idx) => {
            const mediaType = mediaUrl.startsWith('data:video') ? 'video' : 'image';
            const msg: Message = {
                id: `user-media-${Date.now()}-${idx}`,
                role: 'user',
                content: '',
                mediaUrl,
                mediaType,
            };
            addMessage(msg);
            saveMessage('user', '', mediaUrl, mediaType, undefined, localSessionId);
        });

        if (trimmedPrompt) {
            const textMsg: Message = {
                id: `user-text-${Date.now()}`,
                role: 'user',
                content: trimmedPrompt,
            };
            addMessage(textMsg);
            saveMessage('user', trimmedPrompt, undefined, undefined, undefined, localSessionId);
        }

        // Usamos a última imagem da lista para os modelos de geração (Image-to-Image / Video)
        const currentImage = mediaList.length > 0 ? mediaList[mediaList.length - 1] : undefined;

        try {
            if (mode === 'image') {
                const result = await createImageGeneration({
                    prompt: trimmedPrompt,
                    inputImage: currentImage || undefined,
                    sessionId: localSessionId, // Backend salva com sessão correta
                });
                const assistantMsg: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: result.title || 'Imagem gerada com sucesso!',
                    mediaUrl: result.image,
                    mediaType: 'image',
                };
                
                // Não precisa de saveMessage aqui: o backend já salvou com session correta
                if (currentSessionIdRef.current === localSessionId) {
                    addMessage(assistantMsg);
                    onResult?.({ ...result, type: 'image', image: result.image });
                }

            } else {
                // Vídeo: assíncrono com polling
                const { generationId } = await createVideoGeneration({
                    prompt: trimmedPrompt,
                    inputImage: currentImage || undefined,
                    sessionId: localSessionId, // Backend salva com sessão correta
                });

                const stopPolling = pollStatus(
                    generationId,
                    (result) => {
                        const videoUrl = result.video || `/api/generations/${generationId}/media`;
                        const assistantMsg: Message = {
                            id: `assistant-${Date.now()}`,
                            role: 'assistant',
                            content: result.title || 'Vídeo gerado com sucesso!',
                            mediaUrl: videoUrl,
                            mediaType: 'video',
                        };
                        
                        // Não precisa de saveMessage aqui: o backend já salvou com session correta
                        if (currentSessionIdRef.current === localSessionId) {
                            setIsGenerating(false);
                            addMessage(assistantMsg);
                            onResult?.({ ...result, type: 'video' });
                        }
                    },
                    (error) => {
                        if (currentSessionIdRef.current === localSessionId) {
                            setIsGenerating(false);
                            addMessage({
                                id: `error-${Date.now()}`,
                                role: 'assistant',
                                content: `Erro ao gerar vídeo: ${error}`,
                            });
                        }
                    }
                );
                stopPollingRef.current = stopPolling;
                return;
            }
        } catch (error: any) {
            if (currentSessionIdRef.current === localSessionId) {
                addMessage({
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `Erro: ${error.message || 'Falha ao gerar conteúdo'}`,
                });
            }
        } finally {
            if (mode === 'image' && currentSessionIdRef.current === localSessionId) {
                setIsGenerating(false);
            }
        }
    }, [prompt, isGenerating, mode, attachedImages, sessionId, createImageGeneration, createVideoGeneration, pollStatus, addMessage, saveMessage, onResult]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/') || items[i].type.startsWith('video/')) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setAttachedImages(prev => [...prev, reader.result as string]);
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const adjustTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    return (
        <div className="flex-1 flex flex-col justify-end max-w-4xl mx-auto w-full pb-10">
            {/* Messages */}
            <div className="space-y-6 mb-10 overflow-y-auto pr-4 flex-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} onImageClick={setZoomedImage} />
                ))}
                {isGenerating && <GenerationProgress type={generatingType} />}
                <div ref={messagesEndRef} />
            </div>

            {/* Utilities Header */}
            <div className="flex justify-between items-end mb-3">
                {/* Mode toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('image')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            mode === 'image'
                                ? 'bg-[#e27241]/20 text-[#e27241] border border-[#e27241]/30'
                                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">image</span>
                        Imagem
                    </button>
                    <button
                        onClick={() => setMode('video')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            mode === 'video'
                                ? 'bg-[#e27241]/20 text-[#e27241] border border-[#e27241]/30'
                                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        Vídeo
                    </button>
                </div>

                {/* New Chat Action */}
                <button
                    onClick={handleNewChat}
                    title="Iniciar Nova Conversa (sem apagar o histórico)"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-500 hover:text-[#e27241] border border-transparent hover:border-[#e27241]/30 hover:bg-[#e27241]/10 bg-black/40 backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined text-[14px]">add_comment</span>
                    Nova Conversa
                </button>
            </div>

            {/* Input area */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#e27241]/20 to-[#ecc161]/10 blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
                <div className="relative rounded-2xl p-2 flex items-end gap-2 border border-white/10 group-focus-within:border-[#e27241]/30 transition-all"
                     style={{ background: 'rgba(53,53,52,0.4)', backdropFilter: 'blur(40px)' }}>

                    {/* Thumbnails das mídias anexadas */}
                    {attachedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 self-center ml-2">
                            {attachedImages.map((img, idx) => (
                                <div key={idx} className="relative group/img w-14 h-14 rounded-lg overflow-hidden border border-[#e27241]/30 flex-shrink-0 bg-black/50">
                                    {img.startsWith('data:video') ? (
                                        <video src={img} className="w-full h-full object-cover" muted playsInline />
                                    ) : (
                                        <img src={img} alt="Anexo" className="w-full h-full object-cover" />
                                    )}
                                    <button onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={adjustTextarea}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        disabled={isGenerating}
                        className="w-full bg-transparent border-none focus:ring-0 text-white outline-none placeholder:text-zinc-500 py-3 px-4 resize-none min-h-[60px] max-h-[200px] text-sm font-light disabled:opacity-50"
                        placeholder={mode === 'video' ? 'Descreva o vídeo que deseja gerar ou cole um vídeo/imagem base... (Ctrl+Enter)' : 'Cole uma imagem de referência ou descreva o que criar... (Ctrl+Enter)'}
                        rows={1}
                    />
                    <div className="flex items-center gap-2 p-2 flex-shrink-0">
                        <ImageAttachment 
                            value={null} // No longer shows single preview in button since we have thumbnails
                            onChange={(imgUrl) => {
                                if (imgUrl) {
                                    setAttachedImages(prev => [...prev, imgUrl]);
                                }
                            }} 
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isGenerating || (!prompt.trim() && attachedImages.length === 0)}
                            className="bg-[#e27241] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            <span>{isGenerating ? 'Gerando...' : 'Generate'}</span>
                            <span className="material-symbols-outlined text-sm">
                                {isGenerating ? 'hourglass_empty' : 'send'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
                <button onClick={() => setPrompt('Macro cinematográfico, hora dourada, musgo com partículas âmbar flutuando')} className="text-[10px] text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-300 transition-colors">Cinematic 4K</button>
                <button onClick={() => setPrompt('Fotografia macro extrema com bokeh suave e iluminação natural difusa')} className="text-[10px] text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-300 transition-colors">Macro Photography</button>
                <button onClick={() => setPrompt('Lente anamórfica, flares de luz azul, profundidade de campo rasa, noite urbana')} className="text-[10px] text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-300 transition-colors">Anamorphic Lens</button>
            </div>

            {/* Lightbox Modal para Zoom usando Portal para escapar do contexto Z-Index */}
            {zoomedImage && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200 cursor-zoom-out"
                    onClick={() => setZoomedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-[#e27241] rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <img 
                        src={zoomedImage} 
                        alt="Zoomed" 
                        className="max-w-[95vw] max-h-[95vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 cursor-default animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>,
                document.body
            )}
        </div>
    );
}
