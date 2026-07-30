import { useRef } from 'react'
import CanvasScrub from '../components/CanvasScrub'

export default function Scene06Distribution() {
  const containerRef = useRef(null)

  return (
    <div ref={containerRef} className="relative z-10 w-full bg-[#070707]">
      <CanvasScrub 
        frameDir="/frames/city-map" 
        frameCount={120} 
        scrubDuration={5}
        overlayGradient={true}
        videoOpacity={1}
      />
    </div>
  )
}
