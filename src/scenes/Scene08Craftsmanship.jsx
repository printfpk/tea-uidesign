import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { teaMessages } from '../utils/teaMessages'

import leafGlb from '../assets/leaf.glb'
import leaf01Glb from '../assets/leaf-01.glb'
import leaf02Glb from '../assets/leaf-02.glb'

gsap.registerPlugin(ScrollTrigger)

const numLeaves = 150

function LeafSwarm({ gltfPath, scrollRef, baseSeed }) {
  const { nodes } = useGLTF(gltfPath)
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const [hoveredId, setHoveredId] = useState(null)
  const htmlGroupRef = useRef()

  // Find the first mesh in the loaded GLTF dynamically
  const geometry = useMemo(() => {
    const mesh = Object.values(nodes).find(n => n.isMesh)
    return mesh ? mesh.geometry : null
  }, [nodes])

  const material = useMemo(() => {
    const mesh = Object.values(nodes).find(n => n.isMesh)
    return mesh ? mesh.material : null
  }, [nodes])

  const data = useMemo(() => {
    return Array.from({ length: numLeaves }, () => ({
      x: (Math.random() - 0.5) * 30, // Wide spread
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 10 - 2, // Slightly pushed back
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
      scale: Math.random() * 0.8 + 0.4,
      direction: Math.sign(Math.random() - 0.5) || 1 // Left or Right swipe
    }))
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const progress = scrollRef.current // 0 to 1

    // Swipe logic: leaves start moving apart at progress 0.3, max out at 0.5 (faster swipe)
    const swipeMultiplier = Math.max(0, Math.min((progress - 0.3) / 0.2, 1))
    const swipeForce = Math.pow(swipeMultiplier, 2) * 40

    // To track hovered pos purely in the ref
    let currentHoverX = 0
    let currentHoverY = 0

    data.forEach((d, i) => {
      // Drive all motion strictly by scroll progress instead of time
      const scrollTime = progress * 60 // Sped up the ambient spin/float

      const ambientY = Math.sin(scrollTime * d.speed + i) * 1.5
      const ambientX = Math.cos(scrollTime * d.speed * 0.5 + i) * 1.5
      const ambientRot = scrollTime * d.speed * 0.5

      // Apply swipe force
      const currentX = d.x + ambientX + (swipeForce * d.direction)
      const currentRot = d.rx + ambientRot + (swipeForce * 0.1 * d.direction)

      // Apply tilt and massive scale if hovered
      const isHovered = i === hoveredId
      const targetScale = isHovered ? d.scale * 3.5 : d.scale
      const tiltX = isHovered ? Math.PI / 4 : 0

      let finalX = currentX
      let finalY = d.y + ambientY
      let finalZ = d.z

      if (isHovered) {
        currentHoverX = finalX
        currentHoverY = finalY
      }

      // Magnetic Repulsion: Push adjacent leaves away to create a clearing around the giant hovered leaf
      if (hoveredId !== null && !isHovered) {
        // We calculate distance based on the stored base position of the hovered leaf.
        // For simplicity, we just use the d.x/d.y of hoveredId
        const hoveredLeaf = data[hoveredId]
        const hoveredBaseX = hoveredLeaf.x + Math.cos(scrollTime * hoveredLeaf.speed + hoveredId) * 1.5 + (swipeForce * hoveredLeaf.direction)
        const hoveredBaseY = hoveredLeaf.y + Math.sin(scrollTime * hoveredLeaf.speed + hoveredId) * 1.5
        
        const dx = finalX - hoveredBaseX
        const dy = finalY - hoveredBaseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        const repulsionRadius = 6
        if (dist < repulsionRadius && dist > 0.01) {
          // Exponential force curve so leaves gather densely at the edge of the radius
          const force = Math.pow((repulsionRadius - dist) / repulsionRadius, 2)
          const pushStrength = force * 4.5
          
          finalX += (dx / dist) * pushStrength
          finalY += (dy / dist) * pushStrength
        }
      }

      dummy.position.set(finalX, finalY, finalZ)
      dummy.rotation.set(currentRot + tiltX, d.ry + ambientRot, d.rz + ambientRot)
      dummy.scale.setScalar(targetScale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true

    // Update the HTML popup position directly at 60fps without React state updates!
    if (hoveredId !== null && htmlGroupRef.current) {
      htmlGroupRef.current.position.set(currentHoverX, currentHoverY, 0)
    }
  })

  if (!geometry || !material) return null

  return (
    <>
      <instancedMesh 
        ref={meshRef} 
        args={[geometry, material, numLeaves]} 
        castShadow 
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation()
          if (hoveredId !== e.instanceId) {
            setHoveredId(e.instanceId)
          }
        }}
        onPointerOut={(e) => {
          setHoveredId(null)
        }}
      />
      
      {/* HTML Popup perfectly tracks the leaf via the group ref */}
      <group ref={htmlGroupRef}>
        {hoveredId !== null && (
          <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div className="bg-white text-black text-[11px] font-mono leading-relaxed px-4 py-3 rounded-xl border border-gray-200 w-56 text-center shadow-2xl tracking-wide">
              {teaMessages[(hoveredId + baseSeed) % teaMessages.length]}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}

function Scene8Canvas({ scrollRef }) {
  return (
    <>
      <Environment preset="forest" environmentIntensity={0.5} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#c8a96e" />
      
      {/* Three distinct leaf layers using the 3 GLB files, passing a unique seed for the messages */}
      <LeafSwarm gltfPath={leafGlb} scrollRef={scrollRef} baseSeed={0} />
      <LeafSwarm gltfPath={leaf01Glb} scrollRef={scrollRef} baseSeed={20} />
      <LeafSwarm gltfPath={leaf02Glb} scrollRef={scrollRef} baseSeed={40} />
    </>
  )
}

export default function Scene08Craftsmanship() {
  const sectionRef = useRef(null)
  const productRef = useRef(null)
  const textRef = useRef(null)
  const scrollProgressRef = useRef(0)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // Smooth scrubbing
          onUpdate: (self) => {
            // Pass progress to React Three Fiber via ref
            scrollProgressRef.current = self.progress
          }
        }
      })
      // The 3D leaf swipe is driven independently by scrollProgressRef
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ height: '200vh' }}>
      <div className="sticky top-0 w-full overflow-hidden flex items-center justify-center" style={{ height: '100vh', background: '#070707' }}>
        
        {/* 3D Leaf Swarm Layer */}
        {/* REMOVED pointer-events-none SO HOVER ACTUALLY WORKS */}
        <div className="absolute inset-0 z-20">
          <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
            <Scene8Canvas scrollRef={scrollProgressRef} />
          </Canvas>
        </div>

      </div>
    </section>
  )
}

useGLTF.preload(leafGlb)
useGLTF.preload(leaf01Glb)
useGLTF.preload(leaf02Glb)
