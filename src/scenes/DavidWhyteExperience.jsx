import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, useFBO, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import texPaperUrl from '../davidwhyte/texture (1).jpg'
import texAtlasUrl from '../davidwhyte/texture.jpg'
import texMaskUrl from '../davidwhyte/texture_mask.jpg'
import texNoiseUrl from '../davidwhyte/noise.jpeg'
import texFractalUrl from '../davidwhyte/rgb-fractal.png'

gsap.registerPlugin(ScrollTrigger)

// --- SHADERS ---

// 1. Simulation Shader (FBO Ping Pong)
const simVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const simFragmentShader = `
  uniform sampler2D uPrev;
  uniform sampler2D uNoise;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  void main() {
    vec4 prev = texture2D(uPrev, vUv);
    // Slower decay for a long "comet" tail
    float decay = 0.99; 
    float mask = prev.r * decay;
    
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uvAspect = vUv * aspect;
    vec2 mouseAspect = uMouse * aspect;
    
    float dist = distance(uvAspect, mouseAspect);
    vec4 noise = texture2D(uNoise, vUv * 2.0 + uTime * 0.1);
    
    float baseBrushSize = 0.20; // Slightly larger comet head
    float distortedDist = dist + (noise.r * 0.05);
    
    float brush = 1.0 - smoothstep(baseBrushSize * 0.5, baseBrushSize, distortedDist);
    mask = clamp(mask + brush, 0.0, 1.0);
    
    gl_FragColor = vec4(mask, mask, mask, 1.0);
  }
`

// 2. Atlas Element Shader (Composites paper + atlas + fbo mask)
const atlasVertexShader = `
  varying vec2 vUv;
  varying vec2 vScreenUv;
  void main() {
    vUv = uv;
    vec4 clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // Calculate screen space UVs for sampling the full-screen FBO mask
    vScreenUv = (clipSpace.xy / clipSpace.w) * 0.5 + 0.5;
    gl_Position = clipSpace;
  }
`

const atlasFragmentShader = `
  uniform sampler2D uAtlas;
  uniform sampler2D uAtlasMask;
  uniform sampler2D uTrail;
  uniform sampler2D uFractal;
  
  uniform vec2 uUvOffset;
  uniform vec2 uUvScale;
  
  varying vec2 vUv;
  varying vec2 vScreenUv;

  void main() {
    // 1. Map local UV to atlas UV
    vec2 atlasUv = (vUv * uUvScale) + uUvOffset;
    
    // 2. Sample FBO trail in screen space (The Comet)
    float trail = texture2D(uTrail, vScreenUv).r;
    
    // 3. Fractal Noise for jagged edges and oil painting displacement
    vec4 fractal = texture2D(uFractal, atlasUv * 8.0);
    
    // 4. Comet reveal mask
    float revealEdge = smoothstep(0.2, 0.6, trail + (fractal.r - 0.5) * 0.3);
    
    // 5. "Oil Painting" effect via UV distortion.
    // The distortion is strong when trail is 0, and disappears (sharpens) when the comet passes over.
    float distortionStrength = (1.0 - revealEdge) * 0.02;
    vec2 distortedAtlasUv = atlasUv + (fractal.xy - 0.5) * distortionStrength;
    
    // Sample the image using the distorted UVs
    vec4 painting = texture2D(uAtlas, distortedAtlasUv);
    vec4 paintingMask = texture2D(uAtlasMask, distortedAtlasUv);
    
    // 6. Base visibility 60%, comet reveals the remaining 40%
    float alphaBlend = 0.6 + (0.4 * revealEdge);
    
    // Final Alpha
    float finalAlpha = alphaBlend * paintingMask.r;
    
    gl_FragColor = vec4(painting.rgb, finalAlpha);
  }
`

// --- COMPONENTS ---

