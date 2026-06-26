'use client'

import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Preload at module level so the browser starts fetching the GLB immediately
useGLTF.preload('/silla.glb')

export default function Chair() {
  const { scene } = useGLTF('/silla.glb')

  useEffect(() => {
    // Enable shadows on every mesh in the model
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [scene])

  return <primitive object={scene} />
}
