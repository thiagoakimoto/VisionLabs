import { useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Asset {
    id: number;
    media_url: string;
    media_type: string;
    content: string;
    created_at: string;
}

export function useAssets() {
    const { authFetch } = useAuth();

    const listAssets = useCallback(async (limit = 20, offset = 0): Promise<Asset[]> => {
        const res = await authFetch(`/api/chat/assets?limit=${limit}&offset=${offset}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.assets;
    }, [authFetch]);

    const deleteAsset = useCallback(async (id: number): Promise<boolean> => {
        const res = await authFetch(`/api/chat/messages/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    }, [authFetch]);

    return { listAssets, deleteAsset };
}