const AtlasElement = ({
  textureAtlas, textureMask, textureTrail, textureFractal,
  uvOffset, uvScale,
  basePositionX, basePositionY, zIndex,
  scaleMultiplier,
  parallaxSpeed,
  scrollRange,
  scrollRef
}) => {
  const meshRef = useRef()
  const { viewport } = useThree()

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: atlasVertexShader,
    fragmentShader: atlasFragmentShader,
    transparent: true,
    uniforms: {
      uAtlas: { value: textureAtlas },
      uAtlasMask: { value: textureMask },
      uTrail: { value: textureTrail },
      uFractal: { value: textureFractal },
      uUvOffset: { value: new THREE.Vector2(...uvOffset) },
      uUvScale: { value: new THREE.Vector2(...uvScale) }
    }
  }), [textureAtlas, textureMask, textureTrail, textureFractal, uvOffset, uvScale])

  useFrame(() => {
    if (meshRef.current) {
      const p = scrollRef.current || 0
      const [start, end] = scrollRange || [0, 1]

      const localProgress = (p - start) / (end - start)

      // Strict visibility culling to prevent cross-scene overlap
      if (localProgress < -0.3 || localProgress > 1.3) {
        meshRef.current.visible = false
      } else {
        meshRef.current.visible = true

        const startX = viewport.width * basePositionX
        const startY = viewport.height * basePositionY

        // Calculate parallax relative to the scene's start time
        const scrollOffset = (p - start) * viewport.width * parallaxSpeed

        meshRef.current.position.x = startX - scrollOffset
        meshRef.current.position.y = startY
        meshRef.current.position.z = zIndex

        material.uniforms.uUvOffset.value.set(uvOffset[0], uvOffset[1])
      }
    }
  })

  const objectHeight = viewport.height * scaleMultiplier
  const uvAspectRatio = uvScale[0] / uvScale[1]
  const objectWidth = objectHeight * uvAspectRatio

  return (
    <mesh ref={meshRef} scale={[objectWidth, objectHeight, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const WebGLScene = ({ scrollYProgress, mouse }) => {
  const { gl, size, camera, viewport } = useThree()

  const [
    texPaper, texAtlas, texMask, texNoise, texFractal
  ] = useTexture([
    texPaperUrl, texAtlasUrl, texMaskUrl, texNoiseUrl, texFractalUrl
  ])

  const options = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  }
  const targetA = useFBO(size.width, size.height, options)
  const targetB = useFBO(size.width, size.height, options)
  const targetRef = useRef({ read: targetA, write: targetB })

  const simScene = useMemo(() => new THREE.Scene(), [])
  // Dedicated camera to ensure the 2x2 plane fills the FBO perfectly
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const simMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: simVertexShader,
    fragmentShader: simFragmentShader,
    uniforms: {
      uPrev: { value: null },
      uNoise: { value: texNoise },
      uMouse: { value: mouse.current },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) }
    }
  }), [texNoise, size])

  useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial)
    simScene.add(mesh)
  }, [simScene, simMaterial])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    simMaterial.uniforms.uTime.value = time
    simMaterial.uniforms.uMouse.value.copy(mouse.current)
    simMaterial.uniforms.uPrev.value = targetRef.current.read.texture
    gl.setRenderTarget(targetRef.current.write)
    // Render using the dedicated 1:1 camera, NOT the main viewport camera!
    gl.render(simScene, simCamera)

    gl.setRenderTarget(null)

    const temp = targetRef.current.read
    targetRef.current.read = targetRef.current.write
    targetRef.current.write = temp
  })

  const paperMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: texPaper,
    depthWrite: false
  }), [texPaper])

  return (
    <>
      <mesh position={[0, 0, -5]} scale={[viewport.width * 2, viewport.height * 2, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={paperMaterial} attach="material" />
      </mesh>

      {/* --- SCENE 3: Mountains --- */}
      <AtlasElement
        textureAtlas={texAtlas} textureMask={texMask} textureTrail={targetRef.current.write.texture} textureFractal={texFractal}
        uvOffset={[0.01, 0.39]} // Long row of houses and fields
        uvScale={[0.53, 0.10]}
        basePositionX={2.4} // Sequentially placed after the midground
        basePositionY={-0.1}
        zIndex={-2}
        scaleMultiplier={0.7}
        scrollRange={[0.0, 1.0]} // Global timeline
        parallaxSpeed={2.6} // Moves slower for background depth
        scrollRef={scrollYProgress}
      />

      {/* --- SCENE 2: Midground Cow, Person & Houses --- */}
      <AtlasElement
        textureAtlas={texAtlas} textureMask={texMask} textureTrail={targetRef.current.write.texture} textureFractal={texFractal}
        uvOffset={[0.01, 0.26]} // Green hill with white house
        uvScale={[0.34, 0.10]}
        basePositionX={1.1} // Sequentially placed after tree
        basePositionY={0.0}
        zIndex={-1}
        scaleMultiplier={0.65}
        scrollRange={[0.0, 1.0]}
        parallaxSpeed={2.8}
        scrollRef={scrollYProgress}
      />
      <AtlasElement
        textureAtlas={texAtlas} textureMask={texMask} textureTrail={targetRef.current.write.texture} textureFractal={texFractal}
        uvOffset={[0.38, 0.26]} // Standing Cow
        uvScale={[0.08, 0.10]}
        basePositionX={1.4} // Placed slightly after the house
        basePositionY={-0.2}
        zIndex={-0.5}
        scaleMultiplier={0.4}
        scrollRange={[0.0, 1.0]}
        parallaxSpeed={3.2} // Moves slightly faster than house
        scrollRef={scrollYProgress}
      />
      <AtlasElement
        textureAtlas={texAtlas} textureMask={texMask} textureTrail={targetRef.current.write.texture} textureFractal={texFractal}
        uvOffset={[0.38, 0.56]} // Person walking
        uvScale={[0.04, 0.10]}
        basePositionX={0.8} // Enters right after the tree
        basePositionY={-0.05}
        zIndex={-0.8}
        scaleMultiplier={0.25}
        scrollRange={[0.0, 1.0]}
        parallaxSpeed={3.0}
        scrollRef={scrollYProgress}
      />

      {/* --- SCENE 1: Foreground Big Tree --- */}
      <AtlasElement
        textureAtlas={texAtlas} textureMask={texMask} textureTrail={targetRef.current.write.texture} textureFractal={texFractal}
        uvOffset={[0.0, 0.72]}
        uvScale={[0.26, 0.28]}
        basePositionX={0.15} // Starts perfectly centered just after the text
        basePositionY={0.0}
        zIndex={0}
        scaleMultiplier={0.85}
        scrollRange={[0.0, 1.0]}
        parallaxSpeed={2.5}
        scrollRef={scrollYProgress}
      />
    </>
  )
}
const PARAGRAPH = [
  'You begin',
  'with a single leaf',
  'plucked from the high mist',
  'of the Himalayan foothills',
  'steeped in centuries',
  'of quiet craftsmanship',
  '(from "The Darjeeling Origin")',
  '',
  'Every remarkable cup',
  'starts long before',
  'it reaches your hands.',
  '',
  'Where cool mountain air',
  'meets rich soil,',
  'nature leads every season,',
  'transforming simple leaves',
  'into an extraordinary',
  'experience.',
  '',
  'Time moves differently',
  'in the high gardens.',
  'Patience is poured',
  'into every single harvest',
  'as the mist rolls slowly',
  'over the terraced hills.',
  '',
  'To understand the leaf',
  'is to understand the mountain,',
  'the rhythmic rains,',
  'the dark, loamy earth,',
  'and the weathered hands',
  'that pluck it at dawn.',
  '',
  'This is the origin.',
  'This is Darjeeling.'
]

const TextContent = React.forwardRef((props, ref) => (
  <div ref={ref} className="will-change-transform" style={{ maxWidth: '480px', paddingTop: '20vh' }}>
    {PARAGRAPH.map((line, lineIdx) => {
      if (line === '') return <div key={`br-${lineIdx}`} style={{ height: '1.5rem' }} />
      return (
        <p key={lineIdx} style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400,
          fontSize: 'clamp(28px, 2.5vw, 42px)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: '#1a1a1a',
          margin: 0,
          opacity: 0.9,
          textShadow: '0 0 10px rgba(232,224,208,0.5)',
        }}>
          {line}
        </p>
      )
    })}
  </div>
))

