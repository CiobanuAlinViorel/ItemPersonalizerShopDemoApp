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

// Component pentru a combina toate piesele statice într-un singur mesh
const CombinedStaticPieces = React.memo(({
    pieces,
    usedPiecesData
}: {
    pieces: any[],
    usedPiecesData: PuzzlePiece[]
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [combinedMesh, setCombinedMesh] = useState<THREE.Group | null>(null);

    // Combină toate piesele într-un singur group
    useEffect(() => {
        if (!pieces.length || !usedPiecesData.length || pieces.length !== usedPiecesData.length) {
            setCombinedMesh(null);
            return;
        }

        const combinedGroup = new THREE.Group();

        pieces.forEach((piece, index) => {
            if (piece && usedPiecesData[index]) {
                try {
                    // Clonează întregul obiect (inclusiv toate children-urile)
                    const clonedPiece = piece.clone(true);

                    // Aplică poziția corectă din placementDir.end
                    const placement = usedPiecesData[index].placementDir?.end;
                    if (placement && Array.isArray(placement) && placement.length >= 3) {
                        clonedPiece.position.set(
                            placement[0] || 0,
                            placement[1] || 0,
                            placement[2] || 0
                        );
                    }

                    // Copiem proprietățile de rotation și scale dacă există


                    combinedGroup.add(clonedPiece);
                } catch (error) {
                    console.error('Error cloning piece:', error, usedPiecesData[index]);
                }
            }
        });

        // Debug: verifică ce am creat
        console.log('Combined static pieces:', {
            totalPieces: pieces.length,
            combinedChildren: combinedGroup.children.length,
            positions: combinedGroup.children.map(child => child.position)
        });

        setCombinedMesh(combinedGroup);

        return () => {
            // Cleanup
            combinedGroup.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.geometry?.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material?.dispose();
                    }
                }
            });
        };
    }, [pieces, usedPiecesData]);

    if (!combinedMesh) {
        console.log('No combined mesh to render');
        return null;
    }

    console.log('Rendering combined mesh with', combinedMesh.children.length, 'children');
    return <primitive object={combinedMesh} />;
});

CombinedStaticPieces.displayName = 'CombinedStaticPieces';

// Fallback component pentru a afișa piesele individual dacă combined nu funcționează
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

    const boundingBoxRef = useRef<THREE.Box3>(new THREE.Box3());
    const pieceSizeRef = useRef<THREE.Vector3>(new THREE.Vector3());

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

    useEffect(() => {
        if (piece) {
            boundingBoxRef.current.setFromObject(piece);
            boundingBoxRef.current.getSize(pieceSizeRef.current);
        }
    }, [piece]);

    const tempVector = useMemo(() => new THREE.Vector3(), []);
    const easeOutCubic = useCallback((t: number) => 1 - Math.pow(1 - t, 3), []);

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

        tempVector.lerpVectors(startPosition, targetPosition, eased);
        meshRef.current.position.copy(tempVector);
    });

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
    const [useCombinedMesh, setUseCombinedMesh] = useState(true);

    const [isAnimating, setIsAnimating] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);
    const [adaptiveQuality, setAdaptiveQuality] = useState<'low' | 'medium' | 'high'>('medium');

    // Calitate adaptivă
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

    // Configurație calitate detaliată
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
        if (!isVisible) return;

        setIsLoading(true);
        try {
            const loadedPieces = await loadPuzzlePieces(pieces);
            console.log('Loaded static pieces:', {
                requested: pieces.length,
                loaded: loadedPieces.length,
                pieces: pieces.map(p => ({ id: p._id, placement: p.placementDir?.end }))
            });
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
        const filtered = pieces.filter(v => v.step === minStep);

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

    useEffect(() => {
        load3DComponent(usedPieces);
    }, [usedPieces, load3DComponent]);

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
                    {/* Static pieces - folosim combined sau fallback */}
                    {visiblePieces.length > 0 && usedPieces.length > 0 && (
                        <>
                            {useCombinedMesh ? (
                                <CombinedStaticPieces
                                    pieces={visiblePieces}
                                    usedPiecesData={usedPieces}
                                />
                            ) : (
                                <StaticPiecesFallback
                                    pieces={visiblePieces}
                                    usedPiecesData={usedPieces}
                                />
                            )}
                        </>
                    )}

                    {/* Animated pieces - rămân separate pentru animație */}
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