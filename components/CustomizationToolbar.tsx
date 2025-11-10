import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { COLOR_PALETTE, FONTS } from "./Product3DCustomizer";
import { ImageIcon, Palette, Type, Upload, X, Edit, Trash2, Keyboard } from "lucide-react";
import { LogoElement, TextElement } from "@/lib/stores/ShoppingCart";
import { useRef, useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "@radix-ui/react-slider";
import { TEXTURE_LIBRARY } from "@/lib/utils/Textures";

export type ToolbarView = 'text' | 'uploads' | 'graphics' | 'background' | 'texture' | null;

interface CustomizationToolbarProps {
    selectedFace: string;
    onAddText: (text: TextElement) => void;
    onAddLogo: (logo: LogoElement) => void;
    onChangeBackground: (color: string) => void;
    onChangeObjectColor: (color: string) => void;
    textElements: TextElement[];
    logoElements: LogoElement[];
    onEditText: (id: string, updates: Partial<TextElement>) => void;
    onDeleteText: (id: string) => void;
    onDeleteLogo: (id: string) => void;
    activeView: ToolbarView;
    setActiveView: (view: ToolbarView) => void;
    editingText: TextElement | null;
    setEditingText: (text: TextElement | null) => void;
    onTextureSelect: (textureUrl: string) => void;
    isMobile?: boolean;
    onClosePanel?: () => void;
}

export const CustomizationToolbar = ({
    onAddText,
    onAddLogo,
    onChangeBackground,
    onChangeObjectColor,
    textElements,
    logoElements,
    onEditText,
    onDeleteText,
    onDeleteLogo,
    activeView,
    setActiveView,
    editingText,
    setEditingText,
    onTextureSelect,
    isMobile = false,
    onClosePanel
}: CustomizationToolbarProps) => {
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // State-uri pentru input-uri
    const [textInput, setTextInput] = useState('');
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [fontSize, setFontSize] = useState([24]);
    const [customBackgroundColor, setCustomBackgroundColor] = useState('#FFFFFF');

    // State-uri pentru texturi și UI
    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
    const [textureImages, setTextureImages] = useState<Map<string, HTMLImageElement>>(new Map());
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Detectare keyboard virtual
    useEffect(() => {
        if (!isMobile) return;

        const handleResize = () => {
            // Pe mobile, când keyboard-ul apare, window.innerHeight scade
            const isKeyboardOpen = window.innerHeight < window.outerHeight * 0.8;
            setIsKeyboardVisible(isKeyboardOpen);

            if (isKeyboardOpen && panelRef.current) {
                // Asigură-te că panoul rămâne vizibil
                panelRef.current.style.height = '100vh';
                panelRef.current.style.overflowY = 'auto';

                // Scroll la input-ul activ
                setTimeout(() => {
                    textInputRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // Auto-focus și gestionare panou când se deschide view-ul de text
    useEffect(() => {
        if (activeView === 'text' && isMobile && textInputRef.current) {
            // Delay pentru a permite animației să se termine
            setTimeout(() => {
                textInputRef.current?.focus({ preventScroll: true });

                // Asigură-te că panoul este deschis corect
                if (panelRef.current) {
                    panelRef.current.style.height = '100vh';
                    panelRef.current.style.overflowY = 'auto';
                }
            }, 350);
        }
    }, [activeView, isMobile]);

    // Efect pentru editare text
    useEffect(() => {
        if (editingText) {
            setTextInput(editingText.text);
            setSelectedFont(editingText.fontFamily);
            setTextColor(editingText.fill);
            setFontSize([editingText.fontSize]);

            // Pe mobile, asigură-te că panoul de text este deschis
            if (isMobile && activeView !== 'text') {
                setTimeout(() => {
                    setActiveView('text');
                }, 100);
            }
        }
    }, [editingText, isMobile, activeView, setActiveView]);

    // Încarcă imaginile texturilor
    useEffect(() => {
        TEXTURE_LIBRARY.forEach(texture => {
            if (!textureImages.has(texture.id)) {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    setTextureImages(prev => new Map(prev).set(texture.id, img));
                };
                img.src = texture.url;
            }
        });
    }, [textureImages]);

    // Handler pentru închidere panou cu gestionare keyboard
    const handleClosePanel = useCallback(() => {
        // Ascunde keyboard-ul virtual mai întâi
        if (isMobile && (document.activeElement instanceof HTMLElement)) {
            document.activeElement.blur();
        }

        // Așteaptă puțin pentru ca keyboard-ul să dispară
        setTimeout(() => {
            onClosePanel?.();
        }, 300);
    }, [isMobile, onClosePanel]);

    // Handler pentru adăugare text
    const handleAddText = useCallback(() => {
        if (!textInput.trim()) {
            alert('⚠️ Introduceți text înainte de a adăuga!');
            textInputRef.current?.focus();
            return;
        }

        const newText: TextElement = {
            id: `text-${Date.now()}`,
            text: textInput,
            x: isMobile ? 100 : 200,
            y: isMobile ? 150 : 200,
            fontSize: fontSize[0],
            fontFamily: selectedFont,
            fill: textColor,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            draggable: true,
        };

        onAddText(newText);
        setTextInput('');

        // Pe mobile, păstrează panoul deschis dar resetează input-ul
        if (isMobile) {
            // Nu închide panoul, doar resetează și focus din nou
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 100);
        } else {
            handleClosePanel();
        }
    }, [textInput, fontSize, selectedFont, textColor, isMobile, onAddText, handleClosePanel]);

    // Handler pentru editare text
    const handleEditText = useCallback((text: TextElement) => {
        setEditingText(text);
        if (activeView !== 'text') {
            setActiveView('text');
        }
    }, [activeView, setActiveView, setEditingText]);

    // Handler pentru salvare editare
    const handleSaveEdit = useCallback(() => {
        if (editingText && textInput.trim()) {
            onEditText(editingText.id, {
                text: textInput,
                fontFamily: selectedFont,
                fill: textColor,
                fontSize: fontSize[0],
            });
            setEditingText(null);
            setTextInput('');

            // Pe mobile, închide keyboard-ul dar NU panoul imediat
            if (isMobile) {
                textInputRef.current?.blur();
                // Lasă utilizatorul să vadă confirmarea, închide panoul după delay
                setTimeout(() => {
                    handleClosePanel();
                }, 1500);
            } else {
                handleClosePanel();
            }
        }
    }, [editingText, textInput, selectedFont, textColor, fontSize, isMobile, onEditText, handleClosePanel]);

    // Handler pentru anulare editare
    const handleCancelEdit = useCallback(() => {
        setEditingText(null);
        setTextInput('');

        if (isMobile) {
            // Închide keyboard-ul mai întâi
            textInputRef.current?.blur();
            // Apoi închide panoul
            setTimeout(() => {
                handleClosePanel();
            }, 300);
        } else {
            handleClosePanel();
        }
    }, [isMobile, handleClosePanel]);

    // Handler pentru upload logo
    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('⚠️ Vă rugăm să încărcați doar imagini');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ Fișierul este prea mare. Dimensiunea maximă este 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const maxSize = isMobile ? 150 : 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);

                const newLogo: LogoElement = {
                    id: `logo-${Date.now()}`,
                    imageUrl,
                    x: isMobile ? 150 : 300,
                    y: isMobile ? 150 : 200,
                    width: img.width * scale,
                    height: img.height * scale,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    draggable: true,
                };

                onAddLogo(newLogo);

                if (!isMobile) {
                    handleClosePanel();
                }
            };
            img.src = imageUrl;
        };

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        reader.readAsDataURL(file);
    }, [isMobile, onAddLogo, handleClosePanel]);

    // Handler pentru selectare textură
    const handleTextureSelect = useCallback((texture: typeof TEXTURE_LIBRARY[0]) => {
        setSelectedTexture(texture.id);
        onTextureSelect(texture.url);

        if (!isMobile) {
            handleClosePanel();
        }
    }, [isMobile, onTextureSelect, handleClosePanel]);

    // Handler pentru selectare fundal
    const handleBackgroundSelect = useCallback((color: string) => {
        onChangeBackground(color);

        if (!isMobile) {
            handleClosePanel();
        }
    }, [isMobile, onChangeBackground, handleClosePanel]);

    // Handler pentru selectare culoare obiect
    const handleObjectColorSelect = useCallback((color: string) => {
        onChangeObjectColor(color);

        if (!isMobile) {
            handleClosePanel();
        }
    }, [isMobile, onChangeObjectColor, handleClosePanel]);

    // Handler pentru tastele de input
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previne comportamentul default
            if (editingText) {
                handleSaveEdit();
            } else {
                handleAddText();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (editingText) {
                handleCancelEdit();
            } else if (isMobile) {
                handleClosePanel();
            }
        }
    }, [editingText, handleSaveEdit, handleAddText, handleCancelEdit, isMobile, handleClosePanel]);

    // Butoanele toolbar-ului
    const toolbarButtons = [
        { id: 'text' as ToolbarView, icon: Type, label: 'Text' },
        { id: 'uploads' as ToolbarView, icon: Upload, label: 'Uploads' },
        { id: 'graphics' as ToolbarView, icon: ImageIcon, label: 'Graphics' },
        { id: 'texture' as ToolbarView, icon: Palette, label: 'Texture' },
        { id: 'background' as ToolbarView, icon: Palette, label: 'Background' },
    ];

    const getGridCols = useCallback(() => {
        return isMobile ? "grid-cols-3" : "grid-cols-4";
    }, [isMobile]);

    const getTextureGridCols = useCallback(() => {
        return isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
    }, [isMobile]);

    // Handler pentru aplicare culoare personalizată
    const handleApplyCustomBackground = useCallback(() => {
        onChangeBackground(customBackgroundColor);
    }, [customBackgroundColor, onChangeBackground]);

    const handleApplyCustomObjectColor = useCallback(() => {
        onChangeObjectColor(customBackgroundColor);
    }, [customBackgroundColor, onChangeObjectColor]);

    return (
        <>
            {/* Toolbar Principal */}
            <div className={`flex gap-2 ${isMobile ? 'flex-row overflow-x-auto pb-2 px-2' : 'flex-col'}`}>
                {toolbarButtons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => setActiveView(btn.id)}
                        className={`flex items-center justify-center transition-all ${activeView === btn.id
                            ? 'bg-brown text-white shadow-lg'
                            : 'bg-white text-[#737373] hover:bg-[#F5F2ED] border border-beige'
                            } ${isMobile
                                ? 'shrink-0 p-3 rounded-lg min-w-[70px]'
                                : 'flex-col p-4 rounded-lg w-full'
                            }`}
                    >
                        <btn.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 mb-1'}`} />
                        <span className={`font-medium ${isMobile ? 'text-xs mt-1' : 'text-xs'}`}>
                            {btn.label}
                        </span>
                    </button>
                ))}

                {!isMobile && (
                    <div className="mt-4 p-3 bg-[#F5F2ED] rounded-lg text-center">
                        <p className="text-xs font-semibold text-brown">Elements</p>
                        <p className="text-lg font-bold text-brown mt-1">
                            {textElements.length + logoElements.length}
                        </p>
                    </div>
                )}
            </div>

            {isMobile && (
                <div className="px-2 py-3 bg-[#F5F2ED] rounded-lg text-center mx-2 mt-2">
                    <p className="text-xs font-semibold text-brown">
                        Elements: {textElements.length + logoElements.length}
                        {isKeyboardVisible && (
                            <span className="ml-2 text-green-600 flex items-center justify-center gap-1">
                                <Keyboard className="w-3 h-3" />
                                Keyboard open
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Panou lateral - CU REF PENTRU GESTIONARE KEYBOARD */}
            {activeView && (
                <div
                    ref={panelRef}
                    className={`
                        fixed bg-white shadow-2xl z-50 overflow-y-auto border-beige
                        ${isMobile
                            ? 'inset-0 w-full h-full'
                            : 'left-20 top-0 bottom-0 w-80 border-r'
                        }
                        ${isKeyboardVisible ? 'keyboard-open' : ''}
                    `}
                    style={
                        isMobile ?
                            {
                                height: '100vh',
                                overflowY: 'auto',
                                position: 'fixed',
                                top: 0,
                                left: 0
                            } :
                            {}
                    }
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-brown text-white p-4 flex items-center justify-between z-10">
                        <div>
                            <h3 className="font-bold text-lg">
                                {toolbarButtons.find((b) => b.id === activeView)?.label}
                                {editingText && " - Editare"}
                            </h3>
                            <p className="text-xs opacity-80">
                                {editingText ? 'Editati textul selectat' : 'Personalizați produsul'}
                            </p>
                        </div>
                        <button
                            onClick={handleClosePanel}
                            className="hover:bg-white/20 p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Conținut */}
                    <div
                        className={`space-y-6 ${isMobile ? 'p-4 pb-32' : 'p-6'} overflow-y-auto`}
                        style={
                            isMobile ?
                                {
                                    minHeight: 'calc(100vh - 80px)',
                                    paddingBottom: '200px' // Spațiu extra pentru keyboard
                                } :
                                { maxHeight: 'calc(100vh - 80px)' }
                        }
                    >
                        {activeView === 'text' && (
                            <>
                                {/* Listă text existent */}
                                {textElements.length > 0 && (
                                    <div className="bg-[#F5F2ED] p-4 rounded-lg">
                                        <h4 className="font-semibold text-brown mb-3">Text existent</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {textElements.map((text) => (
                                                <div key={text.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <span className="text-sm truncate flex-1" style={{ fontFamily: text.fontFamily }}>
                                                        {text.text}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditText(text)}
                                                            className="p-1 hover:bg-[#F5F2ED] rounded"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteText(text.id)}
                                                            className="p-1 hover:bg-red-50 rounded text-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-[#F5F2ED] p-3 rounded-lg">
                                    <p className="text-xs text-brown font-semibold">
                                        {editingText ? '✏️ Editati textul selectat' : '🎨 Adăugați text pe design'}
                                        {isMobile && (
                                            <span className="block text-green-600 mt-1">
                                                💡 Tasta Enter pentru a salva, Escape pentru a anula
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="text-input" className="text-brown font-semibold">
                                        {editingText ? 'Edit text' : 'Add text to design'}
                                    </Label>
                                    <Input
                                        ref={textInputRef}
                                        id="text-input"
                                        placeholder="Scrieți textul aici..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="mt-2 border-beige focus:border-brown text-base" // text-base pentru mărime mai bună pe mobile
                                        // Atribute pentru mobile
                                        inputMode="text"
                                        autoComplete="off"
                                        autoCorrect="on"
                                        autoCapitalize="sentences"
                                        enterKeyHint={editingText ? "done" : "go"}
                                    />
                                </div>

                                <div>
                                    <Label className="text-brown font-semibold">Font family</Label>
                                    <Select value={selectedFont} onValueChange={setSelectedFont}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FONTS.map((font) => (
                                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                    {font}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-brown font-semibold">
                                        Font size: {fontSize[0]}px
                                    </Label>
                                    <Slider
                                        value={fontSize}
                                        onValueChange={setFontSize}
                                        min={12}
                                        max={isMobile ? 80 : 120}
                                        step={2}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label className="text-brown font-semibold">Text color</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="w-16 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="flex-1"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>

                                {editingText ? (
                                    <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                                        <Button
                                            onClick={handleSaveEdit}
                                            className={`${isMobile ? 'w-full' : 'flex-1'} bg-green-600 hover:bg-green-700 py-3`}
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            onClick={handleCancelEdit}
                                            variant="outline"
                                            className={`${isMobile ? 'w-full' : 'flex-1'} py-3`}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleAddText}
                                        className="w-full bg-brown hover:bg-terracotta py-3"
                                    >
                                        Add text to design
                                    </Button>
                                )}
                            </>
                        )}

                        {activeView === 'uploads' && (
                            <>
                                {/* Listă logo-uri existente */}
                                {logoElements.length > 0 && (
                                    <div className="bg-[#F5F2ED] p-4 rounded-lg">
                                        <h4 className="font-semibold text-brown mb-3">Logo-uri existente</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {logoElements.map((logo) => (
                                                <div key={logo.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <span className="text-sm truncate flex-1">Logo {logo.id}</span>
                                                    <button
                                                        onClick={() => onDeleteLogo(logo.id)}
                                                        className="p-1 hover:bg-red-50 rounded text-red-600"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-[#F5F2ED] p-3 rounded-lg">
                                    <p className="text-xs text-brown font-semibold">
                                        🎨 Logo-ul se mapează pe întregul mesh
                                    </p>
                                </div>

                                <div className="border-2 border-dashed border-beige rounded-xl p-4 sm:p-8 text-center bg-[#F5F2ED]">
                                    <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-brown" />
                                    <p className="text-[#737373] mb-3 sm:mb-4 text-sm sm:text-base">Upload your logo or image</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-brown hover:bg-terracotta"
                                    >
                                        Choose file
                                    </Button>
                                </div>

                                <div className="bg-[#F5F2ED] p-4 rounded-lg text-sm text-[#737373] space-y-2">
                                    <p className="font-semibold text-brown">Tips:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                                        <li>Use PNG with transparency for best results</li>
                                        <li>Recommended size: 500x500px</li>
                                        <li>Max file size: 10MB</li>
                                        <li>Texture maps to entire 3D model</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeView === 'texture' && (
                            <div className="space-y-6">
                                <div className="bg-[#F5F2ED] p-3 rounded-lg">
                                    <p className="text-xs text-brown font-semibold">
                                        🎨 Aplicați texturi pe obiectul 3D
                                    </p>
                                </div>

                                <div className={`grid ${getTextureGridCols()} gap-3 sm:gap-4`}>
                                    {TEXTURE_LIBRARY.map((texture) => {
                                        const textureImage = textureImages.get(texture.id);
                                        return (
                                            <button
                                                key={texture.id}
                                                onClick={() => handleTextureSelect(texture)}
                                                className={`aspect-square rounded-lg border-2 hover:scale-105 transition-transform overflow-hidden ${selectedTexture === texture.id
                                                    ? 'border-brown ring-2 ring-brown'
                                                    : 'border-beige'
                                                    }`}
                                            >
                                                {textureImage ? (
                                                    <img
                                                        src={texture.url}
                                                        alt={texture.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex flex-col items-center justify-center p-2"
                                                        style={{ backgroundColor: texture.color }}
                                                    >
                                                        <Palette className="w-4 h-4 sm:w-6 sm:h-6 text-white/70 mb-1" />
                                                        <span className="text-xs font-medium text-white text-center">
                                                            {texture.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="bg-[#F5F2ED] p-4 rounded-lg text-sm text-[#737373] space-y-2">
                                    <p className="font-semibold text-brown">Texture Tips:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                                        <li>Textures apply to the entire 3D object</li>
                                        <li>High-resolution textures recommended</li>
                                        <li>Seamless textures work best</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeView === 'background' && (
                            <>
                                <div>
                                    <Label className="text-brown font-semibold mb-3 block">
                                        Culoare fundal
                                    </Label>
                                    <div className={`grid ${getGridCols()} gap-2 sm:gap-3`}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => handleBackgroundSelect(color)}
                                                className="aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: '#E8D9C3'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-brown font-semibold mb-3 block">
                                        Culoare obiect 3D
                                    </Label>
                                    <div className={`grid ${getGridCols()} gap-2 sm:gap-3`}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`obj-${color}`}
                                                onClick={() => handleObjectColorSelect(color)}
                                                className="aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: '#E8D9C3'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-brown font-semibold">Culoare personalizată</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            type="color"
                                            value={customBackgroundColor}
                                            onChange={(e) => setCustomBackgroundColor(e.target.value)}
                                            className="w-16 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={customBackgroundColor}
                                            onChange={(e) => setCustomBackgroundColor(e.target.value)}
                                            className="flex-1"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                    <div className={`flex gap-2 mt-2 ${isMobile ? 'flex-col' : ''}`}>
                                        <Button
                                            onClick={handleApplyCustomBackground}
                                            className={`${isMobile ? 'w-full' : 'flex-1'} bg-brown hover:bg-terracotta`}
                                        >
                                            Aplică fundal
                                        </Button>
                                        <Button
                                            onClick={handleApplyCustomObjectColor}
                                            className={`${isMobile ? 'w-full' : 'flex-1'} bg-brown hover:bg-terracotta`}
                                        >
                                            Aplică obiect
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};