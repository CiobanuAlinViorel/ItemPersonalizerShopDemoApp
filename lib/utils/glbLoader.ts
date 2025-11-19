import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from "three"
import { PuzzlePiece } from '../collection/puzzle';
export async function loadGLB(path: string): Promise<THREE.Object3D> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => resolve(gltf.scene), // ✅ trebuie să returneze gltf.scene
            undefined,
            reject
        );
    });
}

export async function loadPuzzlePieces(pieces: PuzzlePiece[]) {
    const results = [];
    for (const piece of pieces) {
        const model = await loadGLB(piece.glb);
        results.push(model); // ✅ DOAR obiectul Three.js
    }
    return results;
}

export async function loadGLBOnCenter(path: string): Promise<THREE.Object3D> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;

                // ---- 1. Calculează bounding box ----
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());

                // ---- 2. Repoziționează modelul astfel încât centrul să fie la (0,0,0) ----
                model.position.sub(center);

                // (opțional) Recalculează bounding box după mutare
                box.setFromObject(model);

                resolve(model);
            },
            undefined,
            reject
        );
    });
}

export function getDefaultTargetFromGLB(root: THREE.Object3D): THREE.Vector3 {
    let mesh: THREE.Mesh | null = null;

    root.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
            mesh = child;
        }
    });

    const pos = new THREE.Vector3();
    if (mesh) mesh.getWorldPosition(pos);

    return pos;
}

