import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TransparentScrubScene from '../components/TransparentScrubScene'
import SceneNumber from '../components/SceneNumber'
import SplitText from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

export default function Scene01Bowl() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene-01',
          start: 'top top',
          end: 'bottom top',
          scrub: 1, // Smooth scrub
        }
      })
      
      tl.fromTo('.apple-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        0.5
      )
      
      tl.to('.apple-subtitle', {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power2.in'
      }, 3)

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <TransparentScrubScene ref={containerRef} className="scene-01" scrubDuration={3}>
      <div className="scene-num-pos p-8 absolute top-0 right-0">
        <SceneNumber number={1} />
      </div>

      <div className="w-full h-screen flex flex-col items-center justify-end pb-24 px-8 pt-8">
        <h1 className="text-display text-display-xl text-center leading-none tracking-tighter w-full pointer-events-none">
          <span className="block pb-2 w-full text-center">
            <SplitText type="blur" className="text-ivory" duration={1.2}>THE</SplitText>
          </span>
          <span className="block pb-2 w-full text-center">
            <SplitText type="blur" className="text-gold-400" duration={1.2} delay={0.2}>AWAKENING</SplitText>
          </span>
        </h1>

        <p className="apple-subtitle mt-8 text-body text-center max-w-lg text-lg text-parchment-200 pointer-events-none">
          From the misty peaks of the Himalayas, where clouds kiss the earth, a single leaf begins its journey.
        </p>
      </div>
    </TransparentScrubScene>
  )
}
