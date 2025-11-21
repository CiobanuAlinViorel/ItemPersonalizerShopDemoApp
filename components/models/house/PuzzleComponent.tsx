'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePuzzleStore } from '@/lib/stores/PuzzleStore';
import { PuzzlePiece, puzzles } from '@/lib/collection/puzzle';
const StepsListComponent = lazy(() => import('./StepsListComponent'));
const PuzzleFinalResult = lazy(() => import('./PuzzleFinalResult'));

export interface ParsedSVGImage {
    piece: PuzzlePiece;
    image: HTMLImageElement;
    width: number;
    height: number;
}

type Props = {}

const PuzzleComponent = (props: Props) => {
    const [isMobile, setIsMobile] = useState(false);
    const [svgImages, setSvgImages] = useState<ParsedSVGImage[]>([]);
    const [openStepList, setOpenList] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 🔥 CRITICAL FIX: Flag pentru a preveni reinițializarea
    const isInitializedRef = useRef(false);

    const {
        products,
        usedPieces,
        unusedPieces,
        initializePuzzle,
        usePieces,
        reverseStep,
        resetPuzzle,
        useAllPieces,
        resetToLast
    } = usePuzzleStore();

    // Memoized puzzle data
    const currentPuzzle = useMemo(() => puzzles[0], []);

    // Memoized filtered pieces based on device type
    const filteredUnusedPieces = useMemo(() =>
        unusedPieces,
        [unusedPieces, isMobile]
    );

    // Optimized SVG loading with cancellation support
    const loadAllSVGsAsImages = useCallback(async () => {
        if (filteredUnusedPieces.length === 0) {
            setSvgImages([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const loadedImages: ParsedSVGImage[] = [];
            const controller = new AbortController();

            // Load SVGs in batches for better performance
            const batchSize = isMobile ? 3 : 5;

            for (let i = 0; i < filteredUnusedPieces.length; i += batchSize) {
                const batch = filteredUnusedPieces.slice(i, i + batchSize);

                const batchPromises = batch.map(async (piece) => {
                    if (controller.signal.aborted) return null;

                    try {
                        const res = await fetch(piece.svg, {
                            signal: controller.signal
                        });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);

                        const svgText = await res.text();
                        const blob = new Blob([svgText], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);

                        return new Promise<ParsedSVGImage | null>((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                URL.revokeObjectURL(url);
                                resolve({
                                    piece,
                                    image: img,
                                    width: img.naturalWidth || 800,
                                    height: img.naturalHeight || 600
                                });
                            };
                            img.onerror = () => {
                                URL.revokeObjectURL(url);
                                console.warn(`Failed to load SVG for ${piece.partName}`);
                                resolve(null);
                            };
                            img.src = url;
                        });
                    } catch (error: any) {
                        if (error.name !== 'AbortError') {
                            console.warn(`Error loading SVG for ${piece.partName}:`, error);
                        }
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                const validResults = batchResults.filter(Boolean) as ParsedSVGImage[];
                loadedImages.push(...validResults);

                // Small delay between batches to prevent UI blocking
                if (i + batchSize < filteredUnusedPieces.length) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            if (!controller.signal.aborted) {
                setSvgImages(loadedImages);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error loading SVGs:', error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [filteredUnusedPieces, isMobile]);

    // Optimized SVG loading effect
    useEffect(() => {
        loadAllSVGsAsImages();

        return () => {
            // Cleanup function if needed
        };
    }, [loadAllSVGsAsImages]);

    // 🔥 FIX: Initialize puzzle DOAR O SINGURĂ DATĂ
    useEffect(() => {
        // Verifică dacă:
        // 1. Avem produse disponibile
        // 2. NU am inițializat deja puzzle-ul (folosim ref-ul)
        // 3. Nu avem nici piese folosite, nici piese nefolosite (stare complet goală)
        if (
            products &&
            products.length > 0 &&
            !isInitializedRef.current &&
            unusedPieces.length === 0 &&
            usedPieces.length === 0
        ) {
            console.log('🎯 Initializing puzzle for the FIRST time');
            initializePuzzle(products[0].pieces);
            isInitializedRef.current = true;
        }
    }, [products, initializePuzzle, unusedPieces.length, usedPieces.length]);

    // Optimized mobile detection with debouncing
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
        };

        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(checkMobile, 100);
        };

        checkMobile(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    // Memoized minStep calculation
    const minStep = useMemo(() =>
        svgImages.length > 0 ? Math.min(...svgImages.map(svg => svg.piece.step)) : Infinity,
        [svgImages]
    );

    // Memoized handleUseCurrentStep
    const handleUseCurrentStep = useCallback(() => {
        if (svgImages.length === 0) return;

        const piecesToUse = svgImages
            .filter(svg => svg.piece.step === minStep)
            .map(svg => svg.piece);

        if (piecesToUse.length > 0) {
            usePieces(piecesToUse);
        }
    }, [svgImages, minStep, usePieces]);

    // Memoized main content to prevent unnecessary re-renders
    const mainContent = useMemo(() => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 via-white"
        >
            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-lg font-semibold text-slate-700">Se încarcă piesele puzzle...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-1"
                >
                    <div className='flex gap-5 justify-center items-center'>
                        <PuzzleFinalResult
                            puzzle={currentPuzzle}
                            isMobile={isMobile}
                        />
                        <div>
                            <h1 className={`text-2xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent mb-4`}>
                                Asamblare {currentPuzzle.name}
                            </h1>
                        </div>
                    </div>
                </motion.div>

                {/* Steps List */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex justify-center"
                >
                    <StepsListComponent
                        puzzle={currentPuzzle}
                        resetPuzzle={resetPuzzle}
                        svgImages={svgImages}
                        steps={currentPuzzle.steps}
                        usedPieces={usedPieces}
                        unusedPieces={unusedPieces}
                        isVisible={openStepList}
                        isMobile={isMobile}
                        usePieces={usePieces}
                        reverseStep={reverseStep}
                        resetToLast={resetToLast}
                    />
                </motion.div>
            </div>
        </motion.div>
    ), [
        isLoading,
        currentPuzzle,
        isMobile,
        openStepList,
        svgImages,
        usedPieces,
        unusedPieces,
        usePieces,
        reverseStep,
        resetToLast,
        resetPuzzle
    ]);

    return mainContent;
}

export default React.memo(PuzzleComponent);