// components/models/House.tsx
'use client'
import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'

export function House(props: any) {
  const { nodes, materials } = useGLTF('/models/house.glb') as any
  const { onMeshClick, selectedIds = [], ...groupProps } = props

  // Material pentru selecție
  const selectedMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    emissive: 0xff0000,
    emissiveIntensity: 0.5
  })

  const createMeshProps = (id: string, node: any, material: any, position: any, rotation?: any) => {
    const isSelected = selectedIds.includes(id)

    return {
      geometry: node.geometry,
      material: isSelected ? selectedMaterial : material,
      position,
      rotation,
      onClick: (e: any) => {
        e.stopPropagation()
        onMeshClick?.({ id, node, position, rotation })
      },
      onPointerOver: (e: any) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        document.body.style.cursor = 'default'
      }
    }
  }

  return (
    <group {...groupProps} dispose={null} scale={0.4}>
      {/* Walls */}
      <mesh {...createMeshProps('wall_1', nodes.Layer_1_curve_001, materials['Material.002'], [0, 0.877, -3.389])} />
      <mesh {...createMeshProps('wall_2', nodes.Layer_1_curve_005, materials['Material.002'], [0, 2.596, 6.441])} />
      <mesh {...createMeshProps('wall_3', nodes.Layer_1_curve_007, materials['Material.002'], [3.66, 10.897, 5.454], [0, 0, -Math.PI / 2])} />
      <mesh {...createMeshProps('wall_4', nodes.Layer_1_curve_023, materials['Material.002'], [-0.015, -0.03, 16.644])} />

      {/* Roof */}
      <mesh {...createMeshProps('roof_1', nodes.Layer_1_curve_013, materials['Slate Roof Tiles.001'], [0, 0.035, -1.225])} />
      <mesh {...createMeshProps('roof_2', nodes.Layer_1_curve_014, materials['Slate Roof Tiles.001'], [3.917, -0.073, 13.109], [0, 0, -0.006])} />
      <mesh {...createMeshProps('roof_3', nodes.Layer_1_curve_019, materials['Slate Roof Tiles'], [0, 0, -26.876])} />
      <mesh {...createMeshProps('roof_4', nodes.Layer_1_curve_020, materials['Slate Roof Tiles'], [0, 12.716, -10.211], [0, 0, Math.PI / 2])} />
      <mesh {...createMeshProps('roof_5', nodes.Layer_1_curve_021, materials['Slate Roof Tiles'], [3.969, 0.016, -4.444], [-Math.PI / 2, Math.PI / 2, 0])} />
      <mesh {...createMeshProps('roof_6', nodes.Layer_1_curve_009, materials['Slate Roof Tiles'], [3.969, 0.016, 7.115], [-Math.PI / 2, Math.PI / 2, 0])} />

      {/* Windows */}
      <mesh {...createMeshProps('window_1', nodes.Layer_1_curve_012, materials['Material.001'], [1.672, 1.071, 5.414])} />
      <mesh {...createMeshProps('window_2', nodes.Layer_1_curve_006, materials['Material.001'], [1.672, 1.071, 7.419])} />
      <mesh {...createMeshProps('window_3', nodes.Layer_1_curve_024, materials['Material.001'], [-1.708, 1.071, 1.718])} />
      <mesh {...createMeshProps('window_4', nodes.Layer_1_curve_025, materials['Material.001'], [-1.606, 1.071, 11.861])} />
      <mesh {...createMeshProps('window_5', nodes.Layer_1_curve_018, materials['Material.001'], [14.342, 0, 15.722])} />
      <mesh {...createMeshProps('window_6', nodes.Layer_1_curve_026, materials['Material.001'], [7.725, 1.313, 15.208])} />

      {/* Foundation */}
      <mesh {...createMeshProps('foundation', nodes.Layer_1_curve_004, materials.Concrete, [-0.015, -0.03, 7.996])} />

      {/* Other */}
      <mesh {...createMeshProps('main', nodes['1'], nodes['1'].material, [-0.286, 3.344, -14.169])} />
      <mesh {...createMeshProps('decoration_1', nodes.Layer_1_curve_003, nodes.Layer_1_curve_003.material, [4.021, 4.44, 17.328])} />
      <mesh {...createMeshProps('decoration_2', nodes.Layer_1_curve_015, materials['Material.003'], [7.687, 1.313, 4.452])} />
      <mesh {...createMeshProps('decoration_3', nodes.Layer_1_curve_017, nodes.Layer_1_curve_017.material, [3.934, 4.44, -30.869])} />
    </group>
  )
}

useGLTF.preload('/models/house.glb')