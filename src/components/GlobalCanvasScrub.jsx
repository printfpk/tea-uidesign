import { useEffect, useRef, useState } from 'react'

export default function GlobalCanvasScrub({
  frameDirs = [
    '/frames/video-1',
    '/frames/video-2',
    '/frames/video-3',
    '/frames/video-4',
    '/frames/video-5',
  ],
  framesPerDir = 120,
  overlayGradient = true,
  videoOpacity = 1,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const rafRef = useRef(null)
  
  const [loaded, setLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  
  const totalFrames = frameDirs.length * framesPerDir

  // Phase 1: Preload all frames
  useEffect(() => {
    const images = []
    let loadedCount = 0

    // Build flat array of URLs
    const urls = []
    frameDirs.forEach((dir) => {
      for (let i = 1; i <= framesPerDir; i++) {
        urls.push(`${dir}/frame_${String(i).padStart(3, '0')}.jpg`)
      }
    })

    urls.forEach((url, i) => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        loadedCount++
        setLoadProgress(Math.round((loadedCount / totalFrames) * 100))
        if (loadedCount >= totalFrames) {
          imagesRef.current = images
          setLoaded(true)
        }
      }
      img.onerror = () => {
        loadedCount++
        setLoadProgress(Math.round((loadedCount / totalFrames) * 100))
        if (loadedCount >= totalFrames) {
          imagesRef.current = images
          setLoaded(true)
        }
      }
      images[i] = img
    })
  }, [frameDirs, framesPerDir, totalFrames])

  // Phase 2: Canvas rendering + Native Scroll Logic
  useEffect(() => {
    if (!loaded || !canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const sequenceWrapper = container.closest('.continuous-sequence') || container.parentElement
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const images = imagesRef.current

    // Set to 1.0 to disable programmatic counter-zoom and play raw videos.
    const VIDEO_CONFIGS = [
      { scaleStart: 1.0, scaleEnd: 1.0, focusX: 0.5, focusY: 0.55 },
      { scaleStart: 1.0, scaleEnd: 1.0, focusX: 0.5, focusY: 0.55 },
      { scaleStart: 1.0, scaleEnd: 1.0, focusX: 0.5, focusY: 0.55 },
      { scaleStart: 1.0, scaleEnd: 1.0, focusX: 0.5, focusY: 0.55 },
      { scaleStart: 1.0, scaleEnd: 1.0, focusX: 0.5, focusY: 0.55 },
    ]

    const drawFrame = (index) => {
      const img = images[index]
      if (!img || !img.complete || img.naturalWidth === 0) return

      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      const baseScale = Math.max(cw / iw, ch / ih)
      
      const videoIndex = Math.min(Math.floor(index / framesPerDir), VIDEO_CONFIGS.length - 1)
      const config = VIDEO_CONFIGS[videoIndex]
      
      const localIndex = index % framesPerDir
      const segmentProgress = localIndex / (framesPerDir - 1)
      
      const currentZoom = config.scaleStart + (config.scaleEnd - config.scaleStart) * segmentProgress
      const scale = baseScale * currentZoom

      const sw = cw / scale
      const sh = ch / scale
      
      const sx = (iw - sw) * config.focusX
      const sy = (ih - sh) * config.focusY

      ctx.fillStyle = '#070707'
      ctx.fillRect(0, 0, cw, ch)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawFrame(Math.round(currentFrameRef.current))
    }

    resize()
    drawFrame(0)
    window.addEventListener('resize', resize)

    // Phase 3: Interaction logic
    const handleScroll = () => {
      const rect = sequenceWrapper.getBoundingClientRect()
      const top = rect.top
      const scrollableDistance = rect.height - window.innerHeight
      
      const scrolled = -top 
      
      const clamp = (val, min, max) => Math.max(min, Math.min(val, max))
      const ratio = clamp(scrolled / scrollableDistance, 0, 1)
      
      targetFrameRef.current = ratio * (totalFrames - 1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Phase 4: Render Loop (Easing)
    const renderLoop = () => {
      const current = currentFrameRef.current
      const target = targetFrameRef.current
      currentFrameRef.current += (target - current) * 0.1 // lerp easing

      const frameIndex = Math.max(0, Math.min(Math.round(currentFrameRef.current), totalFrames - 1))
      drawFrame(frameIndex)
      
      rafRef.current = requestAnimationFrame(renderLoop)
    }

    rafRef.current = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loaded, totalFrames, framesPerDir])

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: videoOpacity,
          display: 'block',
        }}
      />

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
            pointerEvents: 'auto'
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
          <div className="text-label" style={{ color: 'var(--color-gold)' }}>
            Loading Cinematic ({loadProgress}%)
          </div>
        </div>
      )}

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
    </div>
  )
}
