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

        // Elimină doar piesele specifice care sunt folosite
        const pieceIdsToRemove = new Set(pieces.map(p => p._id));

        set({
            unusedPieces: unusedPieces.filter(p => !pieceIdsToRemove.has(p._id)),
            usedPieces: [...usedPieces, ...pieces]
        });
    },
    reverseStep: () => {
        const { usedPieces, unusedPieces } = get()
        if (usedPieces.length > 0) {
            const lastPieces = usedPieces.filter((value, index) => value.step === Math.max(...usedPieces.map(item => item.step)))
            set({
                usedPieces: usedPieces.slice(0, -lastPieces.length),
                unusedPieces: [...lastPieces, ...unusedPieces]
            })
        }
    },
    resetPuzzle: () => {
        const { usedPieces, unusedPieces } = get();
        if (usedPieces.length > 0) {
            set({
                unusedPieces: [...usedPieces, ...unusedPieces],
                usedPieces: []

            })
        }
    },
    useAllPieces: () => {
        const { usedPieces, unusedPieces } = get();
        if (unusedPieces.length > 0) {
            set({
                usedPieces: [...usedPieces, ...unusedPieces],
                unusedPieces: []
            })
        }
    },
    resetToLast: (step) => {
        const { usedPieces, unusedPieces } = get();

        // piesele care trebuie date înapoi
        const piecesToReset = usedPieces.filter(v => v.step >= step.stepNumber);

        set({
            // pun piesele resetate înapoi + piesele care erau deja nefolosite
            unusedPieces: [...unusedPieces, ...piecesToReset],

            // păstrez doar piesele de până la acel pas
            usedPieces: usedPieces.filter(v => v.step < step.stepNumber),
        });
    }


}))
