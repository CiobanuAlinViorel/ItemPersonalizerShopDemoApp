import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export interface GLBCapabilities {
    hasMultipleMeshes: boolean;
    hasMaterials: boolean;
    hasUVMapping: boolean;
    hasNamedParts: boolean;
    editableParts: Array<{
        name: string;
        meshName: string;
        materialType: string;
        hasUV: boolean;
        canChangeColor: boolean;
        canChangeTexture: boolean;
        canChangeMetal: boolean;
        canChangeRoughness: boolean;
    }>;
    materialTypes: string[];
    totalMeshes: number;
    boundingBox?: THREE.Box3;
}

export interface ParsedGLBModel {
    scene: THREE.Group;
    meshes: THREE.Mesh[];
    capabilities: GLBCapabilities;
    animations?: THREE.AnimationClip[];
}

/**
 * Analizează capabilitățile unui model GLB încărcat
 */
export function analyzeGLBCapabilities(gltf: any): GLBCapabilities {
    const capabilities: GLBCapabilities = {
        hasMultipleMeshes: false,
        hasMaterials: false,
        hasUVMapping: false,
        hasNamedParts: false,
        editableParts: [],
        materialTypes: [],
        totalMeshes: 0,
        boundingBox: new THREE.Box3()
    };

    const materialTypeSet = new Set<string>();
    const meshes: THREE.Mesh[] = [];

    gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
            meshes.push(child);
            capabilities.totalMeshes++;
            capabilities.hasMaterials = true;

            // Verifică UV mapping
            const hasUV = child.geometry.attributes.uv !== undefined;
            if (hasUV) {
                capabilities.hasUVMapping = true;
            }

            // Verifică dacă meshul are nume
            const meshName = child.name || `mesh_${capabilities.totalMeshes}`;
            if (child.name && child.name.trim() !== '') {
                capabilities.hasNamedParts = true;
            }

            // Analizează materialul
            const material = child.material;
            if (material) {
                materialTypeSet.add(material.type);

                const editablePart = {
                    name: meshName,
                    meshName: meshName,
                    materialType: material.type,
                    hasUV: hasUV,
                    canChangeColor: true, // Aproape toate materialele suportă culoare
                    canChangeTexture: hasUV,
                    canChangeMetal: material.metalness !== undefined,
                    canChangeRoughness: material.roughness !== undefined
                };

                capabilities.editableParts.push(editablePart);
            }

            // Update bounding box
            if (capabilities.boundingBox) {
                child.geometry.computeBoundingBox();
                if (child.geometry.boundingBox) {
                    capabilities.boundingBox.union(child.geometry.boundingBox);
                }
            }
        }
    });

    capabilities.materialTypes = Array.from(materialTypeSet);
    capabilities.hasMultipleMeshes = meshes.length > 1;

    return capabilities;
}

/**
 * Încarcă și parsează un fișier GLB
 */
export async function parseGLB(url: string): Promise<ParsedGLBModel> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (gltf) => {
                const meshes: THREE.Mesh[] = [];

                gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        meshes.push(child);
                    }
                });

                const capabilities = analyzeGLBCapabilities(gltf);

                const parsedModel: ParsedGLBModel = {
                    scene: gltf.scene,
                    meshes: meshes,
                    capabilities: capabilities,
                    animations: gltf.animations
                };

                resolve(parsedModel);
            },
            (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                console.log(`Loading GLB: ${percentComplete.toFixed(2)}%`);
            },
            (error) => {
                console.error('Error loading GLB:', error);
                reject(error);
            }
        );
    });
}

/**
 * Modifică culoarea unui mesh specific sau a întregului model
 */
export function changeGLBColor(
    model: ParsedGLBModel,
    color: string | THREE.Color,
    meshName?: string
): void {
    const targetColor = typeof color === 'string' ? new THREE.Color(color) : color;

    if (meshName) {
        // Modifică doar un mesh specific
        const mesh = model.meshes.find(m => m.name === meshName);
        if (mesh && mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    if ((mat as THREE.MeshStandardMaterial).color) (mat as THREE.MeshStandardMaterial).color.copy(targetColor);
                });
            } else if ((mesh.material as THREE.MeshStandardMaterial).color) {
                (mesh.material as THREE.MeshStandardMaterial).color.copy(targetColor);
            }
        }
    } else {
        // Modifică toate mesh-urile
        model.meshes.forEach(mesh => {
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => {
                        if ((mat as THREE.MeshStandardMaterial).color) (mat as THREE.MeshStandardMaterial).color.copy(targetColor);
                    });
                } else if ((mesh.material as THREE.MeshStandardMaterial).color) {
                    (mesh.material as THREE.MeshStandardMaterial).color.copy(targetColor);
                }
            }
        });
    }
}

