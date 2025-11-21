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

    initializePuzzle: (pieces) => {
        console.log('🎯 initializePuzzle called with', pieces.length, 'pieces');
        console.trace('initializePuzzle call stack');
        set({ unusedPieces: pieces, usedPieces: [] });
    },

    usePieces: (pieces) => {
        const { unusedPieces, usedPieces } = get();

        console.log('usePieces called with:', pieces);
        console.log('before - unusedPieces:', unusedPieces?.length);
        console.log('before - usedPieces:', usedPieces?.length);

        // Filtrează doar piesele care nu sunt deja în usedPieces
        const newUsedPieces = pieces.filter(p =>
            !usedPieces?.some(used => used._id === p._id)
        );

        // Verifică dacă toate piesele sunt deja folosite
        if (newUsedPieces.length === 0) {
            console.log('Toate piesele sunt deja folosite - nu se face update');
            return;
        }

        // IMPORTANT: Folosim 'pieces' (parametrul original), nu 'newUsedPieces'
        // Trebuie să eliminăm din unusedPieces TOATE piesele cerute,
        // chiar dacă unele erau deja în usedPieces
        const pieceIdsToRemove = new Set(pieces.map(p => p._id));

        set({
            unusedPieces: unusedPieces ? unusedPieces.filter(p => !pieceIdsToRemove.has(p._id)) : [],
            usedPieces: [...(usedPieces || []), ...newUsedPieces]
        });

        // Verifică după set
        setTimeout(() => {
            const state = get();
            console.log('after - unusedPieces:', state.unusedPieces?.length);
            console.log('after - usedPieces:', state.usedPieces?.length);

            // Verificare suplimentară pentru debugging
            const total = (state.unusedPieces?.length || 0) + (state.usedPieces?.length || 0);
            console.log('total pieces:', total);
            if (total !== 22) {
                console.error('⚠️ EROARE: Numărul total de piese nu este 22!');
            }
        }, 0);
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
        console.log('🔄 resetPuzzle called');
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
                !usedPieces?.some(used => used._id === p._id)
            );

            set({
                usedPieces: [...(usedPieces || []), ...newPieces],
                unusedPieces: []
            })
        }
    },

    resetToLast: (step) => {
        const { usedPieces, unusedPieces } = get();

        console.log('🔙 resetToLast called for step:', step.stepNumber);

        if (!usedPieces) return;

        // Piesele care trebuie date înapoi (cele cu step >= step.stepNumber)
        const piecesToReset = usedPieces.filter(v => v.step >= step.stepNumber);

        // Piesele care rămân folosite (cele cu step < step.stepNumber)
        const remainingUsedPieces = usedPieces.filter(v => v.step < step.stepNumber);

        console.log('piecesToReset:', piecesToReset.length);
        console.log('remainingUsedPieces:', remainingUsedPieces.length);

        set({
            unusedPieces: [...(unusedPieces || []), ...piecesToReset],
            usedPieces: remainingUsedPieces,
        });
    }
}))