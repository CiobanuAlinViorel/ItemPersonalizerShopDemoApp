'use client'

import { IPuzzle, PuzzlePiece } from '@/lib/collection/puzzle';
import { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Layer, Stage, Rect, Text } from 'react-konva';
import Konva from 'konva';
import React from 'react';
import { IterationCcw, MousePointerClick, Target, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import PieceView from './PieceView';
import { Button } from '@/components/ui/button';
import { ParsedSVGImage } from './PuzzleComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { Vector2 } from 'three';
import { createPortal } from 'react-dom';
import { GiClick } from 'react-icons/gi';


interface ITable {
    isMobile: boolean;
    svgImages: ParsedSVGImage[];
    minStep: number;
}

export default function PuzzleTablePreview({
    isMobile,
    svgImages,
    minStep
}: ITable) {
    const stageRef = useRef(null);

    const [blinkState, setBlinkState] = useState<boolean>(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [pieceView, setPieceView] = useState<boolean>(false);
    const [selectedPiece, setSelectedPiece] = useState(null);

    // Blink animation
    useEffect(() => {
        const interval = setInterval(() => {
            setBlinkState(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handlePieceClick = (piece: PuzzlePiece, isNextStep: boolean) => {
        if (isNextStep) {
            setPieceView(true);
            setSelectedPiece(piece);
        }
    };

    // Calculăm dimensiunile responsive
    const containerWidth = isMobile ? Math.min(window.innerWidth * 0.95, 200) : 600;
    const containerHeight = isMobile ? Math.min(window.innerHeight * 0.7, 150) : 500;

    // Calculăm câte coloane și rânduri avem nevoie
    const piecesCount = svgImages.length;
    const cols = Math.ceil(Math.sqrt(piecesCount));
    const rows = Math.ceil(piecesCount / cols);

    // Dimensiunea unei celule
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;

    const currentStepPiecesCount = svgImages.filter(svg => svg.piece.step === minStep).length;

    return (
        <div className="flex flex-col gap-4 w-full justify-center items-center">
            {/* Content */}


            {pieceView && selectedPiece && createPortal(
                <AnimatePresence>
                    {pieceView && selectedPiece && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setPieceView(false);
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-h-[90vh] overflow-hidden ${isMobile ? 'max-w-full mx-2' : 'max-w-2xl'
                                    }`}
                            >
                                {/* Header - COMPACT PE MOBIL */}
                                <div className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'} border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white`}>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-slate-800 truncate`}>
                                            Vizualizare Piesă
                                        </h3>
                                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-600 mt-1 truncate`}>
                                            Pasul {minStep} - {selectedPiece.partName}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setPieceView(false)}
                                        className={`bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors ml-2 ${isMobile ? 'p-2' : 'p-2'
                                            }`}
                                    >
                                        <X className={isMobile ? 'w-5 h-5' : 'w-5 h-5'} />
                                    </Button>
                                </div>

                                {/* Content - SCROLLABLE PE MOBIL */}
                                <div className={`${isMobile ? 'p-4' : 'p-6'} h-full w-full `}>
                                    <PieceView piece={selectedPiece} isMobile={isMobile} />
                                </div>

                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>, document.body
            )}
            {/* Piece View Modal - OPTIMIZAT MOBIL */}
            <AnimatePresence>
                {pieceView && selectedPiece && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 flex flex-col"
                    >
                        {/* Header - ULTRA COMPACT PE MOBIL */}
                        <div className={`flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ${isMobile ? 'px-3 py-2.5' : 'px-6 py-4'
                            }`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Target className={isMobile ? 'w-4 h-4 flex-shrink-0' : 'w-6 h-6'} />
                                <div className="min-w-0 flex-1">
                                    <h3 className={`font-bold truncate ${isMobile ? 'text-sm' : 'text-xl'}`}>
                                        {selectedPiece.partName}
                                    </h3>
                                    <p className={`text-blue-100 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                                        Pas {minStep} • {isMobile ? 'Rotește' : 'Rotește pentru a explora'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setPieceView(false);
                                    setSelectedPiece(null);
                                }}
                                className={`bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm text-white rounded-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0 ${isMobile ? 'p-2 ml-2' : 'p-2.5 ml-3'
                                    }`}
                            >
                                <X className={isMobile ? 'w-4 h-4' : 'w-6 h-6'} />
                            </button>
                        </div>

                        {/* Content - FULLSCREEN 3D VIEW */}

                        <div className="flex-1 relative">

                            <PieceView
                                piece={selectedPiece}
                                isMobile={isMobile}
                                priority="quality"
                                isVisible={pieceView}
                            />
                        </div>

                        {/* Footer - MINIMAL PE MOBIL */}
                        <div className={`bg-white/10 backdrop-blur-md border-t border-white/20 ${isMobile ? 'px-3 py-2' : 'px-6 py-4'
                            }`}>
                            <div className="flex items-center justify-center gap-2 text-white">
                                <IterationCcw className={isMobile ? 'w-3 h-3' : 'w-5 h-5'} />
                                <p className={isMobile ? 'text-[10px]' : 'text-sm'}>
                                    {isMobile
                                        ? 'Atinge pentru rotire'
                                        : 'Mouse pentru rotire • Scroll pentru zoom'}
                                </p>
                            </div>
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>




            {/* Canvas Grid */}
            <div
                className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xl backdrop-blur-sm"
                style={{ width: containerWidth, height: containerHeight }}
            >

                {svgImages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="text-6xl mb-4">🎉</div>
                            <div className="text-2xl font-bold text-slate-700 mb-2">Toate piesele au fost plasate!</div>
                            <div className="text-slate-500">Excelentă treabă la completarea puzzle-ului</div>
                        </motion.div>
                    </div>
                ) : (
                    <Stage
                        height={containerHeight}
                        width={containerWidth}
                        ref={stageRef}
                    >
                        <Layer>
                            {svgImages.map((svgData, index) => {
                                const col = index % cols;
                                const row = Math.floor(index / cols);

                                const x = col * cellWidth;
                                const y = row * cellHeight;

                                // Calculăm scala pentru a încadra imaginea în celulă
                                const padding = 25;
                                const availableWidth = cellWidth - padding;
                                const availableHeight = cellHeight - padding;

                                const scaleX = availableWidth / svgData.width;
                                const scaleY = availableHeight / svgData.height;
                                const scale = Math.min(scaleX, scaleY);

                                // Dimensiunile finale
                                const finalWidth = svgData.width * scale;
                                const finalHeight = svgData.height * scale;

                                // Centrăm în celulă
                                const offsetX = x + (cellWidth - finalWidth) / 2;
                                const offsetY = y + (cellHeight - finalHeight) / 2;

                                const isNextStep = svgData.piece.step === minStep;
                                const isHovered = hoveredIndex === index;

                                return (
                                    <React.Fragment key={`${svgData.piece.partName}-${index}`}>





                                        {/* SVG Image */}
                                        <KonvaImage
                                            image={svgData.image}
                                            x={offsetX}
                                            y={offsetY}
                                            width={finalWidth}
                                            // scale={new Vector2(0.8, 0.8)}
                                            height={finalHeight}
                                            opacity={isNextStep ? 1 : 0.4}
                                            filters={isNextStep ? [] : [Konva.Filters.Grayscale]}
                                            onClick={() => handlePieceClick(svgData.piece, isNextStep)}
                                            onTap={() => handlePieceClick(svgData.piece, isNextStep)}

                                        />


                                    </React.Fragment>
                                );
                            })}
                        </Layer>
                    </Stage>
                )}
            </div>






        </div>
    );
}