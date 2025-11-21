'use client'

import { PuzzlePiece } from '@/lib/collection/puzzle';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Image as KonvaImage, Layer, Stage } from 'react-konva';
import Konva from 'konva';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedSVGImage } from './PuzzleComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import PieceView from './PieceView';
import useImage from 'use-image';

interface ITable {
    isMobile: boolean;
    svgImages: ParsedSVGImage[];
    minStep: number;
}

// 🎯 OPTIMIZARE: Throttle helper function
function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecuted = 0;

    return function throttled(...args: Parameters<T>) {
        const now = Date.now();
        const timeSinceLastExecution = now - lastExecuted;

        const executeFunction = () => {
            lastExecuted = now;
            func(...args);
        };

        if (timeSinceLastExecution >= delay) {
            // Execută imediat dacă a trecut destul timp
            executeFunction();
        } else {
            // Schedule execuția
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(executeFunction, delay - timeSinceLastExecution);
        }
    };
}

// 🎯 OPTIMIZARE: Debounce helper pentru double-click prevention
function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return function debounced(...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

export default function PuzzleTablePreview({
    isMobile,
    svgImages,
    minStep
}: ITable) {
    const stageRef = useRef(null);
    const [pieceView, setPieceView] = useState<boolean>(false);
    const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
    const [pulseImg] = useImage('/click.png');
    const pulseRef = useRef<Konva.Image | null>(null);

    // 🎯 OPTIMIZARE: Click handler cu prevența spam-ului
    const handlePieceClickImmediate = useCallback((piece: PuzzlePiece, isNextStep: boolean) => {
        if (isNextStep && !pieceView) {
            setPieceView(true);
            setSelectedPiece(piece);
        }
    }, [pieceView]);

    // 🎯 OPTIMIZARE: Throttle click-urile (300ms cooldown)
    const handlePieceClick = useMemo(
        () => throttle(handlePieceClickImmediate, 300),
        [handlePieceClickImmediate]
    );

    // 🎯 OPTIMIZARE: Modal close cu debounce pentru previne close accidental
    const handleCloseModal = useCallback(() => {
        setPieceView(false);
        setSelectedPiece(null);
    }, []);

    const handleCloseModalDebounced = useMemo(
        () => debounce(handleCloseModal, 100),
        [handleCloseModal]
    );

    // 🎯 OPTIMIZARE: Memoize grid dimensions
    const gridDimensions = useMemo(() => {
        const containerWidth = isMobile ? Math.min(window.innerWidth * 0.95, 200) : 600;
        const containerHeight = isMobile ? Math.min(window.innerHeight * 0.7, 150) : 500;
        const piecesCount = svgImages.length;
        const cols = Math.ceil(Math.sqrt(piecesCount));
        const rows = Math.ceil(piecesCount / cols);
        const cellWidth = containerWidth / cols;
        const cellHeight = containerHeight / rows;

        return { containerWidth, containerHeight, cols, rows, cellWidth, cellHeight };
    }, [isMobile, svgImages.length]);

    // 🎯 OPTIMIZARE: Memoize next step piece data
    const nextStepData = useMemo(() => {
        const nextStepIndex = svgImages.findIndex(svg => svg.piece.step === minStep);
        const nextStepPiece = svgImages[nextStepIndex] || null;

        if (!nextStepPiece) {
            return { piece: null, pulseX: 0, pulseY: 0 };
        }

        const { cols, cellWidth, cellHeight } = gridDimensions;
        const col = nextStepIndex % cols;
        const row = Math.floor(nextStepIndex / cols);
        const x = col * cellWidth;
        const y = row * cellHeight;

        const padding = 25;
        const availableWidth = cellWidth - padding;
        const availableHeight = cellHeight - padding;
        const scaleX = availableWidth / nextStepPiece.width;
        const scaleY = availableHeight / nextStepPiece.height;
        const scale = Math.min(scaleX, scaleY);

        const finalWidth = nextStepPiece.width * scale;
        const finalHeight = nextStepPiece.height * scale;

        const pulseX = x + (cellWidth - finalWidth) / 2 + finalWidth / 2 - 20;
        const pulseY = y + (cellHeight - finalHeight) / 2 + finalHeight / 2 - 20;

        return { piece: nextStepPiece, pulseX, pulseY };
    }, [svgImages, minStep, gridDimensions]);

    // Animație puls icon
    useEffect(() => {
        if (!pulseRef.current || !pulseImg || !nextStepData.piece) return;

        const tween = new Konva.Tween({
            node: pulseRef.current,
            duration: 0.9,
            scaleX: 1.3,
            scaleY: 1.3,
            opacity: 1,
            easing: Konva.Easings.EaseInOut,
            yoyo: true,
            repeat: Infinity,
        });

        tween.play();

        return () => tween.destroy();
    }, [pulseImg, nextStepData.piece]);

    // 🎯 OPTIMIZARE: Memoize pieces layout data
    const piecesLayout = useMemo(() => {
        const { cols, cellWidth, cellHeight } = gridDimensions;
        const padding = 25;

        return svgImages.map((svgData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * cellWidth;
            const y = row * cellHeight;

            const availableWidth = cellWidth - padding;
            const availableHeight = cellHeight - padding;
            const scaleX = availableWidth / svgData.width;
            const scaleY = availableHeight / svgData.height;
            const scale = Math.min(scaleX, scaleY);

            const finalWidth = svgData.width * scale;
            const finalHeight = svgData.height * scale;
            const offsetX = x + (cellWidth - finalWidth) / 2;
            const offsetY = y + (cellHeight - finalHeight) / 2;

            const isNextStep = svgData.piece.step === minStep;

            return {
                key: `${svgData.piece.partName}-${index}`,
                image: svgData.image,
                x: offsetX,
                y: offsetY,
                width: finalWidth,
                height: finalHeight,
                opacity: isNextStep ? 1 : 0.4,
                filters: isNextStep ? [] : [Konva.Filters.Grayscale],
                piece: svgData.piece,
                isNextStep
            };
        });
    }, [svgImages, minStep, gridDimensions]);

    const { containerWidth, containerHeight } = gridDimensions;

    return (
        <div className="flex flex-col gap-4 w-full justify-center items-center">
            {/* Modal View */}
            {pieceView && selectedPiece && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 h-screen w-screen bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                handleCloseModal();
                            }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-h-[90vh] overflow-hidden ${isMobile ? 'max-w-full mx-2' : 'max-w-2xl'
                                }`}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                                <h3 className="text-lg font-bold text-slate-800">
                                    Vizualizare Piesă – Pasul {minStep}
                                </h3>
                                <Button
                                    onClick={handleCloseModal}
                                    className="p-2 bg-brown hover:bg-brown-dark text-white rounded-full"
                                >
                                    <X />
                                </Button>
                            </div>

                            <div className="p-4 h-full w-full">
                                <PieceView piece={selectedPiece} isMobile={isMobile} />
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Canvas Grid */}
            <div
                className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xl"
                style={{ width: containerWidth, height: containerHeight }}
            >
                <Stage height={containerHeight} width={containerWidth} ref={stageRef}>
                    <Layer>
                        {piecesLayout.map((layout) => (
                            <KonvaImage
                                key={layout.key}
                                image={layout.image}
                                x={layout.x}
                                y={layout.y}
                                width={layout.width}
                                height={layout.height}
                                opacity={layout.opacity}
                                filters={layout.filters}
                                onClick={() => handlePieceClick(layout.piece, layout.isNextStep)}
                                onTap={() => handlePieceClick(layout.piece, layout.isNextStep)}
                            />
                        ))}
                    </Layer>

                    {/* Pulse Icon Layer */}
                    {nextStepData.piece && pulseImg && (
                        <Layer>
                            <KonvaImage
                                image={pulseImg}
                                x={nextStepData.pulseX}
                                y={nextStepData.pulseY}
                                width={isMobile ? 20 : 40}
                                height={isMobile ? 20 : 40}
                                opacity={0.7}
                                ref={pulseRef}
                                onClick={() => handlePieceClick(nextStepData.piece!.piece, true)}
                                onTap={() => handlePieceClick(nextStepData.piece!.piece, true)}
                            />
                        </Layer>
                    )}
                </Stage>
            </div>
        </div>
    );
}