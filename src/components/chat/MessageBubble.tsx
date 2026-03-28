import React from 'react';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt?: string;
}

interface MessageBubbleProps {
    message: Message;
    onImageClick?: (url: string) => void;
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                isUser
                    ? 'overflow-hidden border-zinc-700'
                    : 'bg-[#161616] border-[#e27241]/20'
            }`}>
                {isUser ? (
                    <img className="w-full h-full object-cover" src="/media/chat/avatar2.jpg" alt="User" />
                ) : (
                    <span className="material-symbols-outlined text-[#e27241] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-4 ${
                    isUser
                        ? 'bg-[#1a1a1a] rounded-tr-none border border-[rgba(88,66,53,0.15)]'
                        : 'rounded-tl-none border border-[rgba(88,66,53,0.15)]'
                }`} style={isUser ? {} : { background: 'rgba(53,53,52,0.4)', backdropFilter: 'blur(40px)' }}>
                    <p className="text-sm text-zinc-200 leading-relaxed font-light whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Mídia gerada/anexada */}
                {message.mediaUrl && message.mediaType === 'image' && (
                    <div className="relative group rounded-2xl overflow-hidden border border-[rgba(88,66,53,0.15)] max-w-sm">
                        <img 
                            src={message.mediaUrl} 
                            alt="Imagem" 
                            className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onImageClick?.(message.mediaUrl!)}
                        />
                        <a
                            href={message.mediaUrl}
                            download="visionlabs-image.png"
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(53,53,52,0.8)', backdropFilter: 'blur(8px)' }}
                        >
                            <span className="material-symbols-outlined text-white text-sm">download</span>
                        </a>
                    </div>
                )}

                {message.mediaUrl && message.mediaType === 'video' && (
                    <div className="relative group rounded-2xl overflow-hidden border border-[rgba(88,66,53,0.15)] max-w-sm w-full">
                        <video
                            src={message.mediaUrl}
                            controls
                            className="w-full h-auto"
                            style={{ maxHeight: '360px' }}
                        />
                        <a
                            href={message.mediaUrl}
                            download="visionlabs-video.mp4"
                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(53,53,52,0.8)', backdropFilter: 'blur(8px)' }}
                        >
                            <span className="material-symbols-outlined text-white text-sm">download</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
