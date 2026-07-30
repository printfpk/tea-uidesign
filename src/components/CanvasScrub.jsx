import { useEffect, useRef, useState } from 'react'

/**
 * CanvasScrub — Apple-style frame-sequence scroll scrub
 * 
 * Uses pure native scroll events + position: sticky (NO GSAP).
 * Preloads JPG frames, draws them on <canvas> with requestAnimationFrame + lerp.
 */
export default function CanvasScrub({
  frameDir,
  frameCount = 120,
  children,
  className = '',
  scrubDuration = 3,
  overlayGradient = false,
  videoOpacity = 1,
}) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const rafRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  // Phase 1: Preload all frames
  useEffect(() => {
    const images = []
    let loadedCount = 0

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      img.src = `${frameDir}/frame_${String(i).padStart(3, '0')}.jpg`
      img.onload = () => {
        loadedCount++
        setLoadProgress(Math.round((loadedCount / frameCount) * 100))
        if (loadedCount >= frameCount) {
          imagesRef.current = images
          setLoaded(true)
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount >= frameCount) {
          imagesRef.current = images
          setLoaded(true)
        }
      }
      images.push(img)
    }
  }, [frameDir, frameCount])

  // Phase 2: Canvas rendering + Native Scroll Logic
  useEffect(() => {
    if (!loaded || !canvasRef.current || !sectionRef.current) return

    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false }) // Optimize for no transparency
    const images = imagesRef.current

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawFrame(Math.round(currentFrameRef.current))
    }

    const drawFrame = (index) => {
      const img = images[index]
      if (!img || !img.complete || img.naturalWidth === 0) return

      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      // object-fit: cover
      const scale = Math.max(cw / iw, ch / ih)
      const sw = cw / scale
      const sh = ch / scale
      const sx = (iw - sw) / 2
      const sy = (ih - sh) / 2

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    resize()
    drawFrame(0)
    window.addEventListener('resize', resize)

    // PHASE 3: INTERACTION LOGIC (PURE SCROLL)
    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      // Distance from top of viewport to top of section
      const top = rect.top
      // Distance to scroll while sticky is active
      const scrollableDistance = rect.height - window.innerHeight
      
      // Calculate how far we've scrolled past the top of the section
      const scrolled = -top 
      
      const clamp = (val, min, max) => Math.max(min, Math.min(val, max))
      const ratio = clamp(scrolled / scrollableDistance, 0, 1)
      
      targetFrameRef.current = ratio * (frameCount - 1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check in case we load scrolled down
    handleScroll()

    // PHASE 4: RENDER LOOP (EASING)
    const renderLoop = () => {
      const current = currentFrameRef.current
      const target = targetFrameRef.current
      currentFrameRef.current += (target - current) * 0.1 // lerp easing

      const frameIndex = Math.max(0, Math.min(Math.round(currentFrameRef.current), frameCount - 1))
      drawFrame(frameIndex)
      
      rafRef.current = requestAnimationFrame(renderLoop)
    }

    rafRef.current = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loaded, frameCount])

  return (
    <section
      ref={sectionRef}
      className={`scene ${className}`}
      // Make the section tall enough to scroll through based on scrubDuration
      style={{ height: `${scrubDuration * 100}vh`, position: 'relative', display: 'block' }}
    >
      {/* Sticky container stays fixed in viewport while scrolling through section */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          width: '100%', 
          overflow: 'hidden' 
        }}
      >
        {/* Canvas — fullscreen background */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            opacity: videoOpacity,
            display: 'block',
          }}
        />

        {/* Per-scene loading indicator */}
        {!loaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              background: 'var(--color-void)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-smoke)',
                borderTopColor: 'var(--color-gold)',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite',
              }}
            />
            <div className="text-label">{loadProgress}%</div>
          </div>
        )}

        {/* Dark gradient overlay */}
        {overlayGradient && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(7,7,7,0.7) 0%, rgba(7,7,7,0.15) 35%, rgba(7,7,7,0.05) 55%, rgba(7,7,7,0.35) 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Content overlay */}
        <div
          className="scene-content"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
