import { useCallback, useRef, useState } from 'react';

interface ImageComparisonSliderProps {
    originalSrc: string;
    processedSrc: string;
    originalAlt?: string;
    processedAlt?: string;
    className?: string;
}

export function ImageComparisonSlider({
    originalSrc,
    processedSrc,
    originalAlt = 'Image originale',
    processedAlt = 'Arriere-plan supprime',
    className = '',
}: ImageComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseDown = useCallback(() => {
        isDragging.current = true;
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current) return;
        handleMove(e.clientX);
    }, [handleMove]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length > 0) {
            handleMove(e.touches[0].clientX);
        }
    }, [handleMove]);

    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-lg select-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* Checkerboard background for transparency */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
            />

            {/* Processed image (background removed) - Full width, underneath */}
            <img
                src={processedSrc}
                alt={processedAlt}
                className="relative w-full h-auto block"
                draggable={false}
            />

            {/* Original image - Clipped by slider position */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={originalSrc}
                    alt={originalAlt}
                    className="w-full h-full object-cover"
                    style={{
                        width: containerRef.current?.offsetWidth || '100%',
                        maxWidth: 'none'
                    }}
                    draggable={false}
                />
            </div>

            {/* Slider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                {/* Slider handle */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize border-2 border-gray-200 hover:border-primary transition-colors"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                        />
                    </svg>
                </div>
            </div>

            {/* Hidden range input for accessibility */}
            <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={sliderPosition}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                aria-label="Comparaison avant/apres"
            />

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm">
                Avant
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm">
                Apres
            </div>
        </div>
    );
}
