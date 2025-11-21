import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from "three"
import { PuzzlePiece } from '../collection/puzzle';

// 🎯 OPTIMIZARE: GLB Cache Global (similar cu SVG Cache)
class GLBCache {
    private cache: Map<string, THREE.Object3D> = new Map(); // URL -> loaded scene
    private loadingPromises: Map<string, Promise<THREE.Object3D>> = new Map();
    private loader: GLTFLoader = new GLTFLoader();

    // Verifică dacă GLB-ul e în cache
    has(url: string): boolean {
        return this.cache.has(url);
    }

    // Obține din cache (returnează clonă pentru a evita mutarea obiectului cached)
    get(url: string): THREE.Object3D | undefined {
        const cached = this.cache.get(url);
        return cached ? cached.clone(true) : undefined;
    }

    // Încarcă GLB cu deduplication
    async load(url: string, signal?: AbortSignal): Promise<THREE.Object3D> {
        // Dacă e în cache, returnează clonă instant
        if (this.cache.has(url)) {
            console.log(`✅ GLB Cache HIT: ${url.split('/').pop()}`);
            const cached = this.cache.get(url)!;
            return cached.clone(true);
        }

        // Dacă e în curs de încărcare, așteaptă promise-ul existent
        if (this.loadingPromises.has(url)) {
            console.log(`⏳ GLB already loading: ${url.split('/').pop()}`);
            const result = await this.loadingPromises.get(url)!;
            return result.clone(true);
        }

        console.log(`📥 GLB Cache MISS - Loading: ${url.split('/').pop()}`);

        // Creează promise nou
        const loadPromise = this.loadGLBInternal(url, signal);
        this.loadingPromises.set(url, loadPromise);

        try {
            const result = await loadPromise;
            if (!signal?.aborted) {
                // Salvează în cache doar dacă nu a fost anulatǎ încărcarea
                this.cache.set(url, result);
                console.log(`💾 GLB Cached: ${url.split('/').pop()} (Total: ${this.cache.size})`);
            }
            return result.clone(true);
        } finally {
            this.loadingPromises.delete(url);
        }
    }

    // Încarcă efectiv GLB-ul (intern)
    private async loadGLBInternal(url: string, signal?: AbortSignal): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error('Aborted'));
                return;
            }

            const onAbort = () => {
                reject(new Error('Aborted'));
            };

            signal?.addEventListener('abort', onAbort);

            this.loader.load(
                url,
                (gltf) => {
                    signal?.removeEventListener('abort', onAbort);
                    const model = gltf.scene;

                    // Optimizări pe model pentru performanță
                    model.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                            child.receiveShadow = false;
                            child.frustumCulled = true;

                            if (child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(mat => {
                                        mat.needsUpdate = false;
                                    });
                                } else {
                                    child.material.needsUpdate = false;
                                }
                            }
                        }
                    });

                    resolve(model);
                },
                undefined,
                (error) => {
                    signal?.removeEventListener('abort', onAbort);
                    console.error(`Error loading GLB ${url}:`, error);
                    reject(error);
                }
            );
        });
    }

    // Încarcă GLB centrat (pentru PieceView)
    async loadCentered(url: string, signal?: AbortSignal): Promise<THREE.Object3D> {
        // Încarcă cu cache
        const model = await this.load(url, signal);

        // Centrează modelul (modifică clona, nu originalul din cache)
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        return model;
    }

    // Clear cache
    clear(): void {
        // Dispose geometries și materials
        this.cache.forEach((model) => {
            model.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry?.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material?.dispose();
                    }
                }
            });
        });

        this.cache.clear();
        this.loadingPromises.clear();
    }

    size(): number {
        return this.cache.size;
    }

    getStats() {
        return {
            cached: this.cache.size,
            loading: this.loadingPromises.size
        };
    }
}

// Singleton global
const glbCache = new GLBCache();

// 🎯 OPTIMIZARE: Funcții originale dar cu cache
export async function loadGLB(path: string): Promise<THREE.Object3D> {
    return glbCache.load(path);
}

export async function loadPuzzlePieces(pieces: PuzzlePiece[], signal?: AbortSignal) {
    const loadPromises = pieces.map(piece =>
        glbCache.load(piece.glb, signal)
    );

    try {
        const results = await Promise.all(loadPromises);
        return results;
    } catch (error: any) {
        if (error.message !== 'Aborted') {
            console.error('Error loading puzzle pieces:', error);
        }
        return [];
    }
}

export async function loadGLBOnCenter(path: string): Promise<THREE.Object3D> {
    return glbCache.loadCentered(path);
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

// Export pentru debugging și stats
export const getGLBCacheStats = () => glbCache.getStats();
export const clearGLBCache = () => glbCache.clear();