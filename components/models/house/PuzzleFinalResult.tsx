'use client';

import { SceneExporter } from '@/components/SceneExporter';
import { IPuzzle, PuzzlePiece } from '@/lib/collection/puzzle'
import { loadPuzzlePieces } from '@/lib/utils/glbLoader';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ZoomIn, ExternalLink, Minimize, Expand, Shrink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type IPuzzleResultPreviewer = {
    puzzle: IPuzzle,
    isMobile: boolean,
    usedPieces: PuzzlePiece[],
}


const PuzzleFinalResult = ({
    puzzle,
    isMobile,
    usedPieces,
}: IPuzzleResultPreviewer) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);
    const [visiblePieces, setVisiblePieces] = useState<any[]>([]);
    const [isAnimating, setIsAnimating] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const controlsRef = useRef<any>(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const timeoutRef = useRef(null);

    const load3DComponent = async (pieces: PuzzlePiece[]) => {
        setIsLoading(true);
        setVisiblePieces(await loadPuzzlePieces(pieces));
        setIsLoading(false);
    }

    const handleToggleFullscreen = () => {
        if (!isFullscreen) {
            // Enter fullscreen
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
                (containerRef.current as any).webkitRequestFullscreen();
            } else if ((containerRef.current as any)?.msRequestFullscreen) {
                (containerRef.current as any).msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }
    };


    const handleUserInteraction = () => {
        // Oprim rotația automată
        setAutoRotate(false);

        // Resetăm timeout-ul anterior dacă există
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Pornim un nou timeout pentru a relua rotația după 10 secunde
        timeoutRef.current = setTimeout(() => {
            setAutoRotate(true);
        }, 10000); // 10 secunde
    };

    // Adăugăm event listener pentru interacțiuni
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        // Adăugăm event listener pentru toate evenimentele relevante
        const events = ['start', 'change'];
        const eventHandlers = events.map(event =>
            controls.addEventListener(event, handleUserInteraction)
        );

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event, index) => {
                if (eventHandlers[index]) {
                    controls.removeEventListener(event, handleUserInteraction);
                }
            });
        };
    }, []);

    useEffect(() => {
        load3DComponent(usedPieces);
    }, [usedPieces])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const getCameraConfig = () => {
        if (isFullscreen) {
            return { position: [5, 3, 7] as [number, number, number], fov: 50 };
        }

        let aspectRatio = 500 / 450;
        if (isMobile) {
            aspectRatio = 350 / 250;
            return { position: [3, 2, 4] as [number, number, number], fov: 50 };
        }

        if (aspectRatio > 1.5) {
            return { position: [5, 3, 7] as [number, number, number], fov: 45 };
        } else if (aspectRatio < 0.8) {
            return { position: [3, 2, 4] as [number, number, number], fov: 40 };
        }

        return { position: [4, 3, 6] as [number, number, number], fov: 45 };
    };

    const cameraConfig = getCameraConfig();

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                width: isFullscreen ? '100vw' : (isMobile ? 300 : 500),
                height: isFullscreen ? '100vh' : (isMobile ? 150 : 350)
            }}
            className={`relative rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-full min-h-[20px] sm:min-h-[100px]'}`}
        >

            <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
                {/* Fullscreen Toggle */}
                {!isMobile &&
                    <Button onClick={handleToggleFullscreen} className='bg-brown hover:bg-brown-dark transition duration-300 ease-in'>
                        {isFullscreen ? <Shrink /> : <Expand />}
                    </Button>}

            </div>


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

            <Canvas
                onClick={isMobile ? handleToggleFullscreen : () => { }}
                key={isFullscreen ? 'fullscreen' : 'normal'}
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
                onCreated={({ gl, scene }) => {
                    if (isMobile && !isFullscreen) {
                        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                    } else {
                        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    }

                    // Set background color
                    scene.background = new THREE.Color('#F8FAFC');
                }}
            >
                <color attach="background" args={["#F8FAFC"]} />

                {/* Enhanced Lighting */}
                <ambientLight intensity={(isMobile && !isFullscreen) ? 0.8 : 0.7} />
                {/* <directionalLight
                    position={(isMobile && !isFullscreen) ? [8, 8, 4] : [10, 10, 5]}
                    intensity={(isMobile && !isFullscreen) ? 1.2 : 1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <pointLight
                    position={[0, 5, 0]}
                    intensity={(isMobile && !isFullscreen) ? 0.4 : 0.5}
                    color="#ffffff"
                />
                <hemisphereLight
                    intensity={0.3}
                    color="#ffffff"
                    groundColor="#e2e8f0"
                /> */}

                {/* Model principal */}
                <group position={[0, -1, 0]} scale={(isMobile && !isFullscreen) ? new THREE.Vector3(0.2, 0.2, 0.2) : new THREE.Vector3(0.3, 0.3, 0.3)}>
                    {/* Piese deja plasate - statice */}
                    {visiblePieces.map((piece, i) => {
                        const data = usedPieces[i];
                        if (data) {
                            const finalPosition = new THREE.Vector3(0, 0, 0);
                            return (
                                <primitive
                                    key={data._id}
                                    object={piece}
                                    position={finalPosition}
                                />
                            );
                        }
                        return null;
                    })}



                </group>

                {threeScene === null && <SceneExporter onSceneReady={setThreeScene} />}

                {/* Enhanced Controls */}
                <OrbitControls
                    ref={controlsRef}
                    enablePan={!isMobile || isFullscreen}
                    enableZoom={true}
                    maxDistance={(isMobile && !isFullscreen) ? 8 : 12}
                    minDistance={(isMobile && !isFullscreen) ? 2 : 3}
                    enableDamping={true}
                    dampingFactor={0.05}
                    rotateSpeed={(isMobile && !isFullscreen) ? 0.8 : 1}
                    zoomSpeed={(isMobile && !isFullscreen) ? 0.8 : 1}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1} // poți ajusta viteza de rotație automată
                />

                {/* Enhanced Environment */}
                <Environment
                    preset="apartment"
                    background={false}
                    environmentIntensity={0.6}
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

export default PuzzleFinalResult;