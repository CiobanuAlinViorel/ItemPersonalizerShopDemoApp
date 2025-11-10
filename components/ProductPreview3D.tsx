import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SceneExporter } from "./SceneExporter";
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

interface ProductPreview3DProps {
    canvas: HTMLCanvasElement | null;
    width?: number | string;
    height?: number | string;
    Model: React.FC<any>;
    objectColor?: string;
    onSceneReady?: (scene: THREE.Scene) => void;
    textureUrl?: string | null;
}

export const ProductPreview3D = ({
    canvas,
    width = "100%",
    height = "100%",
    Model,
    objectColor = "#FFFFFF",
    onSceneReady,
    textureUrl
}: ProductPreview3DProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 350, height: 450 });
    const [isMobile, setIsMobile] = useState(false);

    // Actualizează dimensiunile în funcție de container
    const updateDimensions = () => {
        if (containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Detectează dispozitivul mobil
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            setDimensions({
                width: containerWidth,
                height: containerHeight
            });
        }
    };

    // Resize observer și event listeners
    useEffect(() => {
        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateDimensions);
        window.addEventListener('orientationchange', updateDimensions);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDimensions);
            window.removeEventListener('orientationchange', updateDimensions);
        };
    }, []);

    // Ajustează camera pentru diferite dimensiuni
    const getCameraConfig = () => {
        if (isMobile) {
            return { position: [3, 2, 4] as [number, number, number], fov: 50 };
        }

        const aspectRatio = dimensions.width / dimensions.height;
        if (aspectRatio > 1.5) {
            // Landscape
            return { position: [5, 3, 7] as [number, number, number], fov: 45 };
        } else if (aspectRatio < 0.8) {
            // Portrait îngust
            return { position: [3, 2, 4] as [number, number, number], fov: 40 };
        }

        // Default
        return { position: [4, 3, 6] as [number, number, number], fov: 45 };
    };

    const cameraConfig = getCameraConfig();

    return (
        <div
            ref={containerRef}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height
            }}
            className="relative border border-gray-300 rounded-lg bg-[#F5F2ED] overflow-hidden w-full h-full min-h-[300px] sm:min-h-[400px]"
        >
            {/* Loading indicator pentru performanță */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#F5F2ED] z-10 transition-opacity duration-300 opacity-0 pointer-events-none" id="canvas-loader">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>

            <Canvas
                camera={cameraConfig}
                style={{
                    width: '100%',
                    height: '100%'
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance"
                }}
                onCreated={({ gl }) => {
                    // Optimizări pentru performanță pe dispozitive mobile
                    if (isMobile) {
                        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                    } else {
                        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    }

                    // Ascunde loader-ul
                    const loader = document.getElementById('canvas-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => {
                            loader.style.display = 'none';
                        }, 300);
                    }
                }}
            >
                <color attach="background" args={["#F5F2ED"]} />

                {/* Lighting adaptiv */}
                <ambientLight intensity={isMobile ? 0.7 : 0.6} />
                <directionalLight
                    position={isMobile ? [8, 8, 4] : [10, 10, 5]}
                    intensity={isMobile ? 1 : 0.8}
                />
                <pointLight
                    position={[0, 5, 0]}
                    intensity={isMobile ? 0.3 : 0.4}
                />

                {/* Model principal */}
                <Model
                    canvas={canvas}
                    objectColor={objectColor}
                    textureUrl={textureUrl}
                    isMobile={isMobile}
                />

                {onSceneReady && <SceneExporter onSceneReady={onSceneReady} />}

                {/* Controls adaptiv */}
                <OrbitControls
                    enablePan={!isMobile}
                    enableZoom={true}
                    maxDistance={isMobile ? 8 : 12}
                    minDistance={isMobile ? 2 : 3}
                    enableDamping={true}
                    dampingFactor={0.05}
                    rotateSpeed={isMobile ? 0.5 : 0.7}
                    zoomSpeed={isMobile ? 0.8 : 1}
                />

                {/* Environment optimizat */}
                <Environment
                    preset="city"
                    background={false} // Dezactivează background-ul environment pentru performanță
                />
            </Canvas>

            {/* Overlay informativ pentru mobile */}
            {isMobile && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
                    ←→ Rotire • ↔ Zoom
                </div>
            )}

            {/* Indicator de dimensiune pentru debugging (opțional) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {Math.round(dimensions.width)}×{Math.round(dimensions.height)}
                    {isMobile && ' 📱'}
                </div>
            )}
        </div>
    );
};