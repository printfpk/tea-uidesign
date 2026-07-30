import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * VideoScrub — Scroll-driven video playback
 * 
 * Video fills the ENTIRE section as a fullscreen background.
 * Content (children) overlays on top with z-index.
 * Section is pinned during scrub.
 */
export default function VideoScrub({
  src,
  children,
  className = '',
  scrubDuration = 3,
  overlayGradient = false,
  videoOpacity = 1,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    let scrollTriggerInstance = null

    const onLoadedMetadata = () => {
      const duration = video.duration

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${window.innerHeight * scrubDuration}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      })

      tl.to(video, {
        currentTime: duration,
        duration: 1,
        ease: 'none',
      })

      scrollTriggerInstance = tl.scrollTrigger
    }

    if (video.readyState >= 1) {
      onLoadedMetadata()
    } else {
      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true })
    }

    return () => {
      if (scrollTriggerInstance) scrollTriggerInstance.kill()
    }
  }, [src, scrubDuration])

  return (
    <section
      ref={containerRef}
      className={`scene ${className}`}
      style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      {/* Video — fullscreen background layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: videoOpacity,
        }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      </div>

      {/* Dark gradient overlay for readability */}
      {overlayGradient && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(7,7,7,0.8) 0%, rgba(7,7,7,0.2) 40%, rgba(7,7,7,0.1) 60%, rgba(7,7,7,0.4) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
        }}
        className="scene-content"
      >
        {children}
      </div>
    </section>
  )
}
