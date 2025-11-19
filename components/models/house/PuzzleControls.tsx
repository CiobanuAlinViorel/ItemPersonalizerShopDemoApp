import { IPuzzle, PuzzlePiece } from '@/lib/collection/puzzle';
import React from 'react'
import { ParsedSVGImage } from './PuzzleComponent';
import { ArrowRight, IterationCcw, Menu, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PuzzleControlsProps = {
    isMobile: boolean;
    puzzle: IPuzzle;
    unusedPieces: PuzzlePiece[];
    svgImages: ParsedSVGImage[];
    usePieces: (pieces: PuzzlePiece[]) => void;
    reverseStep: () => void;
    resetPuzzle: () => void;
    handleUseCurrentStep: () => void;
    minStep: number;
    setOpenList: () => void;
    useAllPieces: () => void;
}

const PuzzleControls = ({
    isMobile,
    puzzle,
    unusedPieces,
    usePieces,
    resetPuzzle,
    reverseStep,
    handleUseCurrentStep,
    svgImages,
    minStep,
    setOpenList,
    useAllPieces
}: PuzzleControlsProps) => {

    const remainingPieces = unusedPieces.filter((value) => value.isMobile === isMobile).length;
    const totalPieces = puzzle.pieces.filter(p => p.isMobile === isMobile).length;
    const progressPercentage = ((totalPieces - remainingPieces) / totalPieces) * 100;

    return (
        <div className="p-4">
            <div className={`
                relative p-6 rounded-2xl shadow-2xl border border-white/20 
                bg-gradient-to-br from-brown via-brown-light to-brown-dark
                backdrop-blur-sm ${isMobile ? "flex flex-col gap-4" : "flex flex-row items-center gap-6"}
            `}>

                {/* Left Controls Group */}
                <div className="flex flex-wrap gap-3">
                    {/* Menu Button */}
                    <Button
                        className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 group cursor-pointer shadow-lg"
                        onClick={setOpenList}
                    >
                        <Menu className="w-5 h-5 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </Button>

                    {/* Next Step Button */}
                    <Button
                        onClick={handleUseCurrentStep}
                        disabled={svgImages.length === 0}
                        className={`
                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-neutral-800 
                            bg-gradient-to-r from-beige to-beige-dark hover:from-beige-light hover:to-beige
                            disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
                            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            flex items-center gap-2 group
                            ${isMobile ? "text-sm" : "text-md"}
                        `}
                    >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        <span>Următorul pas</span>
                    </Button>
                </div>

                {/* Middle Controls Group */}
                <div className="flex flex-wrap gap-3">
                    {/* Back Button */}
                    <Button
                        onClick={reverseStep}
                        disabled={svgImages.length === totalPieces}
                        className={`
                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                            bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900
                            disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
                            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            flex items-center gap-2 group
                            ${isMobile ? "text-sm" : "text-md"}
                        `}
                    >
                        <Redo className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Înapoi</span>
                    </Button>

                    {/* Reset Button */}
                    <Button
                        onClick={resetPuzzle}
                        disabled={svgImages.length === totalPieces}
                        className={`
                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                            bg-gradient-to-r from-terracotta-light to-terracotta hover:from-terracotta hover:to-terracotta-dark
                            disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
                            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            flex items-center gap-2 group
                            ${isMobile ? "text-sm" : "text-md"}
                        `}
                    >
                        <IterationCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Resetare</span>
                    </Button>
                </div>

                {/* Final Form Button */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={useAllPieces}
                        disabled={svgImages.length === 0}
                        className={`
                            px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                            bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 
                            disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed
                            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            flex items-center gap-2 group
                            ${isMobile ? "text-sm" : "text-md"}
                        `}
                    >
                        <ArrowRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Forma finală</span>
                    </Button>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right Stats Group */}
                <div className="flex flex-col gap-4 min-w-[200px]">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-white/80 text-sm">
                        <span>Progres</span>
                        <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        {/* Remaining Pieces */}
                        <div className="px-4 py-3 bg-white/10 rounded-xl border border-white/20 shadow-lg backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{remainingPieces}</div>
                                <div className="text-xs text-white/70 mt-1">piese rămase</div>
                            </div>
                        </div>

                        {/* Current Step */}
                        {svgImages.length > 0 && (
                            <div className="px-4 py-3 bg-green-500/20 rounded-xl border border-green-400/30 shadow-lg backdrop-blur-sm animate-pulse">
                                <div className="text-center">
                                    <div className="text-xs text-green-300 font-medium mb-1">Pasul actual</div>
                                    <div className="text-2xl font-bold text-green-400">{minStep}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PuzzleControls