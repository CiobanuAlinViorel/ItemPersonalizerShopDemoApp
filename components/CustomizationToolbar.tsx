import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { COLOR_PALETTE, FONTS } from "./Product3DCustomizer";
import { ImageIcon, Palette, Type, Upload, X, Edit, Trash2 } from "lucide-react";
import { LogoElement, TextElement } from "@/lib/stores/ShoppingCart";
import { useRef, useState, useEffect } from "react";
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
    onTextureSelect: (textureUrl: string) => void; // Adaugă această linie
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
    onTextureSelect
}: CustomizationToolbarProps) => {
    const [textInput, setTextInput] = useState('');
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [fontSize, setFontSize] = useState([24]);
    const [customBackgroundColor, setCustomBackgroundColor] = useState('#FFFFFF');
    const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
    const [textureImages, setTextureImages] = useState<Map<string, HTMLImageElement>>(new Map());

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Texturi predefinite cu URL-uri reale (poți înlocui cu ale tale)


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
    }, []);

    // Efect pentru editare text
    useEffect(() => {
        if (editingText) {
            setTextInput(editingText.text);
            setSelectedFont(editingText.fontFamily);
            setTextColor(editingText.fill);
            setFontSize([editingText.fontSize]);
            setActiveView('text');
        }
    }, [editingText, setActiveView]);

    const handleAddText = () => {
        if (!textInput.trim()) {
            alert('⚠️ Introduceți text înainte de a adăuga!');
            return;
        }

        const newText: TextElement = {
            id: `text-${Date.now()}`,
            text: textInput,
            x: 200,
            y: 200,
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
        setActiveView(null);
    };

    const handleEditText = (text: TextElement) => {
        setEditingText(text);
    };

    const handleSaveEdit = () => {
        if (editingText && textInput.trim()) {
            onEditText(editingText.id, {
                text: textInput,
                fontFamily: selectedFont,
                fill: textColor,
                fontSize: fontSize[0],
            });
            setEditingText(null);
            setTextInput('');
            setActiveView(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingText(null);
        setTextInput('');
        setActiveView(null);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('⚠️ Vă rugăm să încărcați doar imagini');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const maxSize = 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);

                const newLogo: LogoElement = {
                    id: `logo-${Date.now()}`,
                    imageUrl,
                    x: 300,
                    y: 200,
                    width: img.width * scale,
                    height: img.height * scale,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    draggable: true,
                };

                onAddLogo(newLogo);
                setActiveView(null);
            };
            img.src = imageUrl;
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTextureSelect = (texture: typeof TEXTURE_LIBRARY[0]) => {
        setSelectedTexture(texture.id);
        onTextureSelect(texture.url); // Transmite URL-ul texturii
        setActiveView(null);
    };

    const handleBackgroundSelect = (color: string) => {
        onChangeBackground(color);
        setActiveView(null);
    };

    const handleObjectColorSelect = (color: string) => {
        onChangeObjectColor(color);
        setActiveView(null);
    };

    const toolbarButtons = [
        { id: 'text' as ToolbarView, icon: Type, label: 'Text' },
        { id: 'uploads' as ToolbarView, icon: Upload, label: 'Uploads' },
        { id: 'graphics' as ToolbarView, icon: ImageIcon, label: 'Graphics' },
        { id: 'texture' as ToolbarView, icon: Palette, label: 'Texture' },
        { id: 'background' as ToolbarView, icon: Palette, label: 'Background' },
    ];

    return (
        <>
            <div className="flex flex-col gap-2">
                {toolbarButtons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => setActiveView(activeView === btn.id ? null : btn.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${activeView === btn.id
                            ? 'bg-brown text-white shadow-lg'
                            : 'bg-white text-[#737373] hover:bg-[#F5F2ED] border border-beige'
                            }`}
                    >
                        <btn.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{btn.label}</span>
                    </button>
                ))}

                <div className="mt-4 p-3 bg-[#F5F2ED] rounded-lg text-center">
                    <p className="text-xs font-semibold text-brown">Elements</p>
                    <p className="text-lg font-bold text-brown mt-1">
                        {textElements.length + logoElements.length}
                    </p>
                </div>
            </div>

            {activeView && (
                <div className="fixed left-20 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto border-r border-beige">
                    <div className="sticky top-0 bg-brown text-white p-4 flex items-center justify-between z-10">
                        <div>
                            <h3 className="font-bold text-lg">
                                {toolbarButtons.find((b) => b.id === activeView)?.label}
                            </h3>
                            <p className="text-xs opacity-80">
                                {editingText ? 'Editing Text' : 'Complete Texture Mapping'}
                            </p>
                        </div>
                        <button onClick={() => {
                            setActiveView(null);
                            setEditingText(null);
                        }} className="hover:bg-white/20 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {activeView === 'text' && (
                            <>
                                {/* Listă text existent */}
                                {textElements.length > 0 && (
                                    <div className="bg-[#F5F2ED] p-4 rounded-lg">
                                        <h4 className="font-semibold text-brown mb-3">Text existent</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {textElements.map((text) => (
                                                <div key={text.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <span className="text-sm truncate flex-1">{text.text}</span>
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
                                        {editingText ? '✏️ Editati textul selectat' : '🎨 Textura se aplică pe întregul mesh'}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="text-input" className="text-brown font-semibold">
                                        {editingText ? 'Edit text' : 'Add text to design'}
                                    </Label>
                                    <Input
                                        id="text-input"
                                        placeholder="Type your text here..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (editingText ? handleSaveEdit() : handleAddText())}
                                        className="mt-2 border-beige focus:border-brown"
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
                                        max={120}
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
                                        />
                                    </div>
                                </div>

                                {editingText ? (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveEdit}
                                            className="flex-1 bg-green-600 hover:bg-green-700 py-6"
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            onClick={handleCancelEdit}
                                            variant="outline"
                                            className="flex-1 py-6"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleAddText}
                                        className="w-full bg-brown hover:bg-terracotta py-6"
                                    >
                                        Add text to mesh
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

                                <div className="border-2 border-dashed border-beige rounded-xl p-8 text-center bg-[#F5F2ED]">
                                    <Upload className="w-16 h-16 mx-auto mb-4 text-brown" />
                                    <p className="text-[#737373] mb-4">Upload your logo or image</p>
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
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Use PNG with transparency for best results</li>
                                        <li>Recommended size: 500x500px</li>
                                        <li>Max file size: 10MB</li>
                                        <li>Texture maps to entire 3D model</li>
                                    </ul>
                                </div>
                            </>
                        )}

                        {/* {activeView === 'graphics' && (
                            <div className="space-y-6">
                                <div className="bg-[#F5F2ED] p-3 rounded-lg">
                                    <p className="text-xs text-brown font-semibold">
                                        🎨 Graphics library - Aplicați pe întregul mesh
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {TEXTURE_LIBRARY.map((texture) => {
                                        const textureImage = textureImages.get(texture.id);
                                        return (
                                            <button
                                                key={texture.id}
                                                onClick={() => handleTextureSelect(texture)}
                                                className={`aspect-square rounded-lg border-2 hover:scale-105 transition-transform overflow-hidden ${selectedTexture === texture.id ? 'border-brown ring-2 ring-brown' : 'border-beige'
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
                                                        <ImageIcon className="w-6 h-6 text-white/70 mb-1" />
                                                        <span className="text-xs font-medium text-white">{texture.name}</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="text-center py-4">
                                    <p className="text-sm text-[#737373]">More graphics coming soon...</p>
                                </div>
                            </div>
                        )} */}

                        {activeView === 'texture' && (
                            <div className="space-y-6">
                                <div className="bg-[#F5F2ED] p-3 rounded-lg">
                                    <p className="text-xs text-brown font-semibold">
                                        🎨 Aplicați texturi pe obiectul 3D
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {TEXTURE_LIBRARY.map((texture) => {
                                        const textureImage = textureImages.get(texture.id);
                                        return (
                                            <button
                                                key={texture.id}
                                                onClick={() => handleTextureSelect(texture)}
                                                className={`aspect-square rounded-lg border-2 hover:scale-105 transition-transform overflow-hidden ${selectedTexture === texture.id ? 'border-brown ring-2 ring-brown' : 'border-beige'
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
                                                        <Palette className="w-6 h-6 text-white/70 mb-1" />
                                                        <span className="text-xs font-medium text-white">{texture.name}</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="bg-[#F5F2ED] p-4 rounded-lg text-sm text-[#737373] space-y-2">
                                    <p className="font-semibold text-brown">Texture Tips:</p>
                                    <ul className="list-disc list-inside space-y-1">
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
                                    <div className="grid grid-cols-4 gap-3">
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
                                    <div className="grid grid-cols-4 gap-3">
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
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            onClick={() => handleBackgroundSelect(customBackgroundColor)}
                                            className="flex-1 bg-brown hover:bg-terracotta"
                                        >
                                            Aplică fundal
                                        </Button>
                                        <Button
                                            onClick={() => handleObjectColorSelect(customBackgroundColor)}
                                            className="flex-1 bg-brown hover:bg-terracotta"
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