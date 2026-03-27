import React, { useRef } from 'react';

interface ImageAttachmentProps {
    value: string | null;
    onChange: (base64: string | null) => void;
}

export function ImageAttachment({ value, onChange }: ImageAttachmentProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    if (value) {
        return (
            <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-[#e27241]/30 flex-shrink-0">
                <img src={value} alt="Anexo" className="w-full h-full object-cover" />
                <button
                    onClick={() => onChange(null)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-white text-sm">close</span>
                </button>
            </div>
        );
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="p-2 text-zinc-500 hover:text-[#e27241] transition-colors cursor-pointer"
                title="Anexar imagem de referência"
            >
                <span className="material-symbols-outlined">image</span>
            </button>
        </>
    );
}