/**
 * Modifică textura unui mesh specific sau a întregului model
 */
export function changeGLBTexture(
    model: ParsedGLBModel,
    textureUrl: string,
    meshName?: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
            textureUrl,
            (texture) => {
                if (meshName) {
                    const mesh = model.meshes.find(m => m.name === meshName);
                    if (mesh && mesh.material) {
                        if (Array.isArray(mesh.material)) {
                            mesh.material.forEach(mat => {
                                (mat as THREE.MeshStandardMaterial).map = texture;
                                mat.needsUpdate = true;
                            });
                        } else {
                            (mesh.material as THREE.MeshStandardMaterial).map = texture;
                            mesh.material.needsUpdate = true;
                        }
                    }
                } else {
                    model.meshes.forEach(mesh => {
                        if (mesh.material) {
                            if (Array.isArray(mesh.material)) {
                                mesh.material.forEach(mat => {
                                    (mat as THREE.MeshStandardMaterial).map = texture;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                (mesh.material as THREE.MeshStandardMaterial).map = texture;
                                mesh.material.needsUpdate = true;
                            }
                        }
                    });
                }
                resolve();
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
                reject(error);
            }
        );
    });
}

/**
 * Modifică proprietățile PBR (metalness, roughness) ale unui material
 */
export function changeGLBMaterialProperties(
    model: ParsedGLBModel,
    properties: {
        metalness?: number;
        roughness?: number;
        emissive?: string | THREE.Color;
        emissiveIntensity?: number;
    },
    meshName?: string
): void {
    const applyProperties = (material: any) => {
        if (properties.metalness !== undefined && material.metalness !== undefined) {
            material.metalness = properties.metalness;
        }
        if (properties.roughness !== undefined && material.roughness !== undefined) {
            material.roughness = properties.roughness;
        }
        if (properties.emissive && material.emissive) {
            const emissiveColor = typeof properties.emissive === 'string'
                ? new THREE.Color(properties.emissive)
                : properties.emissive;
            material.emissive.copy(emissiveColor);
        }
        if (properties.emissiveIntensity !== undefined && material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = properties.emissiveIntensity;
        }
        material.needsUpdate = true;
    };

    if (meshName) {
        const mesh = model.meshes.find(m => m.name === meshName);
        if (mesh && mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(applyProperties);
            } else {
                applyProperties(mesh.material);
            }
        }
    } else {
        model.meshes.forEach(mesh => {
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(applyProperties);
                } else {
                    applyProperties(mesh.material);
                }
            }
        });
    }
}

/**
 * Centrează și scalează modelul GLB
 */
export function centerAndScaleGLB(
    model: ParsedGLBModel,
    targetSize: number = 6
): void {
    const box = new THREE.Box3().setFromObject(model.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Centrează
    model.scene.position.sub(center);

    // Scalează
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = targetSize / maxDim;
    model.scene.scale.setScalar(scale);
}

/**
 * Obține lista tuturor mesh-urilor editabile cu informații detaliate
 */
export function getEditableMeshes(model: ParsedGLBModel): Array<{
    name: string;
    mesh: THREE.Mesh;
    canEdit: {
        color: boolean;
        texture: boolean;
        metalness: boolean;
        roughness: boolean;
    };
}> {
    return model.meshes.map(mesh => {
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;

        return {
            name: mesh.name || 'Unnamed',
            mesh: mesh,
            canEdit: {
                color: (material as THREE.MeshStandardMaterial).color !== undefined,
                texture: mesh.geometry.attributes.uv !== undefined,
                metalness: (material as THREE.MeshStandardMaterial).metalness !== undefined,
                roughness: (material as THREE.MeshStandardMaterial).roughness !== undefined
            }
        };
    });
}

/**
 * Clonează un model GLB pentru a permite modificări multiple
 */
export function cloneGLBModel(model: ParsedGLBModel): ParsedGLBModel {
    const clonedScene = model.scene.clone(true);
    const clonedMeshes: THREE.Mesh[] = [];

    clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            clonedMeshes.push(child);
        }
    });

    return {
        scene: clonedScene,
        meshes: clonedMeshes,
        capabilities: { ...model.capabilities },
        animations: model.animations
    };
}