import { LogoElement, TextElement } from "@/lib/stores/ShoppingCart";
import { useEffect, useRef, useState } from "react";
import Konva from 'konva';
import { Stage, Layer, Rect, Text as KonvaText, Image as KonvaImage, Transformer } from 'react-konva';

interface Product2DEditorProps {
    onCanvasUpdate: (canvas: HTMLCanvasElement) => void;
    textElements: TextElement[];
    logoElements: LogoElement[];
    background: string;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    stageRef: any
    onEditText: (text: TextElement) => void;
}

export const Product2DEditor = ({
    onCanvasUpdate,
    textElements,
    logoElements,
    background,
    selectedId,
    onSelect,
    stageRef,
    onEditText
}: Product2DEditorProps) => {
    const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());
    const transformerRef = useRef<Konva.Transformer>(null);
    const selectedNodeRef = useRef<Konva.Node | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(1);

    // Dimensiuni originale ale canvas-ului (pentru calcularea scale-ului)
    const originalWidth = 800;
    const originalHeight = 600;

    // Actualizează dimensiunile stage-ului în funcție de container
    const updateStageSize = () => {
        if (containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Calculează scale-ul pentru a păstra aspect ratio-ul
            const scaleX = containerWidth / originalWidth;
            const scaleY = containerHeight / originalHeight;
            const newScale = Math.min(scaleX, scaleY, 1); // Nu scale up peste 100%

            setScale(newScale);

            const newWidth = originalWidth * newScale;
            const newHeight = originalHeight * newScale;

            setStageSize({
                width: newWidth,
                height: newHeight
            });

            // Force re-draw după resize
            setTimeout(updateCanvas, 100);
        }
    };

    // Resize observer pentru a detecta schimbări în dimensiunea containerului
    useEffect(() => {
        updateStageSize();

        const resizeObserver = new ResizeObserver(updateStageSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Resize la window resize
        window.addEventListener('resize', updateStageSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateStageSize);
        };
    }, []);

    // Sync transformer cu selected node
    useEffect(() => {
        if (!transformerRef.current || !stageRef.current) return;

        const transformer = transformerRef.current;
        const stage = stageRef.current;

        if (selectedId) {
            const node = stage.findOne(`#${selectedId}`);
            selectedNodeRef.current = node;

            if (node) {
                transformer.nodes([node]);
                transformer.getLayer()?.batchDraw();
            } else {
                transformer.nodes([]);
            }
        } else {
            transformer.nodes([]);
            selectedNodeRef.current = null;
        }

        transformer.getLayer()?.batchDraw();
    }, [selectedId, scale]); // Adăugăm scale în dependencies

    // Force re-attach transformer când elementele se schimbă
    useEffect(() => {
        if (transformerRef.current && selectedNodeRef.current) {
            transformerRef.current.nodes([selectedNodeRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [textElements, logoElements, scale]);

    // Încarcă imaginile pentru logo-uri
    useEffect(() => {
        logoElements.forEach(logo => {
            if (!images.has(logo.id)) {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    setImages(prev => new Map(prev).set(logo.id, img));
                    updateCanvas();
                };
                img.src = logo.imageUrl;
            }
        });
    }, [logoElements]);

    // Actualizează canvas-ul
    const updateCanvas = () => {
        if (stageRef.current) {
            requestAnimationFrame(() => {
                const canvas = stageRef.current?.toCanvas({
                    pixelRatio: 2
                });
                if (canvas) {
                    onCanvasUpdate(canvas);
                }
            });
        }
    };

    // Actualizează când se schimbă elementele
    useEffect(() => {
        updateCanvas();
    }, [textElements, logoElements, background, scale]);

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            onSelect(null);
            return;
        }
    };

    // Handler pentru dublu-click pe text
    const handleTextDoubleClick = (text: TextElement) => {
        onEditText(text);
    };

    // Ajustează coordonatele și dimensiunile pentru scalare
    const getScaledValue = (value: number) => value * scale;

    return (
        <div
            ref={containerRef}
            className="w-full h-full max-w-full max-h-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-xl flex items-center justify-center bg-gray-50"
            style={{ minHeight: '300px' }} // Înălțime minimă pentru mobile
        >
            {/* Container pentru stage cu dimensiuni dinamice */}
            <div
                className="flex items-center justify-center"
                style={{
                    width: `${stageSize.width}px`,
                    height: `${stageSize.height}px`,
                    transform: `scale(${scale})`
                }}
            >
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    ref={stageRef}
                    onMouseDown={handleStageClick}
                    onMouseUp={updateCanvas}
                    onTouchEnd={updateCanvas}
                    scaleX={scale}
                    scaleY={scale}
                >
                    <Layer>
                        {/* Background scalat corect */}
                        <Rect
                            x={0}
                            y={0}
                            width={originalWidth}
                            height={originalHeight}
                            fill={background}
                        />
                    </Layer>

                    <Layer>
                        {textElements.map(text => (
                            <KonvaText
                                key={text.id}
                                id={text.id}
                                text={text.text}
                                x={getScaledValue(text.x)}
                                y={getScaledValue(text.y)}
                                fontSize={getScaledValue(text.fontSize)}
                                fontFamily={text.fontFamily}
                                fill={text.fill}
                                rotation={text.rotation}
                                scaleX={text.scaleX || 1}
                                scaleY={text.scaleY || 1}
                                draggable={text.draggable}
                                onClick={() => {
                                    onSelect(text.id);
                                }}
                                onTap={() => {
                                    onSelect(text.id);
                                }}
                                onDblClick={() => handleTextDoubleClick(text)}
                                onDblTap={() => handleTextDoubleClick(text)}
                                onDragEnd={updateCanvas}
                                onTransformEnd={updateCanvas}
                            />
                        ))}

                        {logoElements.map(logo => {
                            const image = images.get(logo.id);
                            if (!image) return null;

                            return (
                                <KonvaImage
                                    key={logo.id}
                                    id={logo.id}
                                    image={image}
                                    x={getScaledValue(logo.x)}
                                    y={getScaledValue(logo.y)}
                                    width={getScaledValue(logo.width)}
                                    height={getScaledValue(logo.height)}
                                    rotation={logo.rotation}
                                    scaleX={logo.scaleX || 1}
                                    scaleY={logo.scaleY || 1}
                                    draggable={logo.draggable}
                                    onClick={() => {
                                        onSelect(logo.id);
                                    }}
                                    onTap={() => {
                                        onSelect(logo.id);
                                    }}
                                    onDragEnd={updateCanvas}
                                    onTransformEnd={updateCanvas}
                                />
                            );
                        })}

                        {selectedId && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limitează dimensiun
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                                onTransformEnd={updateCanvas}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {/* Indicator de scalare pentru debugging (opțional) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Scale: {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    );
};