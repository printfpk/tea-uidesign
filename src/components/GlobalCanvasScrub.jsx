import { useEffect, useRef, useState } from 'react'

const DEFAULT_FRAME_DIRS = [
  '/frames/video-1',
  '/frames/video-2',
  '/frames/video-3',
  '/frames/video-4',
  '/frames/video-5',
]

export default function GlobalCanvasScrub({
  frameDirs = DEFAULT_FRAME_DIRS,
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
  
  const [networkProgress, setNetworkProgress] = useState(0)
  const [timeProgress, setTimeProgress] = useState(0)
  
  const totalFrames = frameDirs.length * framesPerDir

  useEffect(() => {
    const DURATION = 8000 // 8 seconds
    const startTime = Date.now()
    let raf

    const updateTime = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, (elapsed / DURATION) * 100)
      setTimeProgress(p)
      if (p < 100) {
        raf = requestAnimationFrame(updateTime)
      }
    }
    raf = requestAnimationFrame(updateTime)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Phase 1: Preload all frames using Sparse Batching
  useEffect(() => {
    const images = new Array(totalFrames)
    imagesRef.current = images // Set reference immediately so drawFrame can access loaded frames

    // Build flat array of URLs
    const urls = []
    frameDirs.forEach((dir) => {
      for (let i = 1; i <= framesPerDir; i++) {
        urls.push(`${dir}/frame_${String(i).padStart(3, '0')}.jpg`)
      }
    })

    if (urls.length === 0) {
      setNetworkProgress(100)
      setTimeProgress(100)
      return
    }

    // Create a sparse loading queue
    const loadQueue = []
    // Pass 1: Every 12th frame (10 frames per 120-frame dir) - for low fps fallback
    for (let i = 0; i < urls.length; i += 12) {
      loadQueue.push(i)
    }
    // Pass 2: Every 6th frame
    for (let i = 6; i < urls.length; i += 12) {
      loadQueue.push(i)
    }
    // Pass 3: All remaining frames
    for (let i = 0; i < urls.length; i++) {
      if (i % 6 !== 0) {
        loadQueue.push(i)
      }
    }

    // We will wait for Pass 1 to finish before hiding the loader (approx 50 frames total)
    const initialRequired = loadQueue.filter(i => i % 12 === 0).length
    let initialLoaded = 0
    let queueIndex = 0
    const BATCH_SIZE = 8

    const loadNextBatch = () => {
      if (queueIndex >= loadQueue.length) return // Done!

      const batch = loadQueue.slice(queueIndex, queueIndex + BATCH_SIZE)
      queueIndex += BATCH_SIZE

      let loadedInBatch = 0
      
      batch.forEach(index => {
        const img = new Image()
        img.src = urls[index]
        
        const onComplete = () => {
          loadedInBatch++
          
          if (index % 12 === 0) {
            initialLoaded++
            setNetworkProgress(Math.min(100, Math.round((initialLoaded / initialRequired) * 100)))
          }

          if (loadedInBatch === batch.length) {
            // Add a small delay to prevent thread locking
            setTimeout(loadNextBatch, 15)
          }
        }
        
        img.onload = onComplete
        img.onerror = onComplete
        images[index] = img
      })
    }

    // Start loading batches
    loadNextBatch()

  }, [frameDirs, framesPerDir, totalFrames])

  // Phase 2: Canvas rendering + Native Scroll Logic
  useEffect(() => {
    if (networkProgress < 100 || !canvasRef.current || !containerRef.current) return

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
      let img = images[index]
      let actualIndex = index

      // If the exact frame isn't loaded, find the closest previous loaded frame
      if (!img || !img.complete || img.naturalWidth === 0) {
        let found = false
        // Search backwards for a loaded frame
        for (let i = index - 1; i >= 0; i--) {
          if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
            img = images[i]
            actualIndex = i
            found = true
            break
          }
        }
        if (!found) return // Nothing to draw yet
      }

      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      const baseScale = Math.max(cw / iw, ch / ih)
      
      const videoIndex = Math.min(Math.floor(actualIndex / framesPerDir), VIDEO_CONFIGS.length - 1)
      const config = VIDEO_CONFIGS[videoIndex]
      
      const localIndex = actualIndex % framesPerDir
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
  }, [networkProgress, totalFrames, framesPerDir])

  const displayedProgress = Math.floor(Math.min(networkProgress, timeProgress))
  const showLoader = displayedProgress < 100

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

      {/* Loading Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070707',
          transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: showLoader ? 1 : 0,
          pointerEvents: showLoader ? 'auto' : 'none'
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          transition: 'transform 2s ease-out', 
          transform: showLoader ? 'scale(1)' : 'scale(1.05)' 
        }}>
          <h1 className="text-display" style={{ 
            fontSize: '4rem', 
            color: 'var(--color-gold)', 
            letterSpacing: '0.2em', 
            marginBottom: '1rem', 
            fontWeight: 300 
          }}>
            TEA
          </h1>
          <p className="text-body" style={{ 
            color: 'var(--color-parchment-200)', 
            letterSpacing: '0.4em', 
            textTransform: 'uppercase', 
            fontSize: '0.875rem', 
            marginBottom: '4rem', 
            opacity: 0.7 
          }}>
            The Infusion Experience
          </p>
          
          <div style={{ 
            width: '240px', 
            height: '1px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '0 auto', 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '100%', 
                background: 'var(--color-gold)',
                width: `${displayedProgress}%`,
                transition: 'width 0.1s linear'
              }} 
            />
          </div>
          <div className="text-label" style={{ 
            color: 'var(--color-gold)', 
            marginTop: '1.5rem', 
            opacity: 0.5, 
            fontSize: '0.75rem',
            letterSpacing: '0.1em'
          }}>
            {displayedProgress === 100 ? 'STEEPING COMPLETE' : `STEEPING ${displayedProgress.toString().padStart(2, '0')}%`}
          </div>
        </div>
      </div>

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
