import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShoppingCartItem } from '@/lib/types/ShoppingCart';




// Sau extend existing elements:
// În fișierul tău de store (ShoppingCart.ts)
export interface TextElement {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
    draggable: boolean;
    rotation: number;
    scaleX: number;
    scaleY: number;
}

export interface LogoElement {
    id: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    draggable: boolean;
    rotation: number;
    scaleX: number;
    scaleY: number;
}
/**
 * Interfață pentru configurația de personalizare a produsului
 */
export interface ProductCustomization {
    id: string;
    productId: number;
    background: string; // Culoare hex sau URL imagine
    textElements: TextElement[];
    logoElements: LogoElement[];
    dimensions: {
        width: string;
        length: string;
        heigth: string;
    };
    thumbnail: string; // DataURL pentru preview
    pngExport?: string; // DataURL sau path
    glbExport?: string; // Path către fișier GLB
    createdAt: number; // Timestamp
    mapImage: string;
}


/**
 * State pentru shopping cart
 */
interface ShoppingCartState {
    // Cart items
    items: ShoppingCartItem[];

    // Customization în curs (pentru editor)
    currentCustomization: ProductCustomization | null;

    // Actions pentru cart
    addItem: (item: ShoppingCartItem, customization?: ProductCustomization) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;

    // Actions pentru customization
    setCurrentCustomization: (customization: ProductCustomization | null) => void;
    updateCustomizationBackground: (background: string) => void;
    addTextElement: (textElement: TextElement) => void;
    updateTextElement: (id: string, updates: Partial<TextElement>) => void;
    removeTextElement: (id: string) => void;
    addLogoElement: (logoElement: LogoElement) => void;
    updateLogoElement: (id: string, updates: Partial<LogoElement>) => void;
    removeLogoElement: (id: string) => void;
    resetCustomization: (productId: number) => void;

    // Computed values
    getTotalPrice: () => number;
    getTotalItems: () => number;
    getItemById: (itemId: string) => ShoppingCartItem | undefined;
    deleteLogoElement: (id: string) => void;
    deleteTextElement: (id: string) => void;
}

/**
 * Store principal Zustand cu persistență în localStorage
 */
export const useShoppingCartStore = create<ShoppingCartState>()(
    persist(
        (set, get) => ({
            // Initial state
            items: [],
            currentCustomization: null,

            // === CART ACTIONS ===

            addItem: (item, customization) => {
                set((state) => {
                    // Verifică dacă produsul există deja
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.id === item.id
                    );

                    if (existingItemIndex >= 0) {
                        // Update quantity dacă există
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex].quantity += item.quantity;

                        console.log(`✅ Produs actualizat în coș: ${item.name}`);
                        return { items: updatedItems };
                    } else {
                        // Adaugă produs nou
                        console.log(`✅ Produs adăugat în coș: ${item.name}`);
                        return { items: [...state.items, item] };
                    }
                });

                // Salvează customization-ul dacă există
                if (customization) {
                    console.log(`💾 Customization salvat pentru ${item.name}`);
                    // Aici poți adăuga logică suplimentară pentru salvare în DB/localStorage
                }
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
                console.log(`🗑️ Produs șters din coș: ${itemId}`);
            },

            updateQuantity: (itemId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        // Șterge produsul dacă quantity = 0
                        return {
                            items: state.items.filter((item) => item.id !== itemId),
                        };
                    }

                    const updatedItems = state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    );

                    return { items: updatedItems };
                });
                console.log(`🔄 Cantitate actualizată pentru ${itemId}: ${quantity}`);
            },

            clearCart: () => {
                set({ items: [] });
                console.log('🧹 Coș golit');
            },

            // === CUSTOMIZATION ACTIONS ===

            setCurrentCustomization: (customization) => {
                set({ currentCustomization: customization });
                console.log('🎨 Customization setat:', customization?.id);
            },

            updateCustomizationBackground: (background) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            background,
                        },
                    };
                });
                console.log('🎨 Background actualizat:', background);
            },

            addTextElement: (textElement) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            textElements: [
                                ...state.currentCustomization.textElements,
                                textElement,
                            ],
                        },
                    };
                });
                console.log('✍️ Text adăugat:', textElement.text);
            },

            updateTextElement: (id, updates) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            textElements: state.currentCustomization.textElements.map((el) =>
                                el.id === id ? { ...el, ...updates } : el
                            ),
                        },
                    };
                });
                console.log('✏️ Text actualizat:', id);
            },

            removeTextElement: (id) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            textElements: state.currentCustomization.textElements.filter(
                                (el) => el.id !== id
                            ),
                        },
                    };
                });
                console.log('🗑️ Text șters:', id);
            },

            addLogoElement: (logoElement) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            logoElements: [
                                ...state.currentCustomization.logoElements,
                                logoElement,
                            ],
                        },
                    };
                });
                console.log('🖼️ Logo adăugat:', logoElement.imageUrl);
            },

            updateLogoElement: (id, updates) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            logoElements: state.currentCustomization.logoElements.map((el) =>
                                el.id === id ? { ...el, ...updates } : el
                            ),
                        },
                    };
                });
                console.log('🖼️ Logo actualizat:', id);
            },

            removeLogoElement: (id) => {
                set((state) => {
                    if (!state.currentCustomization) return state;

                    return {
                        currentCustomization: {
                            ...state.currentCustomization,
                            logoElements: state.currentCustomization.logoElements.filter(
                                (el) => el.id !== id
                            ),
                        },
                    };
                });
                console.log('🗑️ Logo șters:', id);
            },

            resetCustomization: (productId) => {
                set({
                    currentCustomization: {
                        id: `custom-${Date.now()}`,
                        productId,
                        background: '#FFFFFF',
                        textElements: [],
                        logoElements: [],
                        mapImage: '',
                        dimensions: {
                            width: '20cm',
                            length: '15cm',
                            heigth: '10cm',
                        },
                        thumbnail: '',
                        createdAt: Date.now(),
                    },
                });
                console.log('🔄 Customization resetat pentru produsul:', productId);
            },

            deleteTextElement: (id: string) => {
                set((state) => ({
                    currentCustomization: state.currentCustomization
                        ? {
                            ...state.currentCustomization,
                            textElements: state.currentCustomization.textElements.filter(
                                (el) => el.id !== id
                            ),
                        }
                        : null,
                }));
            },

            deleteLogoElement: (id: string) => {
                set((state) => ({
                    currentCustomization: state.currentCustomization
                        ? {
                            ...state.currentCustomization,
                            logoElements: state.currentCustomization.logoElements.filter(
                                (el) => el.id !== id
                            ),
                        }
                        : null,
                }));
            },

            // === COMPUTED VALUES ===

            getTotalPrice: () => {
                const state = get();
                return state.items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            getTotalItems: () => {
                const state = get();
                return state.items.reduce((total, item) => total + item.quantity, 0);
            },

            getItemById: (itemId) => {
                const state = get();
                return state.items.find((item) => item.id === itemId);
            },
        }),
        {
            name: 'shopping-cart-storage', // Numele în localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Salvează doar items în localStorage
                // currentCustomization e temporar, nu trebuie persistat
                items: state.items,
            }),
        }
    )
);