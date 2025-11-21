import { create } from 'zustand'
import { IPuzzle, IPuzzleSteps, PuzzlePiece, puzzles } from '../collection/puzzle'

interface IPuzzleStore {
    products: IPuzzle[],
    unusedPieces: PuzzlePiece[] | null,
    usedPieces: PuzzlePiece[] | null,
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

        // Verifică dacă piesele există deja în usedPieces pentru a evita duplicatele
        const pieceIdsToRemove = new Set(pieces.map(p => p._id));

        // Filtrează doar piesele care nu sunt deja în usedPieces
        const newUsedPieces = pieces.filter(p =>
            !usedPieces.some(used => used._id === p._id)
        );

        // Verifică dacă toate piesele sunt deja folosite
        if (newUsedPieces.length === 0) {
            console.log('Toate piesele sunt deja folosite');
            return;
        }

        set({
            unusedPieces: unusedPieces ? unusedPieces.filter(p => !pieceIdsToRemove.has(p._id)) : [],
            usedPieces: [...usedPieces, ...newUsedPieces]
        });
    },

    reverseStep: () => {
        const { usedPieces, unusedPieces } = get()
        if (usedPieces && usedPieces.length > 0) {
            const maxStep = Math.max(...usedPieces.map(item => item.step));
            const lastPieces = usedPieces.filter(value => value.step === maxStep);

            set({
                usedPieces: usedPieces.filter(p => p.step !== maxStep),
                unusedPieces: [...(unusedPieces || []), ...lastPieces]
            })
        }
    },

    resetPuzzle: () => {
        const { usedPieces, unusedPieces } = get();
        if (usedPieces && usedPieces.length > 0) {
            set({
                unusedPieces: [...(unusedPieces || []), ...usedPieces],
                usedPieces: []
            })
        }
    },

    useAllPieces: () => {
        const { usedPieces, unusedPieces } = get();
        if (unusedPieces && unusedPieces.length > 0) {
            // Filtrează doar piesele care nu sunt deja folosite
            const newPieces = unusedPieces.filter(p =>
                !usedPieces.some(used => used._id === p._id)
            );

            set({
                usedPieces: [...usedPieces, ...newPieces],
                unusedPieces: []
            })
        }
    },

    resetToLast: (step) => {
        const { usedPieces, unusedPieces } = get();

        if (!usedPieces) return;

        // Piesele care trebuie date înapoi (cele cu step >= step.stepNumber)
        const piecesToReset = usedPieces.filter(v => v.step >= step.stepNumber);

        // Piesele care rămân folosite (cele cu step < step.stepNumber)
        const remainingUsedPieces = usedPieces.filter(v => v.step < step.stepNumber);

        set({
            unusedPieces: [...(unusedPieces || []), ...piecesToReset],
            usedPieces: remainingUsedPieces,
        });
    }
}))