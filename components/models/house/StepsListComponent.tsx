import { IPuzzle, IPuzzleSteps, PuzzlePiece } from '@/lib/collection/puzzle'
import { CheckCircle, Circle, CircleDot, PartyPopper, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import PuzzleResultPreviewer from './PuzzleResultPreviewer'
import PuzzleTablePreview from './PuzzleTablePreview'
import { ParsedSVGImage } from './PuzzleComponent'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'


type StepListProps = {
    steps: IPuzzleSteps[],
    usedPieces: PuzzlePiece[],
    unusedPieces: PuzzlePiece[],
    isVisible: boolean,
    isMobile: boolean,
    resetPuzzle: () => void;
    puzzle: any,
    svgImages: ParsedSVGImage[]
    usePieces: (pieces: PuzzlePiece[]) => void;
    reverseStep: () => void;
    resetToLast: (step: IPuzzleSteps) => void;
}

enum StepState {
    UNDONE = "undone",
    CURRENT = "current",
    DONE = "done"
}

// Memoized step item component to prevent unnecessary re-renders
const StepItem = memo(({
    step,
    state,
    isMobile,
    stepUsedPieces,
    stepUnusedPieces,
    stepSvgImages,
    puzzle,
    onUsePieces,
    onReverseStep,
    onStepChange,
    previewKey,
    setShowCongrats
}: {
    step: IPuzzleSteps,
    state: StepState,
    isMobile: boolean,
    stepUsedPieces: PuzzlePiece[],
    stepUnusedPieces: PuzzlePiece[],
    stepSvgImages: ParsedSVGImage[],
    puzzle: IPuzzle,
    onUsePieces: (pieces: PuzzlePiece[]) => void,
    onReverseStep: () => void,
    onStepChange: (newStep: number, oldStep: number) => void
    previewKey: number,
    setShowCongrats: (value: boolean) => void;
}) => {
    const handleFinalizeStep = useCallback(() => {
        if (step.stepNumber < puzzle.steps.length - 1) {
            const piecesToUse = stepUnusedPieces.filter(p => p.step === step.stepNumber);
            if (piecesToUse.length > 0) {
                onUsePieces(piecesToUse);
            }
            onStepChange(step.stepNumber + 1, step.stepNumber);
        }
        else {
            setShowCongrats(true);
        }
    }, [stepUnusedPieces, step.stepNumber, onUsePieces, onStepChange]);

    const handleGoBack = useCallback(() => {
        onReverseStep();
        onStepChange(step.stepNumber - 1, step.stepNumber);
    }, [onReverseStep, onStepChange, step.stepNumber]);

    const shouldRender3DPreview = (!isMobile || state === StepState.CURRENT);
    const shouldRenderTablePreview = stepSvgImages.length > 0 && (!isMobile || state === StepState.CURRENT);
    const usedPiecesCount = stepUsedPieces.filter(v => v.isMobile === isMobile).length;
    const unusedPiecesCount = stepUnusedPieces.filter(v => v.isMobile === isMobile).length;

    return (
        <AccordionItem
            value={`step-${step.stepNumber}`}
            className={`mb-3 rounded-2xl border-2 transition-all duration-300 ease-out ${state === StepState.CURRENT
                ? 'border-terracotta bg-gradient-to-br from-white to-orange-50 shadow-md'
                : state === StepState.DONE
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm'
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'
                } hover:shadow-lg transition-shadow`}
        >
            <AccordionTrigger className="hover:no-underline px-4 py-4 md:px-6 md:py-5 group">
                <div className="flex items-start gap-3 md:gap-4 w-full">
                    {/* Step Number Indicator */}
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${state === StepState.CURRENT
                        ? 'bg-gradient-to-br from-terracotta to-orange-500 text-white shadow-lg scale-105'
                        : state === StepState.DONE
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md'
                            : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
                        } font-bold text-sm md:text-base`}>
                        {step.stepNumber}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 text-left space-y-1">
                        <div className="flex items-center justify-between">
                            <span className={`font-semibold text-base md:text-lg transition-colors ${state === StepState.CURRENT
                                ? 'text-brown-dark'
                                : state === StepState.DONE
                                    ? 'text-green-900'
                                    : 'text-gray-700'
                                }`}>
                                Pasul {step.stepNumber}: <span className={`text-sm md:text-base leading-relaxed pr-2 ${state === StepState.CURRENT
                                    ? 'text-brown'
                                    : state === StepState.DONE
                                        ? 'text-green-700'
                                        : 'text-gray-600'
                                    }`}>

                                </span>
                            </span>
                            <div className={`transition-all duration-300 mr-2 ${state === StepState.CURRENT ? 'scale-110 text-terracotta' : 'scale-100'
                                }`}>
                                {state === StepState.CURRENT ? (
                                    <CircleDot className="w-6 h-6 text-terracotta animate-pulse" />
                                ) : state === StepState.DONE ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                        </div>

                        <p className={`text-sm md:text-base leading-relaxed pr-2 ${state === StepState.CURRENT
                            ? 'text-brown'
                            : state === StepState.DONE
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }`}>
                            {step.description}
                        </p>

                        {/* Mobile quick stats */}

                        <div className="flex gap-3 pt-1">
                            <div className="flex items-center gap-1 text-xs">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-emerald-700 font-medium">{usedPiecesCount} plasate</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <div className="w-2 h-2 rounded-full bg-brown"></div>
                                <span className="text-brown-dark font-medium">{unusedPiecesCount} rămase</span>
                            </div>
                        </div>

                    </div>


                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 md:px-6 md:pb-5">
                <div className="mt-4 space-y-6">
                    {/* Previews Section */}
                    <div className={`gap-4 md:gap-6 ${shouldRender3DPreview && shouldRenderTablePreview
                        ? 'grid grid-cols-1 md:grid-cols-2'
                        : 'flex justify-center'
                        }`}>
                        {/* 3D Preview */}
                        {shouldRender3DPreview && (
                            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 justify-center">
                                    <div className="w-6 h-1 bg-gradient-to-r from-terracotta to-terracotta-light rounded-full"></div>
                                    <span>Vizualizare ansamblare 3D</span>
                                    <div className="w-6 h-1 bg-gradient-to-r from-terracotta-light to-terracotta rounded-full"></div>
                                </h4>
                                <div className="flex justify-center">
                                    <PuzzleResultPreviewer
                                        key={`preview-${previewKey}-${step.stepNumber}`}
                                        puzzle={puzzle}
                                        unusedPieces={stepUnusedPieces}
                                        isMobile={isMobile}
                                        usedPieces={stepUsedPieces}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Table Preview */}
                        {shouldRenderTablePreview && (
                            <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 justify-center">
                                    <div className="w-6 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"></div>
                                    <span>Piese necesare</span>
                                    <div className="w-6 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                                </h4>
                                <div className="flex justify-center">
                                    <PuzzleTablePreview
                                        isMobile={isMobile}
                                        svgImages={stepSvgImages}
                                        minStep={step.stepNumber}
                                    />
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Action Buttons */}
                    <div className='flex justify-center gap-3 items-center flex-wrap'>
                        {step.stepNumber < puzzle.steps.length - 1 ? (
                            <Button
                                onClick={handleFinalizeStep}
                                className="min-w-[140px] md:min-w-[160px] bg-terracotta hover:bg-terracotta-dark  text-white font-semibold py-2 md:py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                disabled={unusedPiecesCount === 0 && state !== StepState.DONE}
                                size={isMobile ? "default" : "lg"}
                            >
                                Finalizează pas
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinalizeStep}
                                className="min-w-[140px] md:min-w-[160px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 md:py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                disabled={unusedPiecesCount === 0 && state !== StepState.DONE}
                                size={isMobile ? "default" : "lg"}
                            >
                                Finalizează puzzle
                            </Button>
                        )}
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            className="min-w-[120px] md:min-w-[140px] border-2 border-brown text-brown-dark hover:bg-brown hover:text-white font-semibold py-2 md:py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                            disabled={step.stepNumber === 1}
                            size={isMobile ? "default" : "lg"}
                        >
                            Înapoi
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

StepItem.displayName = 'StepItem';

const StepsListComponent = ({
    steps,
    usedPieces,
    unusedPieces,
    isVisible,
    isMobile,
    puzzle,
    svgImages,
    resetPuzzle,
    usePieces,
    reverseStep,
    resetToLast
}: StepListProps) => {
    const [openStep, setOpenStep] = useState(`step-${steps[0]?.stepNumber || 1}`);
    const [showCongrats, setShowCongrats] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const router = useRouter();

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    const currentStepNumber = useMemo(() =>
        isInitialized ? Number(openStep.replace("step-", "")) : 1,
        [openStep, isInitialized]
    );

    const filteredUsedPieces = useMemo(() =>
        usedPieces.filter(v => v.isMobile === isMobile),
        [usedPieces, isMobile]
    );

    const filteredUnusedPieces = useMemo(() =>
        unusedPieces.filter(v => v.isMobile === isMobile),
        [unusedPieces, isMobile]
    );

    const totalPiecesCount = useMemo(() =>
        filteredUsedPieces.length + filteredUnusedPieces.length,
        [filteredUsedPieces.length, filteredUnusedPieces.length]
    );

    const totalProgress = useMemo(() =>
        totalPiecesCount > 0 ? (filteredUsedPieces.length / totalPiecesCount) * 100 : 0,
        [filteredUsedPieces.length, totalPiecesCount]
    );

    const isPuzzleComplete = useMemo(() =>
        filteredUnusedPieces.length === 0 && filteredUsedPieces.length > 0,
        [filteredUnusedPieces.length, filteredUsedPieces.length]
    );

    useEffect(() => {
        if (isPuzzleComplete && !showCongrats && isInitialized) {
            setShowCongrats(true);
        }
    }, [isPuzzleComplete, showCongrats, isInitialized]);

    const handleStepChange = useCallback((newStepValue: string | undefined) => {
        if (!isInitialized) return;

        // Dacă utilizatorul apasă pe același pas => shadcn trimite undefined => închide accordionul
        if (!newStepValue) {
            setOpenStep("");
            return;
        }

        const newStep = Number(newStepValue.replace("step-", ""));
        const oldStep = currentStepNumber;

        setOpenStep(newStepValue);

        if (newStep !== oldStep) {
            if (newStep > oldStep) {
                const piecesToUse = unusedPieces.filter(v => v.step >= oldStep && v.step < newStep);
                if (piecesToUse.length > 0) {
                    usePieces(piecesToUse);
                }
            } else if (newStep < oldStep) {
                const selectedStep = steps.find(s => s.stepNumber === newStep);
                if (selectedStep) {
                    resetToLast(selectedStep);
                }
            }
        }
    }, [currentStepNumber, unusedPieces, usePieces, resetToLast, steps, isInitialized]);


    const stepItemsData = useMemo(() =>
        steps.map(step => {
            const stepValue = `step-${step.stepNumber}`;
            const isCurrent = openStep === stepValue;
            const isDone = usedPieces.some(p => p.step === step.stepNumber);
            const state = isCurrent ? StepState.CURRENT : isDone ? StepState.DONE : StepState.UNDONE;

            const stepUsedPieces = usedPieces;
            const stepUnusedPieces = unusedPieces.filter(v => v.step === step.stepNumber);
            const stepSvgImages = svgImages.filter(svg => svg.piece.step === step.stepNumber);

            return {
                step,
                state,
                stepUsedPieces,
                stepUnusedPieces,
                stepSvgImages
            };
        }),
        [steps, openStep, usedPieces, unusedPieces, svgImages]
    );

    const handleStepAction = useCallback((newStep: number, oldStep: number) => {
        if (isInitialized && newStep <= steps.length && newStep >= 1) {
            setOpenStep(`step-${newStep}`);
        }
    }, [steps.length, isInitialized]);

    const handleReview = useCallback(() => {
        setShowCongrats(false);
        setTimeout(() => {
            setOpenStep(`step-1`);
            const firstStep = steps[0];
            if (firstStep) {
                resetToLast(firstStep);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    setOpenStep(`step-1`);
                }, 100);
            }
        }, 100);
    }, [steps, resetToLast]);

    const handleGoHome = useCallback(() => {
        setTimeout(() => {
            setOpenStep(`step-1`);
            const firstStep = steps[0];
            if (firstStep) {
                resetToLast(firstStep);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    setOpenStep(`step-1`);
                }, 100);
            }
        }, 100);
        router.push('/');
    }, [router, steps, resetToLast]);

    if (!isInitialized || !isVisible) {
        return null;
    }

    return (
        <div className={`bg-white/95 w-full backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-4 md:p-6 transition-all duration-500 ease-out transform mx-auto ${isVisible ? "flex flex-col opacity-100 scale-100" : "scale-95 pointer-events-none opacity-0"
            }`}>
            {/* Header */}
            <div className="text-left mb-4 md:mb-6 px-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-terracotta to-orange-500 bg-clip-text text-transparent mb-2">
                    Pași de asamblare
                </h2>

            </div>

            {/* Steps Accordion */}
            <Accordion
                type="single"
                collapsible
                value={openStep}
                className="w-full flex justify-center flex-col"
                onValueChange={handleStepChange}
            >
                {stepItemsData.map(({ step, state, stepUsedPieces, stepUnusedPieces, stepSvgImages }) => (
                    <StepItem
                        key={step.stepNumber}
                        step={step}
                        state={state}
                        isMobile={isMobile}
                        stepUsedPieces={stepUsedPieces}
                        stepUnusedPieces={stepUnusedPieces}
                        stepSvgImages={stepSvgImages}
                        puzzle={puzzle}
                        onUsePieces={usePieces}
                        onReverseStep={reverseStep}
                        onStepChange={handleStepAction}
                        previewKey={previewKey}
                        setShowCongrats={setShowCongrats}
                    />
                ))}
            </Accordion>

            {/* Enhanced Progress Section */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 px-2">
                <div className="flex justify-between text-sm md:text-base text-gray-600 mb-3 font-medium">
                    <span>Progres total</span>
                    <span>
                        {filteredUsedPieces.length} / {totalPiecesCount} piese
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 shadow-inner overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-green-400 via-emerald-500 to-lime-800 h-full rounded-full transition-all duration-1000 ease-out shadow-md"
                        style={{ width: `${totalProgress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Început</span>
                    <span className={`font-bold ${totalProgress === 100 ? 'text-green-500' : 'text-brown'}`}>
                        {Math.round(totalProgress)}% complet
                    </span>
                    <span>Finalizat</span>
                </div>
            </div>

            {/* Enhanced Congratulations Dialog */}
            <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
                <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-orange-50 to-amber-50 border-2 border-terracotta shadow-2xl rounded-3xl overflow-hidden">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                <PartyPopper className="w-20 h-20 md:w-24 md:h-24 text-terracotta relative z-10 animate-bounce" />
                            </div>
                        </div>
                        <DialogTitle className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-terracotta to-orange-500 bg-clip-text text-transparent">
                            Felicitări!
                        </DialogTitle>
                        <DialogDescription className="text-center text-brown text-lg md:text-xl pt-3 font-medium">
                            Ai finalizat puzzle-ul cu succes! 🎉
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <Button
                            onClick={handleReview}
                            className="w-full bg-gradient-to-r from-terracotta to-orange-500 hover:from-terracotta-dark hover:to-orange-600 text-white font-semibold py-4 text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                        >
                            <RotateCcw className="w-6 h-6 mr-3" />
                            Revizuiește pașii
                        </Button>

                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="w-full border-2 border-brown text-brown hover:bg-brown hover:text-white font-semibold py-4 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            <Home className="w-6 h-6 mr-3" />
                            Pagina principală
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default memo(StepsListComponent);