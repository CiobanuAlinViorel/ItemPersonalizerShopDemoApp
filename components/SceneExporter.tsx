// components/SceneExporter.tsx
"use client";

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneExporterProps {
    onSceneReady: (scene: THREE.Scene) => void;
}

export const SceneExporter = ({ onSceneReady }: SceneExporterProps) => {
    const { scene } = useThree();

    useEffect(() => {
        if (scene) {
            onSceneReady(scene);
        }
    }, [scene, onSceneReady]);

    return null;
};