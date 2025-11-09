import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SceneExporter } from "./SceneExporter";
import * as THREE from 'three';

interface ProductPreview3DProps {
    canvas: HTMLCanvasElement | null;
    width?: number;
    height?: number;
    Model: React.FC<any>;
    objectColor?: string;
    onSceneReady?: (scene: THREE.Scene) => void;
    textureUrl?: string | null; // Adaugă acest prop
}

export const ProductPreview3D = ({
    canvas,
    width = 350,
    height = 450,
    Model,
    objectColor = "#FFFFFF",
    onSceneReady,
    textureUrl // Adaugă acest parametru
}: ProductPreview3DProps) => {
    return (
        <div
            style={{ width, height }}
            className="relative border border-gray-300 rounded-lg bg-[#F5F2ED] overflow-hidden"
        >
            <Canvas camera={{ position: [4, 3, 6], fov: 45 }}>
                <color attach="background" args={["#F5F2ED"]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <pointLight position={[0, 5, 0]} intensity={0.4} />

                <Model
                    canvas={canvas}
                    objectColor={objectColor}
                    textureUrl={textureUrl} // Transmite textura către Model
                />

                {onSceneReady && <SceneExporter onSceneReady={onSceneReady} />}

                <OrbitControls enablePan={false} enableZoom={true} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};