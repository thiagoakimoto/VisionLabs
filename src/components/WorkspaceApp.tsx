import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChatInterface } from './chat/ChatInterface';
import { PreviewPanel } from './preview/PreviewPanel';
import type { GenerationResult } from './hooks/useGenerations';

interface CurrentResult {
    type: 'image' | 'video';
    url: string;
    title?: string;
    videoId?: string;
    aspectRatio?: string;
    generationId?: number;
}

function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function WorkspaceApp() {
    const [currentResult, setCurrentResult] = useState<CurrentResult | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string>(() => {
        // Restaura a última sessão ativa, ou gera uma nova
        try {
            return localStorage.getItem('activeSessionId') || generateSessionId();
        } catch {
            return generateSessionId();
        }
    });

    // Persiste o ID da sessão ativa
    useEffect(() => {
        try { localStorage.setItem('activeSessionId', activeSessionId); } catch {}
    }, [activeSessionId]);

    useEffect(() => {
        // Escuta o evento de troca de sessão disparado pelo sidebar (vanilla JS)
        const handleSwitchSession = (e: Event) => {
            const sessionId = (e as CustomEvent<{ sessionId: string }>).detail.sessionId;
            setActiveSessionId(sessionId);
        };

        // Escuta nova conversa criada pelo botão dentro do ChatInterface
        const handleNewSession = (e: Event) => {
            const sessionId = (e as CustomEvent<{ sessionId: string }>).detail.sessionId;
            setActiveSessionId(sessionId);
        };

        window.addEventListener('chat:switch-session', handleSwitchSession);
        window.addEventListener('chat:new-session', handleNewSession);

        return () => {
            window.removeEventListener('chat:switch-session', handleSwitchSession);
            window.removeEventListener('chat:new-session', handleNewSession);
        };
    }, []);

    const handleResult = (result: GenerationResult & { type: 'image' | 'video' }) => {
        setCurrentResult({
            type: result.type,
            url: result.image || result.video || '',
            title: result.title,
            videoId: result.videoId,
            generationId: result.generationId,
        });
    };

    return (
        <>
            {/* Chat — ocupa o <main> */}
            <ChatInterface
                onResult={handleResult}
                sessionId={activeSessionId}
                onSessionCreated={(id) => setActiveSessionId(id)}
            />

            {/* Preview Panel — montado via portal no aside */}
            <PreviewPanelPortal currentResult={currentResult} sessionId={activeSessionId} />
        </>
    );
}

// Renderiza o PreviewPanel dentro do elemento #preview-root no DOM
function PreviewPanelPortal({ currentResult, sessionId }: { currentResult: CurrentResult | null, sessionId: string }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const target = document.getElementById('preview-root');
    if (!target) return null;

    return createPortal(
        <PreviewPanel currentResult={currentResult} sessionId={sessionId} />,
        target
    );
}
