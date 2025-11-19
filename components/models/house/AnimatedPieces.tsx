'use client'
import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import gsap from "gsap"
import * as THREE from "three"

export function AnimatedPiece({ models, finalPosition }: { models: any[], finalPosition: any }) {
    const ref = useRef<THREE.Object3D>(null)

    useEffect(() => {
        if (!ref.current) return

        // PIESA PORNEȘTE DINTR-O ZONĂ AFARĂ DIN SCENĂ
        ref.current.position.set(finalPosition[0], finalPosition[1] + 5, finalPosition[2] + 5)
        ref.current.rotation.set(0, 0, 0)

        // ANIMAȚIE DE TRANZIȚIE ÎN POZIȚIA FINALĂ
        gsap.to(ref.current.position, {
            x: finalPosition[0],
            y: finalPosition[1],
            z: finalPosition[2],
            duration: 1.3,
            ease: "power3.out"
        })

        // ANIMAȚIE DE ROTIRE UȘOARĂ
        gsap.to(ref.current.rotation, {
            y: Math.PI * 2,
            duration: 1.3,
            ease: "power2.out"
        })

    }, [finalPosition])

    return (
        {

        }
    )
}
