import { useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export interface Generation {
    id: number;
    type: 'image' | 'video';
    prompt: string;
    title: string;
    aspectRatio: string;
    status: 'pending' | 'processing' | 'complete' | 'error';
    resultUrl: string | null;
    videoId: string | null;
    error: string | null;
    createdAt: string;
}

export interface GenerationResult {
    generationId: number;
    image?: string;
    video?: string;
    videoId?: string;
    title?: string;
}

export function useGenerations() {
    const { authFetch } = useAuth();
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const createImageGeneration = useCallback(async (params: {
        prompt: string;
        inputImage?: string;
        aspectRatio?: string;
    }): Promise<GenerationResult> => {
        const res = await authFetch('/api/generations/image', {
            method: 'POST',
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro ao gerar imagem');
        }
        return res.json();
    }, [authFetch]);

    const createVideoGeneration = useCallback(async (params: {
        prompt: string;
        inputImage?: string;
        aspectRatio?: string;
    }): Promise<{ generationId: number; status: string }> => {
        const res = await authFetch('/api/generations/video', {
            method: 'POST',
            body: JSON.stringify(params),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro ao iniciar geração de vídeo');
        }
        return res.json();
    }, [authFetch]);

    const pollStatus = useCallback((
        generationId: number,
        onComplete: (result: GenerationResult) => void,
        onError: (error: string) => void
    ): (() => void) => {
        const interval = setInterval(async () => {
            try {
                const res = await authFetch(`/api/generations/${generationId}/status`);
                if (!res.ok) return;
                const data = await res.json();

                if (data.status === 'complete') {
                    clearInterval(interval);
                    onComplete({
                        generationId: data.generationId,
                        video: data.result,
                        videoId: data.videoId,
                        title: data.title,
                    });
                } else if (data.status === 'error') {
                    clearInterval(interval);
                    onError(data.error || 'Erro desconhecido na geração');
                }
            } catch (e) {
                // continua tentando
            }
        }, 5000);

        pollingRef.current = interval;
        return () => clearInterval(interval);
    }, [authFetch]);

    const listGenerations = useCallback(async (limit = 20, offset = 0): Promise<Generation[]> => {
        const res = await authFetch(`/api/generations?limit=${limit}&offset=${offset}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.generations.map((g: any) => ({
            id: g.id,
            type: g.type,
            prompt: g.prompt,
            title: g.title,
            aspectRatio: g.aspect_ratio,
            status: g.status,
            resultUrl: g.result_url,
            videoId: g.video_id,
            error: g.error_message,
            createdAt: g.created_at,
        }));
    }, [authFetch]);

    const deleteGeneration = useCallback(async (id: number): Promise<boolean> => {
        const res = await authFetch(`/api/generations/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    }, [authFetch]);

    return { createImageGeneration, createVideoGeneration, pollStatus, listGenerations, deleteGeneration };
}
