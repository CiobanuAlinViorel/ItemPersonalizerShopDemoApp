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

const getSafeDevicePixelRatio = (maxRatio: number = 2): number => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, maxRatio);
};

const QualityManager = ({
    quality,
    isMobile
}: {
    quality: 'low' | 'medium' | 'high',
    isMobile: boolean
}) => {
    const { gl, scene } = useThree();

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

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.frustumCulled = true;
            }
        });
    }, [quality, isMobile, gl, scene]);

    return null;
};

// 🎯 Component simplu pentru piese statice (fără shared geometry - revert la simplitate)
const CombinedStaticPieces = React.memo(({
    pieces,
    usedPiecesData
}: {
    pieces: any[],
    usedPiecesData: PuzzlePiece[]
}) => {
    return (
        <>
            {pieces.map((piece, index) => {
                const data = usedPiecesData[index];
                if (!piece || !data) return null;

                const placement = data.placementDir?.end;
                const position = placement && Array.isArray(placement) && placement.length >= 3
                    ? [placement[0], placement[1], placement[2]]
                    : [0, 0, 0];

                return (
                    <group key={data._id} position={position as any}>
                        <primitive object={piece} />
                    </group>
                );
            })}
        </>
    );
});

CombinedStaticPieces.displayName = 'CombinedStaticPieces';

// Fallback simplu dacă optimized nu funcționează
const StaticPiecesFallback = React.memo(({
    pieces,
    usedPiecesData
}: {
    pieces: any[],
    usedPiecesData: PuzzlePiece[]
}) => {
    return (
        <>
            {pieces.map((piece, index) => {
                const data = usedPiecesData[index];
                if (!piece || !data) return null;

                const placement = data.placementDir?.end;
                const position = placement && Array.isArray(placement) && placement.length >= 3
                    ? [placement[0], placement[1], placement[2]]
                    : [0, 0, 0];

                return (
                    <group key={data._id} position={position as any}>
                        <primitive object={piece} />
                    </group>
                );
            })}
        </>
    );
});

StaticPiecesFallback.displayName = 'StaticPiecesFallback';

