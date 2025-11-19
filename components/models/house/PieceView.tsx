'use client';

import { SceneExporter } from '@/components/SceneExporter';
import { PuzzlePiece } from '@/lib/collection/puzzle'
import { loadGLBOnCenter } from '@/lib/utils/glbLoader';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';

type IPieceView = {
    piece: PuzzlePiece,
    isMobile: boolean,
    priority?: 'performance' | 'balanced' | 'quality',
    isVisible?: boolean
}

// Helper function pentru a obține devicePixelRatio în mod safe
const getSafeDevicePixelRatio = (maxRatio: number = 2): number => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, maxRatio);
};

// Component pentru managementul calității
const QualityManager = ({
    quality,
    isMobile
}: {
    quality: 'low' | 'medium' | 'high',
    isMobile: boolean
}) => {
    const { gl } = useThree();

    useEffect(() => {
        switch (quality) {
            case 'high':
                gl.setPixelRatio(getSafeDevicePixelRatio(2));
                break;
            case 'medium':
                gl.setPixelRatio(getSafeDevicePixelRatio(1.5));
                break;
            case 'low':
            default:
                gl.setPixelRatio(getSafeDevicePixelRatio(isMobile ? 1 : 1.2));
                break;
        }
    }, [quality, isMobile, gl]);

    return null;
};

// Componentă simplă pentru environment
const SimpleEnvironment = () => {
    return (
        <>
            <color attach="background" args={["#F8FAFC"]} />
            <Environment preset="apartment" background={false} environmentIntensity={0.6} />
        </>
    );
};

// Memoized component to prevent unnecessary re-renders
const PieceView = React.memo(({
    piece,
    isMobile,
    priority = 'balanced',
    isVisible = true
}: IPieceView) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);
    const [model3D, setModel3D] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [adaptiveQuality, setAdaptiveQuality] = useState<'low' | 'medium' | 'high'>('medium');

    // Calitate adaptivă bazată pe context
    useEffect(() => {
        let quality: 'low' | 'medium' | 'high' = 'medium';

        if (priority === 'performance') {
            quality = 'low';
        } else if (priority === 'quality') {
            quality = 'high';
        } else {
            quality = isMobile ? 'medium' : 'high';
        }

        setAdaptiveQuality(quality);
    }, [isVisible, isMobile, priority]);

    // Configurație calitate
    const qualityConfig = useMemo(() => {
        const configs = {
            high: {
                antialias: true,
                pixelRatio: getSafeDevicePixelRatio(2),
                toneMappingExposure: 1.0
            },
            medium: {
                antialias: true,
                pixelRatio: getSafeDevicePixelRatio(1.5),
                toneMappingExposure: 0.9
            },
            low: {
                antialias: false,
                pixelRatio: getSafeDevicePixelRatio(1),
                toneMappingExposure: 0.8
            }
        };

        return configs[adaptiveQuality];
    }, [adaptiveQuality]);

    // Configurație cameră
    const cameraConfig = useMemo(() => ({
        position: [3, 2, 4] as [number, number, number],
        fov: 50,
        near: 0.1,
        far: 100
    }), []);

    // Configurație scală și poziție
    const scale = useMemo(() => 0.3, []);
    const position = useMemo(() => [0, 0, 0] as [number, number, number], []);

    // Funcție de încărcare model
    const load3DComponent = useCallback(async (component: string) => {
        if (!isVisible) return;

        setIsLoading(true);
        setLoadError(null);

        try {
            const model = await loadGLBOnCenter(component);
            if (model) {
                setModel3D(model);

                // Debug: verifică materialele
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        console.log(`Mesh: ${child.name}, Material:`, child.material);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading 3D model:', error);
            setLoadError(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [isVisible]);

    // Încarcă modelul când se schimbă piesa sau vizibilitatea
    useEffect(() => {
        if (piece.glb && isVisible) {
            load3DComponent(piece.glb);
        } else {
            setModel3D(null);
            setIsLoading(false);
        }
    }, [piece.glb, isVisible, load3DComponent]);

    // Configurație scenă
    const sceneConfig = useMemo(() => ({
        gl: {
            antialias: qualityConfig.antialias,
            alpha: true,
            powerPreference: "high-performance" as const,
        },
        onCreated: ({ gl }: { gl: THREE.WebGLRenderer }) => {
            gl.setPixelRatio(qualityConfig.pixelRatio);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = qualityConfig.toneMappingExposure;
        }
    }), [qualityConfig]);

    // Configurație controale
    const controlsConfig = useMemo(() => ({
        enablePan: !isMobile,
        enableZoom: true,
        maxDistance: 8,
        minDistance: 1,
        enableDamping: true,
        dampingFactor: 0.01,
        rotateSpeed: 1.2,
        zoomSpeed: 1,
    }), [isMobile]);

    // Grup model
    const modelGroup = useMemo(() => {
        if (!model3D || !isVisible) return null;

        return (
            <group position={position} scale={scale}>
                <primitive object={model3D} />
            </group>
        );
    }, [model3D, position, scale, isVisible]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (model3D) {
                model3D.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };
    }, [model3D]);

    // Dacă nu este vizibil
    if (!isVisible) {
        return (
            <div
                className="relative w-[100vh] h-[100vh] border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center my-4"
            >
                <p className="text-gray-500 text-sm">Preview 3D indisponibil</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full border border-gray-300 rounded-lg bg-white my-4 overflow-hidden"
        >
            {/* Loading indicator */}
            {(isLoading || loadError) && (
                <div
                    className={`absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm ${loadError ? 'bg-red-50' : 'bg-white/90'
                        }`}
                >
                    <div className="text-center">
                        {isLoading && (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">Se încarcă...</p>
                            </>
                        )}
                        {loadError && (
                            <>
                                <div className="text-red-500 text-lg mb-2">⚠️</div>
                                <p className="text-red-600 text-sm max-w-[90%] mx-auto">{loadError}</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Canvas 3D */}
            <Canvas
                camera={cameraConfig}
                className="w-full h-full"
                {...sceneConfig}
                frameloop="demand"
            >
                {/* Quality Manager */}
                <QualityManager quality={adaptiveQuality} isMobile={isMobile} />

                {/* Environment */}
                <SimpleEnvironment />

                {/* Lighting */}
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1.0}
                    castShadow={false}
                />
                <pointLight
                    position={[-5, 5, -5]}
                    intensity={0.5}
                />

                {/* Model */}
                {modelGroup}

                {/* Scene Export pentru debugging */}
                {process.env.NODE_ENV === 'development' && !threeScene && (
                    <SceneExporter onSceneReady={setThreeScene} />
                )}

                {/* Controls */}
                <OrbitControls {...controlsConfig} />
            </Canvas>


        </div>
    );
});

PieceView.displayName = 'PieceView';

export default PieceView;