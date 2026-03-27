import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Settings {
    firstName: string;
    lastName: string;
    defaultResolution: string;
    defaultAspectRatio: string;
    hardwareAcceleration: boolean;
}

export function SettingsForm() {
    const { authFetch } = useAuth();
    const [settings, setSettings] = useState<Settings>({
        firstName: '',
        lastName: '',
        defaultResolution: '720p',
        defaultAspectRatio: '16:9',
        hardwareAcceleration: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        authFetch('/api/settings')
            .then(r => r.json())
            .then(data => setSettings(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const res = await authFetch('/api/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao conectar com o servidor.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <span className="material-symbols-outlined text-zinc-700 text-4xl animate-spin">settings</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
            {/* Profile */}
            <div className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">
                    Perfil
                </h3>

                {/* Avatar placeholder */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#e27241]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-zinc-600 text-2xl">person</span>
                    </div>
                    <button type="button" className="px-4 py-2 border border-white/10 rounded-lg text-zinc-400 text-xs hover:border-[#e27241]/30 hover:text-zinc-200 transition-colors">
                        Alterar avatar
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                            Primeiro nome
                        </label>
                        <input
                            type="text"
                            value={settings.firstName}
                            onChange={e => setSettings(s => ({ ...s, firstName: e.target.value }))}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#e27241]/50 transition-colors"
                            placeholder="Seu nome"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                            Sobrenome
                        </label>
                        <input
                            type="text"
                            value={settings.lastName}
                            onChange={e => setSettings(s => ({ ...s, lastName: e.target.value }))}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#e27241]/50 transition-colors"
                            placeholder="Seu sobrenome"
                        />
                    </div>
                </div>
            </div>

            {/* System Preferences */}
            <div className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">
                    Preferências do Sistema
                </h3>

                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                        Resolução padrão
                    </label>
                    <select
                        value={settings.defaultResolution}
                        onChange={e => setSettings(s => ({ ...s, defaultResolution: e.target.value }))}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#e27241]/50 transition-colors"
                    >
                        <option value="720p">720p (padrão)</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K Ultra</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                        Proporção padrão
                    </label>
                    <select
                        value={settings.defaultAspectRatio}
                        onChange={e => setSettings(s => ({ ...s, defaultAspectRatio: e.target.value }))}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#e27241]/50 transition-colors"
                    >
                        <option value="16:9">16:9 Paisagem</option>
                        <option value="9:16">9:16 Retrato</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-200">Aceleração por hardware</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Usa GPU para acelerar renderizações</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, hardwareAcceleration: !s.hardwareAcceleration }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${settings.hardwareAcceleration ? 'bg-[#e27241]' : 'bg-zinc-700'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.hardwareAcceleration ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {/* Feedback */}
            {message && (
                <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#e27241] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                {saving ? (
                    <>
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Salvando...
                    </>
                ) : (
                    'Salvar alterações'
                )}
            </button>
        </form>
    );
}