// Animated Piece optimizat (fără modificări majore, dar mai clean)
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
    const animationRef = useRef<number | null>(null);
    const [isReady, setIsReady] = useState(false);

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

    const tempVector = useMemo(() => new THREE.Vector3(), []);
    const easeOutCubic = useCallback((t: number) => 1 - Math.pow(1 - t, 3), []);

    // 🔧 FIX: Inițializare mesh cu vizibilitate corectă
    useEffect(() => {
        if (meshRef.current && piece) {
            meshRef.current.visible = false;
            meshRef.current.position.copy(startPosition);
            // Forțează update matrices
            meshRef.current.updateMatrix();
            meshRef.current.updateMatrixWorld(true);
            setIsReady(true);
        }
    }, [piece, startPosition]);

    useFrame(() => {
        if (!meshRef.current || !isAnimating || !isReady) return;

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

        tempVector.lerpVectors(startPosition, targetPosition, eased);
        meshRef.current.position.copy(tempVector);
    });

    useEffect(() => {
        if (!isAnimating || !isReady) {
            progressRef.current = 0;
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

        const timer = setTimeout(() => {
            const duration = 1500;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min(elapsed / duration, 1);

                progressRef.current = newProgress;

                if (newProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
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
    }, [isAnimating, delay, animationKey, startPosition, isReady]);

    return (
        <group ref={meshRef}>
            <primitive object={piece} />
        </group>
    );
});

AnimatedPiece.displayName = 'AnimatedPiece';

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

    const scale = useMemo(() =>
        isMobile ? new THREE.Vector3(0.2, 0.2, 0.2) : new THREE.Vector3(0.3, 0.3, 0.3),
        [isMobile]
    );

    const load3DComponent = useCallback(async (pieces: PuzzlePiece[]) => {
        if (!isVisible || pieces.length === 0) {
            setVisiblePieces([]);
            setIsLoading(false);
            return;
        }

        console.time('🎨 Load 3D Component');

        // 🎯 OPTIMIZARE: Verifică dacă piesele s-au schimbat cu adevărat
        const pieceIds = pieces.map(p => p._id).sort().join(',');
        const prevPieceIds = visiblePieces.length > 0
            ? usedPieces.map(p => p._id).sort().join(',')
            : '';

        if (pieceIds === prevPieceIds && visiblePieces.length > 0) {
            console.log('⏭️ Skipping reload - same pieces');
            console.timeEnd('🎨 Load 3D Component');
            return;
        }

        console.log('🔄 Loading 3D pieces:', pieces.length);
        setIsLoading(true);

        try {
            console.time('  └─ GLB Loading');
            const loadedPieces = await loadPuzzlePieces(pieces);
            console.timeEnd('  └─ GLB Loading');

            console.time('  └─ State Update');
            setVisiblePieces(loadedPieces);
            console.timeEnd('  └─ State Update');

            console.log('✅ Loaded 3D pieces:', loadedPieces.length);
        } catch (error) {
            console.error('Error loading puzzle pieces:', error);
        } finally {
            setIsLoading(false);
            console.timeEnd('🎨 Load 3D Component');
        }
    }, [isVisible, visiblePieces.length, usedPieces]);

    const loadAnimatedPieces = useCallback(async (pieces: PuzzlePiece[]) => {
        if (!isVisible || pieces.length === 0) {
            setLastPieces([]);
            return;
        }

        const minStep = Math.min(...pieces.map(v => v.step || 0));
        const filtered = pieces.filter(v => v.step === minStep);

        if (filtered.length === 0) {
            setLastPieces([]);
            return;
        }

        // 🎯 OPTIMIZARE: Verifică dacă piesele s-au schimbat
        const newIds = filtered.map(p => p._id).sort().join(',');
        const currentIds = lastPieces.map(p => p.data._id).sort().join(',');

        if (newIds === currentIds && lastPieces.length > 0) {
            console.log('⏭️ Skipping animated reload - same pieces');
            return;
        }

        console.log('🎬 Loading animated pieces:', filtered.length);

        try {
            const meshes = await loadPuzzlePieces(filtered);
            const combined = filtered.map((data, i) => ({
                data,
                mesh: meshes[i]
            }));
            setLastPieces(combined);

            setIsAnimating(true);
            setAnimationKey(prev => prev + 1);

            console.log('✅ Loaded animated pieces:', combined.length);
        } catch (error) {
            console.error('Error loading animated pieces:', error);
        }
    }, [isVisible, lastPieces]);

    // Effect pentru încărcare piese statice
    useEffect(() => {
        load3DComponent(usedPieces);
    }, [usedPieces, load3DComponent]);

    // Effect pentru încărcare piesele animate
    useEffect(() => {
        loadAnimatedPieces(unusedPieces);
    }, [unusedPieces, loadAnimatedPieces]);

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

            <Canvas
                camera={cameraConfig}
                onClick={restartAnimation}
                style={{
                    width: '100%',
                    height: '100%'
                }}
                frameloop={isAnimating ? 'always' : 'demand'} // 🔧 FIX: Demand când nu animează
                {...sceneConfig}
            >
                <color attach="background" args={["#F8FAFC"]} />

                <QualityManager quality={adaptiveQuality} isMobile={isMobile} />

                <ambientLight intensity={lightingConfig.ambient.intensity} />

                {qualityConfig.shadows && (
                    <directionalLight
                        position={new THREE.Vector3(...lightingConfig.directional.position)}
                        intensity={lightingConfig.directional.intensity}
                        castShadow={true}
                        shadow-mapSize-width={lightingConfig.directional.shadowMapSize}
                        shadow-mapSize-height={lightingConfig.directional.shadowMapSize}
                    />
                )}

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

                <group position={[0, 0, 0]} scale={scale}>
                    {/* Static pieces - simplu și direct, fără optimizări complexe */}
                    {visiblePieces.length > 0 && usedPieces.length > 0 && (
                        <CombinedStaticPieces
                            pieces={visiblePieces}
                            usedPiecesData={usedPieces}
                        />
                    )}

                    {/* Animated pieces */}
                    {lastPieces.map((pieceObj, i) => {
                        const { data, mesh }: { data: PuzzlePiece, mesh: any } = pieceObj;
                        return data && mesh ? (
                            <AnimatedPiece
                                key={`anim-${data._id}-${animationKey}`}
                                piece={mesh}
                                finalPosition={new THREE.Vector3(...data.placementDir.end)}
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

                <OrbitControls
                    ref={controlsRef}
                    {...controlsConfig}
                    enabled={isVisible} // 🔧 FIX: Disable când nu e vizibil
                />

                <Environment
                    preset="apartment"
                    background={false}
                    environmentIntensity={qualityConfig.environmentIntensity}
                />
            </Canvas>

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