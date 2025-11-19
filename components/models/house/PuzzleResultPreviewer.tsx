'use client';

import { SceneExporter } from '@/components/SceneExporter';
import { IPuzzle, PuzzlePiece } from '@/lib/collection/puzzle'
import { getDefaultTargetFromGLB, loadPuzzlePieces } from '@/lib/utils/glbLoader';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause } from 'lucide-react';
import React from 'react';

type IPuzzleResultPreviewer = {
    puzzle: IPuzzle,
    unusedPieces: PuzzlePiece[],
    isMobile: boolean,
    usedPieces: PuzzlePiece[],
    priority?: 'performance' | 'balanced' | 'quality',
    isVisible?: boolean
}

// Helper function pentru a obține devicePixelRatio în mod safe
const getSafeDevicePixelRatio = (maxRatio: number = 2): number => {
    if (typeof window === 'undefined') return 1; // Server-side, return default
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
    const { gl, scene } = useThree();

    useEffect(() => {
        // Ajustări de calitate bazate pe setări
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

        // Ajustări suplimentare pentru scenă
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.frustumCulled = true;
            }
        });
    }, [quality, isMobile, gl, scene]);

    return null;
};


// Optimized Animated Piece with placementDir animation
const AnimatedPiece = React.memo(({
    piece,
    finalPosition,
    isAnimating,
    delay = 0,
    animationKey,
    quality = 'medium',
    placementDir
}: {
    piece: any,
    finalPosition: THREE.Vector3,
    isAnimating: boolean,
    delay?: number,
    animationKey?: number,
    quality?: 'low' | 'medium' | 'high',
    placementDir?: { start: THREE.Vector3, end: THREE.Vector3 }
}) => {
    const meshRef = useRef<THREE.Group>(null);
    const progressRef = useRef(0);
    const [showArrow, setShowArrow] = useState(false);
    const animationRef = useRef<number | null>(null);

    // Referință pentru bounding box
    const boundingBoxRef = useRef<THREE.Box3>(new THREE.Box3());
    const pieceSizeRef = useRef<THREE.Vector3>(new THREE.Vector3());

    // Calculăm poziția de start bazată pe placementDir sau folosim default
    const startPosition = useMemo(() => {
        if (placementDir?.start) {
            return new THREE.Vector3(
                placementDir.start.x,
                placementDir.start.y,
                placementDir.start.z
            );
        }
        return new THREE.Vector3(
            finalPosition.x,
            finalPosition.y + 10,
            finalPosition.z
        );
    }, [finalPosition, placementDir]);

    // Calculăm poziția finală
    const targetPosition = useMemo(() => {
        if (placementDir?.end) {
            return new THREE.Vector3(
                placementDir.end.x,
                placementDir.end.y,
                placementDir.end.z
            );
        }
        return finalPosition;
    }, [finalPosition, placementDir]);

    // Calculăm bounding box-ul piesei pentru a determina dimensiunile
    useEffect(() => {
        if (piece) {
            boundingBoxRef.current.setFromObject(piece);
            boundingBoxRef.current.getSize(pieceSizeRef.current);
        }
    }, [piece]);

    // Funcție pentru a obține poziția săgeții bazată pe poziția curentă a piesei
    const getArrowPosition = useCallback((currentPos: THREE.Vector3) => {
        if (!meshRef.current || !piece) {
            return {
                start: new THREE.Vector3(0, 6, 0),
                end: new THREE.Vector3(0, 1, 0)
            };
        }

        // Obținem target-ul default din mesh-ul piesei
        const pieceTarget = getDefaultTargetFromGLB(piece);

        // Calculăm poziția de start a săgeții (deasupra piesei)
        const arrowStart = new THREE.Vector3(
            currentPos.x + pieceTarget.x,
            currentPos.y + pieceSizeRef.current.y * 0.8, // 80% din înălțimea piesei
            currentPos.z + pieceTarget.z
        );

        // Calculăm poziția de sfârșit a săgeții (centrul piesei)
        const arrowEnd = new THREE.Vector3(
            currentPos.x + pieceTarget.x,
            currentPos.y + pieceSizeRef.current.y * 0.2, // 20% din înălțimea piesei
            currentPos.z + pieceTarget.z
        );

        return { start: arrowStart, end: arrowEnd };
    }, [piece]);

    const tempVector = useMemo(() => new THREE.Vector3(), []);
    const easeOutCubic = useCallback((t: number) => 1 - Math.pow(1 - t, 3), []);



    // Actualizăm poziția săgeții la fiecare frame
    useFrame(() => {
        if (!meshRef.current || !isAnimating) return;

        const progress = progressRef.current;
        const eased = easeOutCubic(Math.max(0, progress));

        if (progress <= 0.001) {
            if (meshRef.current.visible) {
                meshRef.current.visible = false;
                meshRef.current.position.copy(startPosition);
                meshRef.current.rotation.set(0, 0, 0);
            }
            return;
        }

        if (!meshRef.current.visible) {
            meshRef.current.visible = true;
        }

        // Interpolăm poziția
        tempVector.lerpVectors(startPosition, targetPosition, eased);
        meshRef.current.position.copy(tempVector);

    });

    // Animation logic
    useEffect(() => {
        if (!isAnimating) {
            progressRef.current = 0;
            setShowArrow(false);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }

            if (meshRef.current) {
                meshRef.current.visible = false;
                meshRef.current.position.copy(startPosition);
                meshRef.current.rotation.set(0, 0, 0);
            }
            return;
        }

        progressRef.current = 0;
        setShowArrow(true);

        const timer = setTimeout(() => {
            const duration = 1500;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min(elapsed / duration, 1);

                progressRef.current = newProgress;

                if (newProgress >= 0.8) {
                    setShowArrow(false);
                }

                if (newProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setShowArrow(false);
                    animationRef.current = null;
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timer);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [isAnimating, delay, animationKey, startPosition]);

    return (
        <group ref={meshRef}>
            <primitive object={piece} />
        </group>
    );
});

AnimatedPiece.displayName = 'AnimatedPiece';

AnimatedPiece.displayName = 'AnimatedPiece';

// Memoized static piece component
const StaticPiece = React.memo(({ piece }: { piece: any }) => {
    return <primitive object={piece} />;
});

StaticPiece.displayName = 'StaticPiece';

const PuzzleResultPreviewer = ({
    puzzle,
    unusedPieces,
    isMobile,
    usedPieces,
    priority = 'balanced',
    isVisible = true
}: IPuzzleResultPreviewer) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);
    const [visiblePieces, setVisiblePieces] = useState<any[]>([]);
    const [lastPieces, setLastPieces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const controlsRef = useRef<any>(null);

    const [isAnimating, setIsAnimating] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);
    const [adaptiveQuality, setAdaptiveQuality] = useState<'low' | 'medium' | 'high'>('medium');

    // Calitate adaptivă bazată pe context
    useEffect(() => {
        let quality: 'low' | 'medium' | 'high' = 'medium';

        if (priority === 'performance') {
            quality = 'low';
        } else if (priority === 'quality') {
            quality = 'high';
        } else {
            if (!isVisible) {
                quality = 'low';
            } else if (isMobile) {
                quality = 'medium';
            } else {
                quality = 'high';
            }
        }

        setAdaptiveQuality(quality);
    }, [isVisible, isMobile, priority]);

    // Configurație calitate detaliată - FOLOSIM getSafeDevicePixelRatio
    const qualityConfig = useMemo(() => {
        const configs = {
            high: {
                antialias: true,
                shadows: true,
                shadowSize: 1024,
                pixelRatio: getSafeDevicePixelRatio(2),
                environmentIntensity: 0.8,
                toneMappingExposure: 1.0
            },
            medium: {
                antialias: !isMobile,
                shadows: !isMobile,
                shadowSize: 512,
                pixelRatio: getSafeDevicePixelRatio(1.5),
                environmentIntensity: 0.6,
                toneMappingExposure: 0.8
            },
            low: {
                antialias: false,
                shadows: false,
                shadowSize: 256,
                pixelRatio: getSafeDevicePixelRatio(isMobile ? 1 : 1.2),
                environmentIntensity: 0.4,
                toneMappingExposure: 0.6
            }
        };

        return configs[adaptiveQuality];
    }, [adaptiveQuality, isMobile]);

    const restartAnimation = useCallback(() => {
        setAnimationKey(prev => prev + 1);
        setIsAnimating(true);
    }, []);



    // Memoized camera configuration
    const cameraConfig = useMemo(() => {
        const baseConfig = {
            position: [4, 3, 6] as [number, number, number],
            fov: 45,
            near: 0.1,
            far: 1000
        };

        if (isMobile) {
            return {
                ...baseConfig,
                position: [3, 2, 4] as [number, number, number],
                fov: 50
            };
        }

        return baseConfig;
    }, [isMobile]);

    // Memoized scale
    const scale = useMemo(() =>
        isMobile ? new THREE.Vector3(0.2, 0.2, 0.2) : new THREE.Vector3(0.3, 0.3, 0.3),
        [isMobile]
    );

    // Optimized loading functions
    const load3DComponent = useCallback(async (pieces: PuzzlePiece[]) => {
        if (!isVisible) return;

        setIsLoading(true);
        try {
            const loadedPieces = await loadPuzzlePieces(pieces);
            setVisiblePieces(loadedPieces);
        } catch (error) {
            console.error('Error loading puzzle pieces:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isVisible]);

    const loadAnimatedPieces = useCallback(async (pieces: PuzzlePiece[]) => {
        if (!isVisible || pieces.length === 0) {
            setLastPieces([]);
            return;
        }

        const minStep = Math.min(...pieces.map(v => v.step || 0));
        const filtered = pieces.filter(v => v.step === minStep && v.isMobile === isMobile);

        if (filtered.length === 0) {
            setLastPieces([]);
            return;
        }

        try {
            const meshes = await loadPuzzlePieces(filtered);
            const combined = filtered.map((data, i) => ({
                data,
                mesh: meshes[i]
            }));
            setLastPieces(combined);

            setIsAnimating(true);
            setAnimationKey(prev => prev + 1);
        } catch (error) {
            console.error('Error loading animated pieces:', error);
        }
    }, [isMobile, isVisible]);

    // Optimized effects with dependencies
    useEffect(() => {
        load3DComponent(usedPieces);
    }, [usedPieces, load3DComponent]);

    useEffect(() => {
        loadAnimatedPieces(unusedPieces);
    }, [unusedPieces, loadAnimatedPieces]);

    // Memoized scene configuration cu calitate adaptivă
    const sceneConfig = useMemo(() => ({
        gl: {
            antialias: qualityConfig.antialias,
            alpha: false,
            powerPreference: "high-performance" as const
        },
        onCreated: ({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => {
            gl.setPixelRatio(qualityConfig.pixelRatio);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = qualityConfig.toneMappingExposure;
            scene.background = new THREE.Color('#F8FAFC');
        }
    }), [qualityConfig]);

    // Memoized lighting configuration cu calitate adaptivă
    const lightingConfig = useMemo(() => ({
        ambient: {
            intensity: isMobile ? 0.8 : 0.7
        },
        directional: {
            position: isMobile ? [8, 8, 4] : [10, 10, 5] as [number, number, number],
            intensity: isMobile ? 1.2 : 1,
            castShadow: qualityConfig.shadows,
            shadowMapSize: qualityConfig.shadowSize
        },
        point: {
            position: [0, 5, 0] as [number, number, number],
            intensity: isMobile ? 0.4 : 0.5
        }
    }), [isMobile, qualityConfig]);

    // Memoized controls configuration
    const controlsConfig = useMemo(() => ({
        enablePan: !isMobile,
        enableZoom: true,
        maxDistance: isMobile ? 8 : 12,
        minDistance: isMobile ? 2 : 3,
        enableDamping: true,
        dampingFactor: 0.05,
        rotateSpeed: isMobile ? 1.1 : 0.7,
        zoomSpeed: isMobile ? 1 : 1
    }), [isMobile]);

    // Dacă nu este vizibil, returnăm un container minimal
    if (!isVisible) {
        return (
            <div
                style={{
                    width: isMobile ? 350 : 500,
                    height: isMobile ? 200 : 450
                }}
                className="relative rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center"
            >
                <p className="text-gray-500">Preview 3D indisponibil</p>
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                width: isMobile ? 350 : 500,
                height: isMobile ? 200 : 450
            }}
            className="relative rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm overflow-hidden w-full h-full min-h-[100px] sm:min-h-[100px]"
        >
            {/* Loading indicator */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-slate-700 font-medium">Se încarcă modelul 3D...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Buttons */}


            <Canvas
                camera={cameraConfig}
                onClick={restartAnimation}
                style={{
                    width: '100%',
                    height: '100%'
                }}
                {...sceneConfig}
            >
                <color attach="background" args={["#F8FAFC"]} />

                {/* Quality Manager */}
                <QualityManager quality={adaptiveQuality} isMobile={isMobile} />

                {/* Optimized Lighting */}
                <ambientLight intensity={lightingConfig.ambient.intensity} />

                {/* Directional Light cu shadow-uri condiționale */}
                {qualityConfig.shadows && (
                    <directionalLight
                        position={new THREE.Vector3(...lightingConfig.directional.position)}
                        intensity={lightingConfig.directional.intensity}
                        castShadow={true}
                        shadow-mapSize-width={lightingConfig.directional.shadowMapSize}
                        shadow-mapSize-height={lightingConfig.directional.shadowMapSize}
                    />
                )}

                {/* Point Light doar pentru calitate medie/înaltă */}
                {adaptiveQuality !== 'low' && (
                    <pointLight
                        position={lightingConfig.point.position}
                        intensity={lightingConfig.point.intensity}
                        color="#ffffff"
                    />
                )}

                <hemisphereLight
                    intensity={0.3}
                    color="#ffffff"
                    groundColor="#e2e8f0"
                />

                {/* Main model group */}
                <group position={[0, 0, 0]} scale={scale} >
                    {/* Static pieces */}
                    {visiblePieces.map((piece, i) => {
                        const data = usedPieces[i];
                        return data ? <StaticPiece key={data._id} piece={piece} /> : null;
                    })}

                    {/* Animated pieces */}
                    {lastPieces.map((pieceObj, i) => {
                        const { data, mesh } = pieceObj;
                        return data && mesh ? (
                            <AnimatedPiece
                                key={`anim-${data._id}-${animationKey}`}
                                piece={mesh}
                                finalPosition={new THREE.Vector3(...data.position)}
                                isAnimating={isAnimating}
                                delay={i * 400}
                                animationKey={animationKey}
                                quality={adaptiveQuality}
                                placementDir={data.placementDir}
                            />
                        ) : null;
                    })}
                </group>

                {threeScene === null && <SceneExporter onSceneReady={setThreeScene} />}

                {/* Optimized Controls */}
                <OrbitControls
                    ref={controlsRef}
                    {...controlsConfig}
                />

                {/* Environment cu calitate ajustabilă */}
                <Environment
                    preset="apartment"
                    background={false}
                    environmentIntensity={qualityConfig.environmentIntensity}
                />
            </Canvas>

            {/* Animation Status */}
            <AnimatePresence>
                {!isAnimating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none"
                    >
                        <div className="flex items-center gap-2">
                            <Pause className="w-4 h-4" />
                            <span className="text-sm">Animație oprită</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </motion.div>
    );
}

export default React.memo(PuzzleResultPreviewer);