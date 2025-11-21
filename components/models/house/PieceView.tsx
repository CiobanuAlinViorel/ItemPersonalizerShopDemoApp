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

const getSafeDevicePixelRatio = (maxRatio: number = 2): number => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, maxRatio);
};

// 🔥 OPTIMIZED: Quality Manager
const QualityManager = React.memo(({
    quality,
    isMobile
}: {
    quality: 'low' | 'medium' | 'high',
    isMobile: boolean
}) => {
    const { gl } = useThree();

    useEffect(() => {
        let pixelRatio = 1;
        switch (quality) {
            case 'high':
                pixelRatio = getSafeDevicePixelRatio(1.5);
                break;
            case 'medium':
                pixelRatio = getSafeDevicePixelRatio(1.2);
                break;
            case 'low':
            default:
                pixelRatio = getSafeDevicePixelRatio(1);
                break;
        }

        gl.setPixelRatio(pixelRatio);
    }, [quality, isMobile, gl]);

    return null;
});

QualityManager.displayName = 'QualityManager';

// 🔥 OPTIMIZED: Simple Environment
const SimpleEnvironment = React.memo(() => {
    return (
        <>
            <color attach="background" args={["#F8FAFC"]} />
            <Environment
                preset="apartment"
                background={false}
                environmentIntensity={0.5}
            />
        </>
    );
});

SimpleEnvironment.displayName = 'SimpleEnvironment';

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
    const [shouldRender, setShouldRender] = useState(false);

    const [adaptiveQuality, setAdaptiveQuality] = useState<'low' | 'medium' | 'high'>('low');

    // 🔥 NEW: Intersection Observer pentru lazy loading
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !shouldRender) {
                        setShouldRender(true);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [shouldRender]);

    // 🔥 OPTIMIZED: Calitate adaptivă
    useEffect(() => {
        if (!isVisible || !shouldRender) {
            setAdaptiveQuality('low');
            return;
        }

        let quality: 'low' | 'medium' | 'high' = 'low';

        if (priority === 'performance' || isMobile) {
            quality = 'low';
        } else if (priority === 'quality') {
            quality = 'medium';
        } else {
            quality = isMobile ? 'low' : 'medium';
        }

        setAdaptiveQuality(quality);
    }, [isVisible, isMobile, priority, shouldRender]);

    const qualityConfig = useMemo(() => {
        const configs = {
            high: {
                antialias: false,
                pixelRatio: getSafeDevicePixelRatio(1.5),
                toneMappingExposure: 0.9
            },
            medium: {
                antialias: false,
                pixelRatio: getSafeDevicePixelRatio(1.2),
                toneMappingExposure: 0.8
            },
            low: {
                antialias: false,
                pixelRatio: getSafeDevicePixelRatio(1),
                toneMappingExposure: 0.7
            }
        };

        return configs[adaptiveQuality];
    }, [adaptiveQuality]);

    const cameraConfig = useMemo(() => ({
        position: [3, 2, 4] as [number, number, number],
        fov: 50,
        near: 0.1,
        far: 100
    }), []);

    const scale = useMemo(() => 0.3, []);
    const position = useMemo(() => [0, 0, 0] as [number, number, number], []);

    // 🔥 OPTIMIZED: Loading cu abort controller
    const abortControllerRef = useRef<AbortController | null>(null);

    const load3DComponent = useCallback(async (component: string) => {
        if (!isVisible || !shouldRender) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setLoadError(null);

        try {
            const model = await loadGLBOnCenter(component);

            if (signal.aborted) return;

            if (model) {
                setModel3D(model);
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error loading 3D model:', error);
                setLoadError(`Failed to load model`);
            }
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [isVisible, shouldRender]);

    useEffect(() => {
        if (piece.glb && isVisible && shouldRender) {
            load3DComponent(piece.glb);
        } else {
            setModel3D(null);
            setIsLoading(false);
        }
    }, [piece.glb, isVisible, shouldRender, load3DComponent]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            if (model3D) {
                model3D.traverse((child: any) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry?.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material?.dispose();
                        }
                    }
                });
            }
        };
    }, [model3D]);

    const sceneConfig = useMemo(() => ({
        gl: {
            antialias: qualityConfig.antialias,
            alpha: true,
            powerPreference: "default" as const,
            failIfMajorPerformanceCaveat: false
        },
        frameloop: 'demand' as const,
        onCreated: ({ gl }: { gl: THREE.WebGLRenderer }) => {
            gl.setPixelRatio(qualityConfig.pixelRatio);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = qualityConfig.toneMappingExposure;
        }
    }), [qualityConfig]);

    const controlsConfig = useMemo(() => ({
        enablePan: false,
        enableZoom: true,
        maxDistance: 8,
        minDistance: 1,
        enableDamping: true,
        dampingFactor: 0.08,
        rotateSpeed: 2,
        zoomSpeed: 0.8,
        makeDefault: true
    }), []);

    const modelGroup = useMemo(() => {
        if (!model3D || !isVisible || !shouldRender) return null;

        return (
            <group position={position} scale={scale}>
                <primitive object={model3D} />
            </group>
        );
    }, [model3D, position, scale, isVisible, shouldRender]);

    if (!isVisible) {
        return (
            <div className="relative w-full h-[50vh] border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Preview 3D indisponibil</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[50vh] border border-gray-300 rounded-lg bg-white my-4 overflow-hidden`}
        >
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

            {shouldRender && (
                <Canvas
                    camera={cameraConfig}
                    className="w-full h-full"
                    {...sceneConfig}
                >
                    <QualityManager quality={adaptiveQuality} isMobile={isMobile} />

                    <SimpleEnvironment />

                    <ambientLight intensity={0.8} />
                    <directionalLight
                        position={[5, 10, 5]}
                        intensity={0.9}
                    />

                    {modelGroup}

                    {process.env.NODE_ENV === 'development' && !threeScene && (
                        <SceneExporter onSceneReady={setThreeScene} />
                    )}

                    <OrbitControls {...controlsConfig} />
                </Canvas>
            )}
        </div>
    );
});

PieceView.displayName = 'PieceView';

export default PieceView;