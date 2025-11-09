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
    }, [selectedId]);

    // Force re-attach transformer când elementele se schimbă
    useEffect(() => {
        if (transformerRef.current && selectedNodeRef.current) {
            transformerRef.current.nodes([selectedNodeRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [textElements, logoElements]);

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
    }, [textElements, logoElements, background]);

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

    return (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-xl">
            <Stage
                width={800}
                height={600}
                ref={stageRef}
                onMouseDown={handleStageClick}
                onMouseUp={updateCanvas}
                onTouchEnd={updateCanvas}
            >
                <Layer>
                    <Rect x={0} y={0} width={800} height={600} fill={background} />
                </Layer>

                <Layer>
                    {textElements.map(text => (
                        <KonvaText
                            key={text.id}
                            id={text.id}
                            text={text.text}
                            x={text.x}
                            y={text.y}
                            fontSize={text.fontSize}
                            fontFamily={text.fontFamily}
                            fill={text.fill}
                            rotation={text.rotation}
                            scaleX={text.scaleX}
                            scaleY={text.scaleY}
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
                                x={logo.x}
                                y={logo.y}
                                width={logo.width}
                                height={logo.height}
                                rotation={logo.rotation}
                                scaleX={logo.scaleX}
                                scaleY={logo.scaleY}
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
                            nodes={[stageRef.current?.findOne(`#${selectedId}`) as Konva.Node]}
                            onTransformEnd={updateCanvas}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};