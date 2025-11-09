import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

interface CofeeProps {
  canvas: HTMLCanvasElement | null;
  autoRotate?: boolean;
  objectColor?: string;
  textureUrl?: string;
  // Textura de fundal a obiectului
}

export function Cofee({
  canvas,
  autoRotate = false,
  objectColor = "#FFFFFF",
  textureUrl
}: CofeeProps) {
  const { nodes } = useGLTF('/models/cofee.glb') as any
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [materialTexture, setMaterialTexture] = useState<THREE.Texture | null>(null);
  const [backgroundTexture, setBackgroundTexture] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();

  // Textura din canvas (design utilizator)
  useEffect(() => {
    if (canvas) {
      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.needsUpdate = true;
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.flipY = false;
      const desiredAspect = 7.64;
      const currentAspect = newTexture.image.width / newTexture.image.height; // 0.75
      const factor = desiredAspect / currentAspect; // ≈ 4.58

      newTexture.repeat.set(factor, 1);
      newTexture.offset.x = -2.20; // sau ajustează să centrezi

      newTexture.magFilter = THREE.LinearFilter;
      newTexture.wrapS = THREE.ClampToEdgeWrapping;
      newTexture.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(newTexture);

      return () => {
        newTexture.dispose();
      };
    }
  }, [canvas]);

  // Textura materialului (din bibliotecă) - pentru partea principală
  useEffect(() => {
    if (textureUrl) {
      console.log('🔄 Încărc textura principală:', textureUrl);
      const loader = new THREE.TextureLoader();
      loader.load(
        textureUrl,
        (loadedTexture) => {
          console.log('✅ Textură principală încărcată:', loadedTexture);
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(2, 2);
          loadedTexture.needsUpdate = true;
          setMaterialTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.error('❌ Eroare la încărcarea texturii principale:', error);
        }
      );
    } else {
      console.log('🗑️ Fără textură principală, resetez');
      setMaterialTexture(null);
    }
  }, [textureUrl]);

  // Textura de fundal a obiectului
  useEffect(() => {
    if (textureUrl) {
      console.log('🔄 Încărc textura de fundal:', textureUrl);
      const loader = new THREE.TextureLoader();
      loader.load(
        textureUrl,
        (loadedTexture) => {
          console.log('✅ Textură de fundal încărcată:', loadedTexture);
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(1, 1);
          loadedTexture.needsUpdate = true;
          setBackgroundTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.error('❌ Eroare la încărcarea texturii de fundal:', error);
        }
      );
    } else {
      console.log('🗑️ Fără textură de fundal, resetez');
      setBackgroundTexture(null);
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

  useEffect(() => {
    if (backgroundTexture) {
      backgroundTexture.minFilter = THREE.LinearFilter;
      backgroundTexture.magFilter = THREE.LinearFilter;
      backgroundTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      backgroundTexture.colorSpace = THREE.SRGBColorSpace;
      backgroundTexture.needsUpdate = true;
    }
  }, [backgroundTexture, gl]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef} dispose={null}>
      <group position={[0, 0, 0]} scale={[0.15, 0.15, 0.15]}>
        {/* Partea cănții care nu are design personalizat (background) */}
        <mesh geometry={nodes.coffeeMug_1.geometry}>
          {backgroundTexture ? (
            // Dacă avem textură de fundal
            <meshBasicMaterial
              map={backgroundTexture}
              transparent={false}
            />
          ) : (
            // Dacă nu avem textură de fundal, folosim culoarea de fundal
            <meshStandardMaterial
              color={objectColor}
              transparent={false}
            />
          )}
        </mesh>

        {/* Partea principală a cănții (suprafața cilindrică) */}
        <mesh geometry={nodes.coffeeMug_1_1.geometry}>
          {materialTexture ? (
            // Dacă avem textură din bibliotecă
            <meshBasicMaterial
              map={materialTexture}
              transparent={false}
            />
          ) : (
            // Dacă nu avem textură, folosim culoarea
            <meshStandardMaterial
              color={objectColor}
              transparent={false}
            />
          )}
        </mesh>

        {/* Suprafața cilindrică pentru canvas - aplicată ca un cilindru */}
        {texture && (
          <mesh
            geometry={nodes.coffeeMug_1_1.geometry}
            position={[0, 0, 0]}
          >
            <meshBasicMaterial
              map={texture}
              transparent={true}
              side={THREE.DoubleSide}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}

useGLTF.preload('/models/cofee.glb')