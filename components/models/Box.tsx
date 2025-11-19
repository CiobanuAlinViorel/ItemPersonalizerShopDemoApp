'use client'

import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

interface BoxProps {
  canvas: HTMLCanvasElement | null;
  autoRotate?: boolean;
  objectColor?: string;
  textureUrl?: string;
}

export default function Box({ canvas, autoRotate = false, objectColor = "#FFFFFF", textureUrl }: BoxProps) {
  const { nodes } = useGLTF('/models/box_.glb') as any;
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [materialTexture, setMaterialTexture] = useState<THREE.Texture | null>(null);
  const { gl } = useThree()

  // Textura din canvas (design utilizator)
  useEffect(() => {
    if (canvas) {
      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.magFilter = THREE.LinearFilter;
      newTexture.wrapS = THREE.ClampToEdgeWrapping;
      newTexture.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(newTexture);

      return () => {
        newTexture.dispose();
      };
    }
  }, [canvas]);

  // Textura materialului (din bibliotecă)
  useEffect(() => {
    if (textureUrl) {
      console.log('🔄 Încărc textura:', textureUrl);
      const loader = new THREE.TextureLoader();
      loader.load(
        textureUrl,
        (loadedTexture) => {
          console.log('✅ Textură încărcată:', loadedTexture);
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(2, 2);
          loadedTexture.needsUpdate = true;
          setMaterialTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.error('❌ Eroare la încărcarea texturii:', error);
        }
      );
    } else {
      console.log('🗑️ Fără textură, resetez');
      setMaterialTexture(null);
    }
  }, [textureUrl]);

  // Actualizează textura canvas continuu
  useEffect(() => {
    if (texture && canvas) {
      const interval = setInterval(() => {
        texture.needsUpdate = true;
      }, 100);
      return () => clearInterval(interval);
    }
  }, [texture, canvas]);

  useEffect(() => {
    if (materialTexture) {
      materialTexture.minFilter = THREE.LinearFilter;
      materialTexture.magFilter = THREE.LinearFilter;
      materialTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      materialTexture.colorSpace = THREE.SRGBColorSpace;
      materialTexture.needsUpdate = true;
    }
  }, [materialTexture, gl]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Mesh-ul principal cu textură/material */}
      <mesh
        geometry={nodes.Empty_box?.geometry}
        position={[0, 0.058, 0.016]}
        scale={635.448}
      >
        {materialTexture ? (
          // Dacă avem textură, folosim meshBasicMaterial pentru a o afișa corect
          <meshBasicMaterial
            map={materialTexture}
            transparent={false}
          />
        ) : (
          // Dacă nu avem textură, folosim meshStandardMaterial cu culoare
          <meshStandardMaterial
            color={objectColor}
          />
        )}
      </mesh>

      {/* Plane pentru textura canvas (design utilizator) - doar dacă avem canvas */}
      {texture && (
        <mesh
          position={[0.23, 0.65, 0.7]}
          rotation={[0, 0, 0]}
          scale={[1.73, 1.15, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            side={THREE.FrontSide}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload('/models/box_.glb')