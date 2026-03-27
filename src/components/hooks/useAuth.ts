import { useState, useCallback } from 'react';

const TOKEN_KEY = 'visionlabs_token';

export interface AuthUser {
    userId: number;
    email: string;
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

function parseToken(token: string): AuthUser | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { userId: payload.userId, email: payload.email };
    } catch {
        return null;
    }
}

export function useAuth() {
    const [token] = useState<string | null>(getToken);

    const user: AuthUser | null = token ? parseToken(token) : null;

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/landing';
    }, []);

    const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
        const t = getToken();
        if (!t) {
            window.location.href = '/login';
            throw new Error('Não autenticado');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${t}`,
            },
        });

        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
            throw new Error('Sessão expirada');
        }

        return response;
    }, []);

    return { token, user, authFetch, logout };
}
