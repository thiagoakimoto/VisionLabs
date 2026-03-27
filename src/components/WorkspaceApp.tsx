import React, { useState } from 'react';
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

export function WorkspaceApp() {
    const [currentResult, setCurrentResult] = useState<CurrentResult | null>(null);

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
            <ChatInterface onResult={handleResult} />

            {/* Preview Panel — montado via portal no aside */}
            <PreviewPanelPortal currentResult={currentResult} />
        </>
    );
}

// Renderiza o PreviewPanel dentro do elemento #preview-root no DOM
import { createPortal } from 'react-dom';

function PreviewPanelPortal({ currentResult }: { currentResult: CurrentResult | null }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const target = document.getElementById('preview-root');
    if (!target) return null;

    return createPortal(
        <PreviewPanel currentResult={currentResult} />,
        target
    );
}
