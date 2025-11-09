import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { saveAs } from 'file-saver';

/**
 * Exportă canvas-ul 2D Konva ca imagine PNG
 * @param stageRef - Referință către stage-ul Konva
 * @param fileName - Numele fișierului (default: 'design')
 * @returns Promise<string> - URL-ul imaginii generate
 */
export const exportToPNG = async (
    stageRef: any,
    fileName: string = 'design'
): Promise<string> => {
    try {
        if (!stageRef || !stageRef.current) {
            throw new Error('Stage reference is null');
        }

        // Obține dataURL din Konva stage
        const dataURL = stageRef.current.toDataURL({
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 2, // High DPI pentru calitate mai bună
        });

        // Convertește dataURL în Blob
        const blob = await (await fetch(dataURL)).blob();

        // Salvează fișierul
        const timestamp = Date.now();
        const fullFileName = `${fileName}_${timestamp}.png`;
        saveAs(blob, fullFileName);

        console.log(`✅ PNG exportat: ${fullFileName}`);
        return dataURL;
    } catch (error) {
        console.error('❌ Eroare la exportul PNG:', error);
        throw error;
    }
};

/**
 * Exportă scena Three.js ca fișier GLB
 * @param scene - Scena Three.js de exportat
 * @param fileName - Numele fișierului (default: 'model')
 * @returns Promise<void>
 */
export const exportToGLB = async (
    scene: THREE.Scene | THREE.Object3D,
    fileName: string = 'model'
): Promise<void> => {
    try {
        if (!scene) {
            throw new Error('Scene is null');
        }

        const exporter = new GLTFExporter();

        return new Promise((resolve, reject) => {
            exporter.parse(
                scene,
                (gltf) => {
                    // Convertește rezultatul în Blob
                    const blob = new Blob([gltf as ArrayBuffer], {
                        type: 'model/gltf-binary',
                    });

                    // Salvează fișierul
                    const timestamp = Date.now();
                    const fullFileName = `${fileName}_${timestamp}.glb`;
                    saveAs(blob, fullFileName);

                    console.log(`✅ GLB exportat: ${fullFileName}`);
                    resolve();
                },
                (error) => {
                    console.error('❌ Eroare la exportul GLB:', error);
                    reject(error);
                },
                {
                    binary: true, // Exportă ca GLB (binar) nu GLTF (JSON)
                    onlyVisible: true, // Exportă doar obiectele vizibile
                    truncateDrawRange: true,
                    maxTextureSize: 4096, // Limitează dimensiunea texturilor
                }
            );
        });
    } catch (error) {
        console.error('❌ Eroare la exportul GLB:', error);
        throw error;
    }
};

/**
 * Exportă screenshot din canvas-ul Three.js ca PNG
 * @param renderer - Renderer-ul Three.js
 * @param fileName - Numele fișierului (default: '3d-preview')
 * @returns Promise<string> - URL-ul imaginii generate
 */
export const exportThreeCanvasToPNG = async (
    renderer: THREE.WebGLRenderer,
    fileName: string = '3d-preview'
): Promise<string> => {
    try {
        if (!renderer) {
            throw new Error('Renderer is null');
        }

        // Obține dataURL din canvas-ul Three.js
        const canvas = renderer.domElement;
        const dataURL = canvas.toDataURL('image/png', 1.0);

        // Convertește în Blob și salvează
        const blob = await (await fetch(dataURL)).blob();
        const timestamp = Date.now();
        const fullFileName = `${fileName}_${timestamp}.png`;
        saveAs(blob, fullFileName);

        console.log(`✅ 3D Preview PNG exportat: ${fullFileName}`);
        return dataURL;
    } catch (error) {
        console.error('❌ Eroare la exportul 3D canvas PNG:', error);
        throw error;
    }
};

/**
 * Exportă ambele formate simultan (PNG + GLB)
 * @param stageRef - Referință Konva stage pentru PNG
 * @param scene - Scena Three.js pentru GLB
 * @param productName - Numele produsului
 * @returns Promise<{ pngURL: string, glbExported: boolean }>
 */
export const exportBoth = async (
    stageRef: any,
    scene: THREE.Scene | THREE.Object3D,
    productName: string = 'product'
): Promise<{ pngURL: string; glbExported: boolean }> => {
    try {
        console.log('🚀 Începe exportul combinat...');

        // Export paralel pentru viteză
        const [pngURL] = await Promise.all([
            exportToPNG(stageRef, productName),
            exportToGLB(scene, productName),
        ]);

        console.log('✅ Export combinat finalizat cu succes!');

        return {
            pngURL,
            glbExported: true,
        };
    } catch (error) {
        console.error('❌ Eroare la exportul combinat:', error);
        throw error;
    }
};

/**
 * Generează thumbnail din canvas Konva
 * @param stageRef - Referință Konva stage
 * @param maxWidth - Lățimea maximă a thumbnail-ului
 * @param maxHeight - Înălțimea maximă a thumbnail-ului
 * @returns string - DataURL al thumbnail-ului
 */
export const generateThumbnail = (
    stageRef: any,
    maxWidth: number = 300,
    maxHeight: number = 300
): string => {
    try {
        if (!stageRef || !stageRef.current) {
            throw new Error('Stage reference is null');
        }

        const stage = stageRef.current;
        const scale = Math.min(
            maxWidth / stage.width(),
            maxHeight / stage.height()
        );

        const dataURL = stage.toDataURL({
            mimeType: 'image/png',
            quality: 0.8,
            pixelRatio: scale,
        });

        return dataURL;
    } catch (error) {
        console.error('❌ Eroare la generarea thumbnail:', error);
        return '';
    }
};

/**
 * Salvează configurația produsului ca JSON
 * @param config - Obiect de configurație
 * @param fileName - Numele fișierului
 */
export const exportConfigToJSON = (
    config: any,
    fileName: string = 'product-config'
): void => {
    try {
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const timestamp = Date.now();
        const fullFileName = `${fileName}_${timestamp}.json`;

        saveAs(blob, fullFileName);
        console.log(`✅ Configurație JSON exportată: ${fullFileName}`);
    } catch (error) {
        console.error('❌ Eroare la exportul JSON:', error);
        throw error;
    }
};