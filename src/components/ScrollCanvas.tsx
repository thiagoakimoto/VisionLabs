import React, { useEffect, useRef, useState } from 'react';

interface ScrollCanvasProps {
    frameCount: number;
}

export const ScrollCanvas: React.FC<ScrollCanvasProps> = ({ frameCount }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fallbackRef = useRef<HTMLImageElement>(null);
    const [animationReady, setAnimationReady] = useState(false);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    useEffect(() => {
        // Accessibility: reduced-motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            if (canvasRef.current) canvasRef.current.style.display = 'none';
            if (fallbackRef.current) fallbackRef.current.style.display = 'block';
            return;
        }

        // Preload all frames
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = `/media/frames/frame_${String(i).padStart(4, '0')}.jpg`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) {
                    setAnimationReady(true);
                }
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, [frameCount]);

    useEffect(() => {
        if (!animationReady || images.length !== frameCount) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        const heroSection = document.getElementById('hero');
        if (!heroSection) return;

        if (fallbackRef.current) fallbackRef.current.style.display = 'none';
        canvas.style.display = 'block';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        const drawFrame = (index: number) => {
            if (!images[index - 1] || !images[index - 1].complete) return;
            const img = images[index - 1];

            const zoom = 1.06; // Slight zoom to crop out watermark in bottom-right
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

            if (canvasRatio > imgRatio) {
                drawWidth = canvas.width * zoom;
                drawHeight = drawWidth / imgRatio;
            } else {
                drawHeight = canvas.height * zoom;
                drawWidth = drawHeight * imgRatio;
            }

            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = (canvas.height - drawHeight) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };

        const getCurrentFrameIndex = () => {
            const scrollTop = window.scrollY;
            const maxScrollTop = heroSection.scrollHeight - window.innerHeight;
            if (maxScrollTop <= 0) return 1;

            const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
            const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
            return frameIndex + 1;
        };

        let ticking = false;
        const scrollListener = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const frameIndex = getCurrentFrameIndex();
                    drawFrame(frameIndex);
                    ticking = false;
                });
                ticking = true;
            }
        };

        const resizeListener = () => {
            resizeCanvas();
            drawFrame(getCurrentFrameIndex());
        };

        window.addEventListener('scroll', scrollListener, { passive: true });
        window.addEventListener('resize', resizeListener);

        // Initial draw
        drawFrame(1);

        return () => {
            window.removeEventListener('scroll', scrollListener);
            window.removeEventListener('resize', resizeListener);
        };
    }, [animationReady, images, frameCount]);

    return (
        <>
            <canvas id="hero-canvas" ref={canvasRef}></canvas>
            {/* Fallback image for reduced-motion users */}
            <img
                src="/media/frames/frame_0001.jpg"
                alt="VisionLabs Background"
                className="hero-fallback-image"
                id="hero-fallback"
                ref={fallbackRef}
            />
        </>
    );
};
