'use client'
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export function ArrowIndicator({ target }) {
    const arrowRef = useRef<THREE.ArrowHelper>(null)
    const blink = useRef(0)

    const direction = new THREE.Vector3(0, 1, 0) // direcție în jos
    const origin = new THREE.Vector3(target[0], target[1] + 2, target[2])

    useEffect(() => {
        arrowRef.current?.setDirection(direction)
        arrowRef.current?.setLength(1.5)
        arrowRef.current?.position.set(origin.x, origin.y, origin.z)
    }, [target])

    useFrame((_, delta) => {
        blink.current += delta * 3
        const opacity = Math.abs(Math.sin(blink.current))
        if (arrowRef.current) {
            (arrowRef.current.cone.material as any).opacity = opacity as any
            (arrowRef.current.line.material as any).opacity = opacity
        }
    })

    return (
        <arrowHelper
            ref={arrowRef}
            args={[direction, origin, 1.5, "yellow"]}
        />
    )
}
