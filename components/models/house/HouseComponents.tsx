// Aici sunt declarate toate elementele pentru maparea puzzle-ului casa

import * as THREE from 'three'
import { JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import { div } from 'three/src/nodes/TSL.js'

// tavan
useGLTF.preload('/models/house_puzzle/1.glb');

//  fundatia
useGLTF.preload('/models/house_puzzle/2.glb')

// peretele din spate 
useGLTF.preload('/models/house_puzzle/3.glb');

// peretele din fata
useGLTF.preload('/models/house_puzzle/4.glb');

// peretele din dreapta 

useGLTF.preload('/models/house_puzzle/5.glb');

// usita din stanga
useGLTF.preload('/models/house_puzzle/6.glb');

// usita din dreapta
useGLTF.preload('/models/house_puzzle/7.glb');

// peretele din stanga
useGLTF.preload('/models/house_puzzle/8.glb');

// portita exterioara dreapta
useGLTF.preload('/models/house_puzzle/9.glb');

// portita exterioara stanga

useGLTF.preload('/models/house_puzzle/10.glb')

// perete exterior dreapta

useGLTF.preload('/models/house_puzzle/11.glb')

// perete exterior stanga

useGLTF.preload('/models/house_puzzle/12.glb');

// perete exterior fata


useGLTF.preload('/models/house_puzzle/13.glb')

// fatada casei


useGLTF.preload('/models/house_puzzle/14.glb');

// acoperis partea fata


useGLTF.preload('/models/house_puzzle/15.glb');

// acoperis spate

useGLTF.preload('/models/house_puzzle/16.glb')

// acoperis dreapta

useGLTF.preload('/models/house_puzzle/17.glb')

// acoperis stanga

useGLTF.preload('/models/house_puzzle/18.glb')


// acoperis frontal mic dreapta
useGLTF.preload('/models/house_puzzle/19.glb');

// acoperis frontal mic stanga
useGLTF.preload('/models/house_puzzle/20.glb');

export function Fundation(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/1.glb') as any;
  return (
    <group {...props} dispose={null} >
      <mesh geometry={nodes.Layer_1_curve_002.geometry} material={nodes.Layer_1_curve_002.material} position={[0, 0.877, -3.389]} />
    </group>
  );
};

export function Top(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/2.glb') as any
  console.log("nodes: " + nodes);
  console.log("nodes: " + materials);
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_007.geometry} material={nodes.Layer_1_curve_007.material} position={[3.66, 10.897, 5.454]} rotation={[0, 0, -Math.PI / 2]} />
    </group>
  )
}


export function BackWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/3.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_005.geometry} material={nodes.Layer_1_curve_005.material} position={[0, 2.596, 6.441]} />
    </group>
  )
}

export function FrontWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/4.glb') as any;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_009.geometry} material={nodes.Layer_1_curve_009.material} position={[-0.015, -0.03, 7.996]} />
    </group>
  )
}
export function RightWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/5.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_023.geometry} material={nodes.Layer_1_curve_023.material} position={[-0.015, -0.03, 16.644]} />
    </group>
  )
}
export function LeftDoor(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/6.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes['1'].geometry} material={nodes['1'].material} position={[-0.286, 3.344, -14.169]} />
    </group>
  )
}
export function RightDoor(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/7.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_032.geometry} material={nodes.Layer_1_curve_032.material} position={[7.725, 1.313, 15.208]} />
    </group>
  )
}
export function LeftWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/8.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_027.geometry} material={nodes.Layer_1_curve_027.material} position={[7.687, 1.313, 4.452]} />
    </group>
  )
}

export function OuterRightDoor(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/9.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_024.geometry} material={nodes.Layer_1_curve_024.material} position={[-1.708, 1.071, 1.718]} />
    </group>
  )
}
export function OuterLeftDoor(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/10.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_025.geometry} material={nodes.Layer_1_curve_025.material} position={[-1.708, 1.071, 11.957]} />
    </group>
  )
}
export function OuterRightWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/11.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_037.geometry} material={nodes.Layer_1_curve_037.material} position={[0, 0, -4.647]} />
    </group>
  )
}
export function OuterLeftWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/12.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_052.geometry} material={nodes.Layer_1_curve_052.material} position={[14.342, 0, 15.722]} />
    </group>
  )
}
export function OuterFrontWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/13.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_018.geometry} material={nodes.Layer_1_curve_018.material} position={[1.672, 1.071, 7.419]} />
    </group>
  )
}
export function HouseFront(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/14.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_016.geometry} material={nodes.Layer_1_curve_016.material} position={[1.672, 1.071, 5.414]} />
    </group>
  )
}
export function FrontRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/15.glb') as any;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_098.geometry} material={nodes.Layer_1_curve_098.material} position={[0, 0, -26.876]} />
    </group>
  )
}
export function RightRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/17.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_115.geometry} material={nodes.Layer_1_curve_115.material} position={[0, 12.716, -10.211]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  )
}
export function BackRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/16.glb') as any;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_133.geometry} material={nodes.Layer_1_curve_133.material} position={[3.969, 0.016, -4.444]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
    </group>
  )
}
export function LeftRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/18.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_157.geometry} material={nodes.Layer_1_curve_157.material} position={[3.969, 0.016, 7.115]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} />
    </group>
  )
}
export function FrontalLittleRightRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/19.glb') as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_166.geometry} material={nodes.Layer_1_curve_166.material} position={[3.917, -0.073, 13.109]} rotation={[0, 0, -0.006]} />
    </group>
  )
};
export function FrontalLittleLeftRoof(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/house_puzzle/20.glb') as any;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Layer_1_curve_165.geometry} material={nodes.Layer_1_curve_165.material} position={[0, 0.035, -1.225]} />
    </group>
  )
};
