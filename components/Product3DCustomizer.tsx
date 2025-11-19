"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShoppingCart, Loader2, Maximize2, Minimize2, Trash2, Undo, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Konva from 'konva';
import * as THREE from 'three';
import { CustomizationToolbar, ToolbarView } from './CustomizationToolbar';
import { Product2DEditor } from './Product2DEditor';
import { Product } from '@/lib/types/Product';
import { LogoElement, TextElement, useShoppingCartStore } from '@/lib/stores/ShoppingCart';
import { ProductPreview3D } from './ProductPreview3D';
import { modelsMapper } from '@/lib/utils/modelsMapper';
import { exportToGLB, generateThumbnail } from '@/lib/utils/exportUtils';

export const COLOR_PALETTE = [
    '#FFFFFF', '#000000', '#7A3A2E', '#E8D9C3', '#A13E2E', '#737373',
    '#F5F2ED', '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#E67E22',
];

export const FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Verdana', 'Comic Sans MS', 'Impact',
];

interface Product3DCustomizerProps {
    product: Product;
    onClose: () => void;
}

interface EditHistory {
    textElements: TextElement[];
    logoElements: LogoElement[];
    background: string;
}

export default function Product3DCustomizer({ product, onClose }: Product3DCustomizerProps) {
    // Refs
    const stageRef = useRef<Konva.Stage>(null);

    // State-uri principale
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [logoElements, setLogoElements] = useState<LogoElement[]>([]);
    const [background, setBackground] = useState('#FFFFFF');
    const [objectColor, setObjectColor] = useState('#FFFFFF');
    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // State-uri UI și layout
    const [show3DPreview, setShow3DPreview] = useState(true);
    const [is3DExpanded, setIs3DExpanded] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [persistent3D, setPersistent3D] = useState(false);

    // State-uri pentru funcționalități avansate
    const [isExporting, setIsExporting] = useState(false);
    const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);
    const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // State-uri pentru toolbar și editare - UNIFICATE
    const [activeToolbarView, setActiveToolbarView] = useState<ToolbarView>(null);
    const [editingText, setEditingText] = useState<TextElement | null>(null);
    const [previewSize, setPreviewSize] = useState({ width: 350, height: 450 });

    // Store
    const { addItem } = useShoppingCartStore();

    useEffect(() => {
        const updatePreviewSize = () => {
            if (isMobile) {
                setPreviewSize({ width: window.innerWidth - 32, height: 320 });
            } else if (is3DExpanded) {
                // Pentru modul expandat, folosim 80% din inaltimea ferestrei
                const width = Math.min(600, window.innerWidth * 0.8);
                const height = Math.min(400, window.innerHeight * 0.8);
                setPreviewSize({ width, height });
            } else {
                // Pentru modul normal, dimensiuni proportionale
                const width = 400;
                const height = 500;
                setPreviewSize({ width, height });
            }
        };

        updatePreviewSize();
        window.addEventListener('resize', updatePreviewSize);

        return () => window.removeEventListener('resize', updatePreviewSize);
    }, [isMobile, is3DExpanded]);

    // Detectare dispozitiv și layout adaptiv
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {

                setShow3DPreview(false);
            } else {

                setShow3DPreview(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Efect pentru persistenta 3D pe mobile
    useEffect(() => {
        if (isMobile && show3DPreview) {
            setPersistent3D(true);
        }
    }, [isMobile, show3DPreview]);

    // Gestionare istoric - folosind useCallback pentru stabilitate
    const saveToHistory = useCallback(() => {
        const newHistory = editHistory.slice(0, historyIndex + 1);
        newHistory.push({
            textElements: [...textElements],
            logoElements: [...logoElements],
            background
        });
        setEditHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [textElements, logoElements, background, editHistory, historyIndex]);

    // Inițializare istoric
    useEffect(() => {
        saveToHistory();
    }, []);

    // Funcție unificată pentru schimbarea view-ului toolbar-ului
    const handleToolbarViewChange = useCallback((newView: ToolbarView) => {
        // Verifică dacă sunt modificări nesalvate doar când se schimbă view-ul sau se închide
        if (isMobile && editingText && newView !== 'text') {
            const confirm = window.confirm('Aveți modificări nesalvate. Sigur doriți să schimbați panoul?');
            if (!confirm) return;
        }

        if (activeToolbarView === newView) {
            // Închide panoul dacă face click pe același buton
            setActiveToolbarView(null);
            if (isMobile) {
                setEditingText(null);
            }
        } else {
            // Schimbă la noul view
            setActiveToolbarView(newView);
            if (newView !== 'text') {
                setEditingText(null);
            }
        }
    }, [activeToolbarView, editingText, isMobile]);

    // Închidere panou toolbar cu gestionare modificări nesalvate
    const handleCloseToolbarView = useCallback(() => {
        if (isMobile && editingText) {
            const confirm = window.confirm('Aveți modificări nesalvate. Sigur doriți să închideți?');
            if (!confirm) return;
        }
        setActiveToolbarView(null);
        setEditingText(null);
    }, [editingText, isMobile]);

    // Handler pentru editarea textului din 2D Editor
    const handleEditTextFrom2D = useCallback((text: TextElement) => {
        setEditingText(text);
        setActiveToolbarView('text'); // Deschide automat panoul de text
    }, []);

    // Undo functionality
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const previousState = editHistory[historyIndex - 1];
            setTextElements(previousState.textElements);
            setLogoElements(previousState.logoElements);
            setBackground(previousState.background);
            setHistoryIndex(historyIndex - 1);
        }
    }, [historyIndex, editHistory]);

    // Delete selected element
    const handleDelete = useCallback(() => {
        if (selectedId) {
            if (selectedId.startsWith('text-')) {
                setTextElements(prev => {
                    const newElements = prev.filter(el => el.id !== selectedId);
                    saveToHistory();
                    return newElements;
                });
            } else if (selectedId.startsWith('logo-')) {
                setLogoElements(prev => {
                    const newElements = prev.filter(el => el.id !== selectedId);
                    saveToHistory();
                    return newElements;
                });
            }
            setSelectedId(null);
        }
    }, [selectedId, saveToHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDelete();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleDelete]);

    // Handlers pentru elemente de personalizare
    const handleCanvasUpdate = useCallback((newCanvas: HTMLCanvasElement) => {
        setCanvas(newCanvas);
    }, []);

    const handleAddText = useCallback((text: TextElement) => {
        setTextElements(prev => {
            const newElements = [...prev, text];
            saveToHistory();
            return newElements;
        });
    }, [saveToHistory]);

    const handleAddLogo = useCallback((logo: LogoElement) => {
        setLogoElements(prev => {
            const newElements = [...prev, logo];
            saveToHistory();
            return newElements;
        });
    }, [saveToHistory]);

    const handleChangeBackground = useCallback((color: string) => {
        setBackground(color);
        saveToHistory();
    }, [saveToHistory]);

    const handleObjectColorChange = useCallback((color: string) => {
        setObjectColor(color);
    }, []);

    const handleTextureSelect = useCallback((textureUrl: string) => {
        setSelectedTexture(textureUrl);
    }, []);

    const handleEditText = useCallback((id: string, updates: Partial<TextElement>) => {
        setTextElements(prev => {
            const newElements = prev.map(el =>
                el.id === id ? { ...el, ...updates } : el
            );
            saveToHistory();
            return newElements;
        });
    }, [saveToHistory]);

    const handleDeleteText = useCallback((id: string) => {
        setTextElements(prev => {
            const newElements = prev.filter(el => el.id !== id);
            saveToHistory();
            return newElements;
        });
        if (selectedId === id) {
            setSelectedId(null);
        }
    }, [selectedId, saveToHistory]);

    const handleDeleteLogo = useCallback((id: string) => {
        setLogoElements(prev => {
            const newElements = prev.filter(el => el.id !== id);
            saveToHistory();
            return newElements;
        });
        if (selectedId === id) {
            setSelectedId(null);
        }
    }, [selectedId, saveToHistory]);

    // Export GLB
    const handleExportGLB = useCallback(async () => {
        if (!threeScene) {
            alert('❌ Scena 3D nu este încărcată. Așteptați...');
            return;
        }

        setIsExporting(true);
        try {
            await exportToGLB(threeScene, `custom-${product.name}`);
            console.log('✅ GLB exportat cu succes!');
        } catch (error) {
            console.error('❌ Eroare la exportul GLB:', error);
            alert('❌ Eroare la exportul GLB. Încercați din nou.');
        } finally {
            setIsExporting(false);
        }
    }, [threeScene, product.name]);

    // Add to cart function
    const handleAddToCart = useCallback(async () => {
        if (!stageRef.current) {
            alert('❌ Nu există design de salvat.');
            return;
        }

        try {
            const thumbnail = generateThumbnail(stageRef, 300, 300);

            if (!thumbnail) {
                throw new Error('Nu s-a putut genera thumbnail-ul');
            }

            const customization = {
                id: `custom-${Date.now()}`,
                productId: product.id,
                background,
                textElements,
                logoElements,
                objectColor,
                dimensions: product.dimensions,
                thumbnail,
                mapImage: canvas?.toDataURL('image/png') || thumbnail,
                createdAt: Date.now(),
            };

            const cartItem = {
                id: `item-${Date.now()}`,
                name: `${product.name} (Personalizat)`,
                price: product.price,
                image: thumbnail,
                image3D: product.image3D,
                type: 'customized',
                discount: 0,
                quantity: 1,
                customization
            };

            addItem(cartItem);
            alert('✅ Produs personalizat adăugat în coș!');
            onClose();

        } catch (error) {
            console.error('❌ Eroare la adăugarea în coș:', error);
            alert('❌ Eroare la adăugarea în coș. Încercați din nou.');
        }
    }, [stageRef, product, background, textElements, logoElements, objectColor, canvas, addItem, onClose]);

    // Închidere cu confirmare
    const handleClose = useCallback(() => {
        if (textElements.length > 0 || logoElements.length > 0) {
            const confirm = window.confirm('⚠️ Aveți modificări nesalvate. Sigur doriți să închideți?');
            if (!confirm) return;
        }
        onClose();
    }, [textElements, logoElements, onClose]);

    // Layout helpers
    const getMainLayout = useCallback(() => {
        return isMobile ? "flex-col" : "flex-row";
    }, [isMobile]);

    const getToolbarWidth = useCallback(() => {
        return isMobile && "w-20";
    }, [isMobile]);

    const getEditorWidth = useCallback(() => {
        if (isMobile) return "w-full";
        if (!show3DPreview) return "w-full";
        if (is3DExpanded) return "w-0";
        return "flex-1";
    }, [isMobile, show3DPreview, is3DExpanded]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white z-50 flex flex-col"
            >
                {/* Header - Adaptiv pentru mobile */}
                <div className="bg-white border-b border-beige px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Mobile menu button */}
                        {isMobile && (
                            <Button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                variant="ghost"
                                size="icon"
                                className="text-[#737373]"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <h2 className="text-lg sm:text-xl font-bold text-brown truncate max-w-[200px] sm:max-w-none">
                                {product.name}
                            </h2>
                            <div className="text-xs sm:text-sm text-[#737373]">
                                {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.heigth}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Edit Controls - Ascunse pe mobile în meniu */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleUndo}
                                    disabled={historyIndex <= 0}
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex items-center gap-2"
                                >
                                    <Undo className="w-4 h-4" />
                                    <span className="hidden lg:inline">Undo (Ctrl+Z)</span>
                                </Button>

                                <Button
                                    onClick={handleDelete}
                                    disabled={!selectedId}
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden lg:inline">Delete</span>
                                </Button>
                            </div>
                        )}

                        {/* 3D Toggle - Adaptiv */}
                        <div className={`flex items-center gap-2 bg-[#F5F2ED] px-3 sm:px-4 py-1 sm:py-2 rounded-lg ${isMobile ? 'text-xs' : ''}`}>
                            <Label htmlFor="3d-toggle" className={`text-[#737373] cursor-pointer ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {isMobile ? '3D' : 'Live 3D'}
                            </Label>
                            <Switch
                                id="3d-toggle"
                                checked={show3DPreview}
                                onCheckedChange={setShow3DPreview}
                                className={isMobile ? 'scale-75' : ''}
                            />
                        </div>


                        <Button
                            onClick={handleClose}
                            variant="ghost"
                            size="icon"
                            className="text-[#737373]"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobile && showMobileMenu && (
                    <div className="fixed inset-0 z-1000 bg-black bg-opacity-50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
                        <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-3">
                                <Button
                                    onClick={handleUndo}
                                    disabled={historyIndex <= 0}
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Undo className="w-4 h-4 mr-2" />
                                    Undo
                                </Button>

                                <Button
                                    onClick={handleDelete}
                                    disabled={!selectedId}
                                    variant="outline"
                                    className="w-full justify-start text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Element
                                </Button>



                                <div className="border-t pt-3">
                                    <div className="text-sm font-semibold text-brown mb-2">Quick Actions</div>
                                    <Button
                                        onClick={handleExportGLB}
                                        disabled={isExporting || !threeScene}
                                        variant="outline"
                                        className="w-full justify-start mb-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4 mr-2" />
                                        )}
                                        Export GLB
                                    </Button>

                                    <Button
                                        onClick={handleAddToCart}
                                        className="w-full justify-start bg-brown hover:bg-terracotta text-white"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Adaugă în Coș
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className={`flex-1 flex overflow-hidden ${getMainLayout()}`}>
                    {/* Left: Toolbar */}
                    {(
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isMobile ? "100%" : "80px" }}
                            className={`bg-[#F5F2ED] border-r border-beige ${isMobile ? 'p-2  top-0 ' : 'p-2 h-full'} ${getToolbarWidth()} ${isMobile ? 'flex-row ' : 'flex-col'} flex ${isMobile ? 'items-center' : ''} shrink-0`}
                            style={isMobile ? { minHeight: '80px' } : undefined}
                        >
                            <CustomizationToolbar
                                selectedFace="front" // Simplificat pentru exemplu
                                onAddText={handleAddText}
                                onAddLogo={handleAddLogo}
                                onChangeBackground={handleChangeBackground}
                                onChangeObjectColor={handleObjectColorChange}
                                textElements={textElements}
                                logoElements={logoElements}
                                onEditText={handleEditText}
                                onDeleteText={handleDeleteText}
                                onDeleteLogo={handleDeleteLogo}
                                activeView={activeToolbarView}
                                setActiveView={handleToolbarViewChange} // Folosește funcția unificată
                                editingText={editingText}
                                setEditingText={setEditingText}
                                onTextureSelect={handleTextureSelect}
                                isMobile={isMobile}
                                onClosePanel={handleCloseToolbarView}
                            />
                        </motion.div>
                    )}

                    {/* Center: 2D Editor */}
                    <div className={`bg-[#E5E5E5] flex flex-col ${getEditorWidth()} transition-all duration-300`}>
                        {/* Editor Controls */}
                        <div className="bg-white border-b border-beige px-3 sm:px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <span className="text-xs sm:text-sm text-[#737373]">
                                    Elemente: {textElements.length + logoElements.length}
                                </span>
                                {selectedId && (
                                    <span className="text-xs sm:text-sm text-brown font-semibold hidden sm:inline">
                                        Element selectat • Apasă Delete pentru a șterge
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons - Doar pe desktop */}
                            {!isMobile && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleExportGLB}
                                        disabled={isExporting || !threeScene}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        {isExporting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Export GLB
                                    </Button>

                                    <Button
                                        onClick={handleAddToCart}
                                        className="bg-brown hover:bg-terracotta text-white flex items-center gap-2"
                                        size="sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Adaugă în Coș
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 2D Editor */}
                        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-auto">
                            <Product2DEditor
                                onCanvasUpdate={handleCanvasUpdate}
                                textElements={textElements}
                                logoElements={logoElements}
                                background={background}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                stageRef={stageRef}
                                onEditText={handleEditTextFrom2D}
                            />
                        </div>
                    </div>

                    {(show3DPreview || (isMobile && persistent3D)) && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className={`bg-white border-l border-beige ${isMobile
                                ? 'w-full h-80'
                                : is3DExpanded
                                    ? 'w-full max-w-[90vw]' // Modificat pentru a ocupa mai mult spatiu
                                    : 'w-[400px]' // Modificat pentru a fi mai larg
                                } transition-all duration-300 flex flex-col shrink-0`}
                        >
                            <div className="p-3 sm:p-4 border-b border-beige flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-brown text-sm sm:text-base">
                                        3D Preview {is3DExpanded && '(Expanded)'}
                                    </h3>
                                    <p className="text-xs text-[#737373]">Live rendering</p>
                                </div>
                                {!isMobile && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#737373] hidden sm:block">
                                            {previewSize.width}×{previewSize.height}
                                        </span>
                                        <Button
                                            onClick={() => setIs3DExpanded(!is3DExpanded)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-[#737373]"
                                        >
                                            {is3DExpanded ? (
                                                <Minimize2 className="w-4 h-4" />
                                            ) : (
                                                <Maximize2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-2 sm:p-4 flex items-center justify-center bg-[#F5F2ED] overflow-hidden">
                                <div className={`w-full h-full flex items-center justify-center ${is3DExpanded ? 'max-h-[80vh]' : ''
                                    }`}>
                                    <ProductPreview3D
                                        canvas={canvas}
                                        width={previewSize.width}
                                        height={previewSize.height}
                                        Model={modelsMapper[product.image3D]}
                                        objectColor={objectColor}
                                        onSceneReady={setThreeScene}
                                        textureUrl={selectedTexture}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Bottom Status Bar - Adaptiv */}
                <div className="bg-[#F5F2ED] border-t border-beige px-3 sm:px-6 py-2 flex items-center justify-between text-xs text-[#737373]">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <span>Zoom: 100%</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Elements: {textElements.length + logoElements.length}</span>
                        {!isMobile && (
                            <>
                                <span>•</span>
                                <span>Shortcuts: Ctrl+Z (Undo), Delete (Șterge)</span>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="hidden sm:block">
                            {threeScene ? '💾 GLB Ready' : '⏳ Loading 3D...'}
                            • {stageRef.current ? '🎨 Editor Ready' : '⏳ Loading Editor...'}
                        </div>
                        <div className="sm:hidden text-xs">
                            {threeScene ? '💾 Ready' : '⏳ Loading...'}
                        </div>
                    </div>
                </div>

                {/* Mobile Action Bar */}
                {isMobile && (
                    <div className="bg-white border-t border-beige p-3 flex items-center justify-between sm:hidden">
                        <Button
                            onClick={handleExportGLB}
                            disabled={isExporting || !threeScene}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 flex-1 mx-1"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Export
                        </Button>

                        <Button
                            onClick={handleAddToCart}
                            className="bg-brown hover:bg-terracotta text-white flex items-center gap-2 flex-1 mx-1"
                            size="sm"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Coș
                        </Button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}