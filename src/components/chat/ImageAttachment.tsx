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
        return null; // The ChatInterface now handles rendering the preview so we don't duplicate.
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFile}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className="p-2 text-zinc-500 hover:text-[#e27241] transition-colors cursor-pointer"
                title="Anexar imagem ou vídeo de referência"
            >
                <span className="material-symbols-outlined">image</span>
            </button>
        </>
    );
}
