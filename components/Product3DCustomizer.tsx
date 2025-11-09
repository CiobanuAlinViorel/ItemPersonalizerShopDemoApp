"use client";

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShoppingCart, Loader2, Maximize2, Minimize2, Trash2, Undo } from 'lucide-react';
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
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [logoElements, setLogoElements] = useState<LogoElement[]>([]);
    const [background, setBackground] = useState('#FFFFFF');
    const [selectedFace, setSelectedFace] = useState('front');
    const [show3DPreview, setShow3DPreview] = useState(true);
    const [is3DExpanded, setIs3DExpanded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [objectColor, setObjectColor] = useState('#FFFFFF');
    const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);

    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);

    // Funcție pentru selectarea texturii
    const handleTextureSelect = (textureUrl: string) => {
        setSelectedTexture(textureUrl);
    };

    const { addItem } = useShoppingCartStore();
    const stageRef = useRef<Konva.Stage>(null);

    const [activeView, setActiveView] = useState<ToolbarView>(null);
    const [editingText, setEditingText] = useState<TextElement | null>(null);

    // Funcție pentru editare text din 2D Editor
    const handleEditTextFrom2D = (text: TextElement) => {
        setEditingText(text);
        setActiveView('text');
    };


    // Salvează starea în istoric
    const saveToHistory = () => {
        const newHistory = editHistory.slice(0, historyIndex + 1);
        newHistory.push({
            textElements: [...textElements],
            logoElements: [...logoElements],
            background
        });
        setEditHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo functionality
    const handleUndo = () => {
        if (historyIndex > 0) {
            const previousState = editHistory[historyIndex - 1];
            setTextElements(previousState.textElements);
            setLogoElements(previousState.logoElements);
            setBackground(previousState.background);
            setHistoryIndex(historyIndex - 1);
        }
    };

    // Delete selected element
    const handleDelete = () => {
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
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDelete();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, historyIndex]);

    // Initialize customization
    useEffect(() => {
        saveToHistory();
    }, []);

    const handleCanvasUpdate = (newCanvas: HTMLCanvasElement) => {
        setCanvas(newCanvas);
    };

    const handleAddText = (text: TextElement) => {
        setTextElements(prev => {
            const newElements = [...prev, text];
            saveToHistory();
            return newElements;
        });
    };

    const handleAddLogo = (logo: LogoElement) => {
        setLogoElements(prev => {
            const newElements = [...prev, logo];
            saveToHistory();
            return newElements;
        });
    };

    const handleChangeBackground = (color: string) => {
        setBackground(color);
        saveToHistory();
    };

    const handleObjectColorChange = (color: string) => {
        setObjectColor(color);
    };

    // Export GLB corect folosind utilitarele
    const handleExportGLB = async () => {
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
    };

    // Export PNG corect
    // const handleExportPNG = async () => {
    //     if (!stageRef.current) {
    //         alert('❌ Editorul nu este încărcat.');
    //         return;
    //     }

    //     setIsExporting(true);
    //     try {
    //         await exportToPNG(stageRef, `design-${product.name}`);
    //         console.log('✅ PNG exportat cu succes!');
    //     } catch (error) {
    //         console.error('❌ Eroare la exportul PNG:', error);
    //         alert('❌ Eroare la exportul PNG. Încercați din nou.');
    //     } finally {
    //         setIsExporting(false);
    //     }
    // };

    // Export ambele formate
    // const handleExportBoth = async () => {
    //     if (!stageRef.current || !threeScene) {
    //         alert('❌ Componentele nu sunt încărcate complet.');
    //         return;
    //     }

    //     setIsExporting(true);
    //     try {
    //         await Promise.all([
    //             exportToPNG(stageRef, `design-${product.name}`),
    //             exportToGLB(threeScene, `custom-${product.name}`)
    //         ]);
    //         console.log('✅ Ambele formate exportate cu succes!');
    //     } catch (error) {
    //         console.error('❌ Eroare la export:', error);
    //         alert('❌ Eroare la export. Încercați din nou.');
    //     } finally {
    //         setIsExporting(false);
    //     }
    // };

    // Add to cart function CORECTĂ
    const handleAddToCart = async () => {
        if (!stageRef.current) {
            alert('❌ Nu există design de salvat.');
            return;
        }

        try {
            // Generează thumbnail pentru coș
            const thumbnail = generateThumbnail(stageRef, 300, 300);

            if (!thumbnail) {
                throw new Error('Nu s-a putut genera thumbnail-ul');
            }

            // Creează configurația de personalizare
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

            // Creează elementul de coș
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

            // Adaugă în coș
            addItem(cartItem);

            // Afișează confirmare și închide
            alert('✅ Produs personalizat adăugat în coș!');
            onClose();

        } catch (error) {
            console.error('❌ Eroare la adăugarea în coș:', error);
            alert('❌ Eroare la adăugarea în coș. Încercați din nou.');
        }
    };

    const handleClose = () => {
        if (textElements.length > 0 || logoElements.length > 0) {
            const confirm = window.confirm('⚠️ Aveți modificări nesalvate. Sigur doriți să închideți?');
            if (!confirm) return;
        }
        onClose();
    };

    const handleEditText = (id: string, updates: Partial<TextElement>) => {
        setTextElements(prev => {
            const newElements = prev.map(el =>
                el.id === id ? { ...el, ...updates } : el
            );
            saveToHistory();
            return newElements;
        });
    };

    const handleDeleteText = (id: string) => {
        setTextElements(prev => {
            const newElements = prev.filter(el => el.id !== id);
            saveToHistory();
            return newElements;
        });
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const handleDeleteLogo = (id: string) => {
        setLogoElements(prev => {
            const newElements = prev.filter(el => el.id !== id);
            saveToHistory();
            return newElements;
        });
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white z-50 flex flex-col"
            >
                {/* Header */}
                <div className="bg-white border-b border-beige px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-brown">{product.name}</h2>
                        <div className="text-sm text-[#737373]">
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.heigth}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Edit Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Undo className="w-4 h-4" />
                                Undo (Ctrl+Z)
                            </Button>

                            <Button
                                onClick={handleDelete}
                                disabled={!selectedId}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 bg-[#F5F2ED] px-4 py-2 rounded-lg">
                            <Label htmlFor="3d-toggle" className="text-sm text-[#737373] cursor-pointer">
                                Live 3D animation
                            </Label>
                            <Switch
                                id="3d-toggle"
                                checked={show3DPreview}
                                onCheckedChange={setShow3DPreview}
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

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Toolbar */}
                    <div className="w-20 bg-[#F5F2ED] border-r border-beige p-2">
                        <CustomizationToolbar
                            selectedFace={selectedFace}
                            onAddText={handleAddText}
                            onAddLogo={handleAddLogo}
                            onChangeBackground={handleChangeBackground}
                            onChangeObjectColor={handleObjectColorChange}
                            textElements={textElements}
                            logoElements={logoElements}
                            onEditText={handleEditText}
                            onDeleteText={handleDeleteText}
                            onDeleteLogo={handleDeleteLogo}
                            activeView={activeView}
                            setActiveView={setActiveView}
                            editingText={editingText}
                            setEditingText={setEditingText}
                            onTextureSelect={handleTextureSelect} // Adaugă această linie
                        />
                    </div>

                    {/* Center: 2D Editor */}
                    <div className="flex-1 bg-[#E5E5E5] flex flex-col">
                        {/* Editor Controls */}
                        <div className="bg-white border-b border-beige px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[#737373]">
                                    Elemente: {textElements.length + logoElements.length}
                                </span>
                                {selectedId && (
                                    <span className="text-sm text-brown font-semibold">
                                        Element selectat • Apasă Delete pentru a șterge
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* <Button
                                    onClick={handleExportPNG}
                                    disabled={isExporting}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Export PNG
                                </Button> */}

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

                                {/* <Button
                                    onClick={handleExportBoth}
                                    disabled={isExporting || !threeScene}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Export Toate
                                </Button> */}

                                <Button
                                    onClick={handleAddToCart}
                                    className="bg-brown hover:bg-terracotta text-white flex items-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Adaugă în Coș
                                </Button>
                            </div>
                        </div>

                        {/* 2D Editor */}
                        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                            <Product2DEditor
                                onCanvasUpdate={handleCanvasUpdate}
                                textElements={textElements}
                                logoElements={logoElements}
                                background={background}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                stageRef={stageRef}
                                onEditText={handleEditTextFrom2D} // Adaugă această linie
                            />
                        </div>
                    </div>

                    {/* Right: 3D Preview */}
                    {show3DPreview && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className={`bg-white border-l border-beige ${is3DExpanded ? 'w-[800px]' : 'w-[400px]'
                                } transition-all duration-300 flex flex-col`}
                        >
                            <div className="p-4 border-b border-beige flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-brown">3D Preview</h3>
                                    <p className="text-xs text-[#737373]">Live rendering</p>
                                </div>
                                <Button
                                    onClick={() => setIs3DExpanded(!is3DExpanded)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#737373]"
                                >
                                    {is3DExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                            </div>

                            <div className="flex-1 p-4 flex items-center justify-center bg-[#F5F2ED]">
                                <ProductPreview3D
                                    canvas={canvas}
                                    width={is3DExpanded ? 750 : 350}
                                    height={is3DExpanded ? 550 : 450}
                                    Model={modelsMapper[product.image3D]}
                                    objectColor={objectColor}
                                    onSceneReady={setThreeScene}
                                    textureUrl={selectedTexture} // Transmite textura către preview
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Bottom Status Bar */}
                <div className="bg-[#F5F2ED] border-t border-beige px-6 py-3 flex items-center justify-between text-xs text-[#737373]">
                    <div className="flex items-center gap-4">
                        <span>Zoom: 100%</span>
                        <span>•</span>
                        <span>Elements: {textElements.length + logoElements.length}</span>
                        <span>•</span>
                        <span>Shortcuts: Ctrl+Z (Undo), Delete (Șterge)</span>
                    </div>
                    <div>
                        {threeScene ? '💾 GLB Ready' : '⏳ Loading 3D...'}
                        • {stageRef.current ? '🎨 Editor Ready' : '⏳ Loading Editor...'}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}