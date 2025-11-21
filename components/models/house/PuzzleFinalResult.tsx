'use client';

import { IPuzzle } from '@/lib/collection/puzzle';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, Shrink, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

type IPuzzleResultPreviewer = {
    puzzle: IPuzzle;
    isMobile: boolean;
};

// Componentă directă cu useGLTF
const GLTFModel = ({ url, onLoad }: { url: string; onLoad: () => void }) => {
    const { scene } = useGLTF(url);

    useEffect(() => {
        // Modelul este încărcat, notifică componenta părinte
        onLoad();
    }, [scene, onLoad]);

    return <primitive object={scene} />;
};

const LoadingSpinner = () => (
    <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1, 0.05, 16, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
    </mesh>
);

const PuzzleFinalResult = ({
    puzzle,
    isMobile,
}: IPuzzleResultPreviewer) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);

    // Preload the model on component mount
    useEffect(() => {
        const preloadModel = async () => {
            try {
                // Import și preload
                const { useGLTF } = await import('@react-three/drei');
                const gltf = useGLTF;

                // Folosim preload dacă este disponibil
                if (gltf && (gltf as any).preload) {
                    (gltf as any).preload(puzzle.model3D);
                }
            } catch (error) {
                console.error('Preload error:', error);
            }
        };

        preloadModel();
    }, [puzzle.model3D]);

    const handleToggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }, [isFullscreen]);

    const handleModelLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const cameraConfig = {
        position: [4, 3, 6] as [number, number, number],
        fov: isMobile ? 55 : 45
    };

    const modelScale = (isMobile && !isFullscreen) ? 0.2 : 0.3;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-2xl shadow-2xl border border-white/20 bg-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-full'
                }`}
            style={{
                width: isFullscreen ? '100vw' : (isMobile ? 300 : 500),
                height: isFullscreen ? '100vh' : (isMobile ? 150 : 350)
            }}
        >
            <div className="absolute top-2 right-2 z-20">
                {!isMobile && (
                    <Button
                        onClick={handleToggleFullscreen}
                        size="sm"
                        className='bg-brown hover:bg-brown-dark text-white'
                    >
                        {isFullscreen ? <Shrink size={16} /> : <Expand size={16} />}
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/90 z-10"
                    >
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                            <p className="text-slate-700">Se încarcă modelul 3D...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas
                camera={cameraConfig}
                style={{ width: '100%', height: '100%' }}
                gl={{ antialias: true }}
                onClick={isMobile ? handleToggleFullscreen : undefined}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.7} />

                <group position={[0, -1, 0]} scale={isMobile ? [0.4, 0.4, 0.4] : [0.3, 0.3, 0.3]}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <GLTFModel url={puzzle.model3D} onLoad={handleModelLoad} />
                    </Suspense>
                </group>

                <OrbitControls
                    enablePan={!isMobile}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1}
                />

                <Environment preset="city" />
            </Canvas>
        </motion.div>
    );
};

export default PuzzleFinalResult;