import { create } from 'zustand'
import { IPuzzle, IPuzzleSteps, PuzzlePiece, puzzles } from '../collection/puzzle'

interface IPuzzleStore {
    products: IPuzzle[],
    unusedPieces: PuzzlePiece[],
    usedPieces: PuzzlePiece[],
    initializePuzzle: (pieces: PuzzlePiece[]) => void,
    usePieces: (pieces: PuzzlePiece[]) => void,
    reverseStep: () => void;
    resetPuzzle: () => void;
    useAllPieces: () => void;
    resetToLast: (step: IPuzzleSteps) => void;
}

export const usePuzzleStore = create<IPuzzleStore>((set, get) => ({
    products: puzzles,
    unusedPieces: [],
    usedPieces: [],

    initializePuzzle: (pieces) => set({ unusedPieces: pieces }),

    usePieces: (pieces) => {
        const { unusedPieces, usedPieces } = get();

        // 🎯 OPTIMIZARE: Early return dacă nu sunt piese de adăugat
        if (pieces.length === 0) return;

        // Elimină doar piesele specifice care sunt folosite
        const pieceIdsToRemove = new Set(pieces.map(p => p._id));

        // 🎯 OPTIMIZARE: Verifică dacă chiar trebuie să update-ezi state-ul
        const hasChanges = unusedPieces.some(p => pieceIdsToRemove.has(p._id));
        if (!hasChanges) return;

        set({
            unusedPieces: unusedPieces.filter(p => !pieceIdsToRemove.has(p._id)),
            usedPieces: [...usedPieces, ...pieces]
        });
    },

    reverseStep: () => {
        const { usedPieces, unusedPieces } = get();

        // 🎯 OPTIMIZARE: Early return dacă nu sunt piese de reversat
        if (usedPieces.length === 0) return;

        const maxStep = Math.max(...usedPieces.map(item => item.step));
        const lastPieces = usedPieces.filter(value => value.step === maxStep);

        // 🎯 OPTIMIZARE: Evită update dacă nu sunt piese de mutat
        if (lastPieces.length === 0) return;

        set({
            usedPieces: usedPieces.slice(0, -lastPieces.length),
            unusedPieces: [...lastPieces, ...unusedPieces]
        });
    },

    resetPuzzle: () => {
        const { usedPieces, unusedPieces } = get();

        // 🎯 OPTIMIZARE: Early return dacă puzzle-ul e deja resetat
        if (usedPieces.length === 0) return;

        set({
            unusedPieces: [...usedPieces, ...unusedPieces],
            usedPieces: []
        });
    },

    useAllPieces: () => {
        const { usedPieces, unusedPieces } = get();

        // 🎯 OPTIMIZARE: Early return dacă toate piesele sunt deja folosite
        if (unusedPieces.length === 0) return;

        set({
            usedPieces: [...usedPieces, ...unusedPieces],
            unusedPieces: []
        });
    },

    resetToLast: (step) => {
        const { usedPieces, unusedPieces } = get();

        // 🎯 OPTIMIZARE: Calculează doar odată
        const piecesToReset = usedPieces.filter(v => v.step >= step.stepNumber);
        const remainingUsedPieces = usedPieces.filter(v => v.step < step.stepNumber);

        // 🎯 OPTIMIZARE: Early return dacă nu sunt modificări
        if (piecesToReset.length === 0) return;

        set({
            unusedPieces: [...unusedPieces, ...piecesToReset],
            usedPieces: remainingUsedPieces,
        });
    }
}));

// 🎯 OPTIMIZARE: Selectori custom pentru componente
// Acestea previn re-renders inutile când se schimbă părți nefolosite din store

export const useProducts = () => usePuzzleStore(state => state.products);
export const useUsedPieces = () => usePuzzleStore(state => state.usedPieces);
export const useUnusedPieces = () => usePuzzleStore(state => state.unusedPieces);

// Selectori pentru actions (nu trigger re-render la modificări de state)
export const usePuzzleActions = () => usePuzzleStore(state => ({
    initializePuzzle: state.initializePuzzle,
    usePieces: state.usePieces,
    reverseStep: state.reverseStep,
    resetPuzzle: state.resetPuzzle,
    useAllPieces: state.useAllPieces,
    resetToLast: state.resetToLast
}));

// Selector pentru stats (computații memoizate)
export const usePuzzleStats = () => usePuzzleStore(state => ({
    totalPieces: state.usedPieces.length + state.unusedPieces.length,
    usedCount: state.usedPieces.length,
    unusedCount: state.unusedPieces.length,
    isComplete: state.unusedPieces.length === 0 && state.usedPieces.length > 0,
    progress: state.usedPieces.length + state.unusedPieces.length > 0
        ? (state.usedPieces.length / (state.usedPieces.length + state.unusedPieces.length)) * 100
        : 0
}));