export default function DavidWhyteExperience() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const scrollProgress = useRef(0)
  const mouse = useRef(new THREE.Vector2(-10, -10))

  const textRefSharp = useRef(null)
  const textRefBlur = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress

          // Dynamically calculate scroll distance based on text height
          // so the final line always lands perfectly in the sharp zone!
          if (textRefSharp.current) {
            const containerHeight = textRefSharp.current.scrollHeight
            // We want the bottom of the text to reach roughly the top third of the mask
            const maxScroll = containerHeight - (window.innerHeight * 0.3)
            const yOffset = -(self.progress * maxScroll)
            
            textRefSharp.current.style.transform = `translateY(${yOffset}px)`
            if (textRefBlur.current) textRefBlur.current.style.transform = `translateY(${yOffset}px)`
          }
        }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { top, left, width, height } = pinRef.current.getBoundingClientRect()

      const x = e.clientX - left
      const y = e.clientY - top

      if (x < 0 || x > width || y < 0 || y > height) {
        mouse.current.x = -10
        mouse.current.y = -10
        return
      }
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = 1.0 - (e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '450vh' }}>
      <div ref={pinRef} className="sticky top-0 w-full overflow-hidden" style={{ height: '100vh', background: '#e8e0d0' }}>

        {/* R3F Canvas */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Canvas dpr={[1, 2]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
            <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} near={0.1} far={20} />

            <React.Suspense fallback={null}>
              <WebGLScene scrollYProgress={scrollProgress} mouse={mouse} />
            </React.Suspense>
          </Canvas>
        </div>

        {/* Soft white fog behind text for legibility */}
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: '45vw',
            zIndex: 5,
            pointerEvents: 'none',
            background: 'linear-gradient(to right, rgba(255,255,255, 0.85) 0%, rgba(255,255,255, 0.6) 50%, rgba(255,255,255, 0) 100%)'
          }}
        />

        {/* Text safe zone with gradient blur masks */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '20vh', left: '10vw',
            height: '60vh', // Fixed window for the mask 
            width: '500px',
            zIndex: 10
          }}
        >
          {/* Blurred Layer (Visible at edges, hidden in middle) */}
          <div style={{
            position: 'absolute', inset: 0,
            filter: 'blur(6px)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)',
          }}>
            <TextContent ref={textRefBlur} />
          </div>

          {/* Sharp Layer (Visible in middle, hidden at edges) */}
          <div style={{
            position: 'absolute', inset: 0,
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 80%, rgba(0,0,0,0) 100%)',
          }}>
            <TextContent ref={textRefSharp} />
          </div>
        </div>

      </div>
    </section>
  )
}
