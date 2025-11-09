import * as THREE from 'three';
// parse OBJS 
export function parseOBJ(objText: string): THREE.BufferGeometry {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const vertices: [number, number, number][] = [];
    const textureCoords: [number, number][] = [];
    const normalVecs: [number, number, number][] = [];
    const lines = objText.split('\n');

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            vertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (parts[0] === 'vt') {
            textureCoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
        } else if (parts[0] === 'vn') {
            normalVecs.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (parts[0] === 'f') {
            const faceVertices = [];
            for (let i = 1; i < parts.length; i++) faceVertices.push(parts[i]);
            const triangles = faceVertices.length === 4 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]];

            for (const tri of triangles) {
                for (const idx of tri) {
                    const indices = faceVertices[idx].split('/');
                    const vIdx = parseInt(indices[0]) - 1;
                    const vtIdx = indices[1] ? parseInt(indices[1]) - 1 : -1;
                    const vnIdx = indices[2] ? parseInt(indices[2]) - 1 : -1;
                    if (vIdx >= 0 && vIdx < vertices.length) positions.push(...vertices[vIdx]);
                    if (vtIdx >= 0 && vtIdx < textureCoords.length) uvs.push(...textureCoords[vtIdx]);
                    if (vnIdx >= 0 && vnIdx < normalVecs.length) normals.push(...normalVecs[vnIdx]);
                }
            }
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (uvs.length > 0) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    if (normals.length > 0) geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    else geometry.computeVertexNormals();

    return geometry;
}