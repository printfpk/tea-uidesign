import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TransparentScrubScene from '../components/TransparentScrubScene'
import SceneNumber from '../components/SceneNumber'
import SplitText from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

export default function Scene03Infusion() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene-03',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        }
      })
      
      tl.fromTo('.apple-subtitle-3', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        0.5
      )
      
      tl.to('.apple-subtitle-3', {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power2.in'
      }, 3)

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <TransparentScrubScene ref={containerRef} className="scene-03" scrubDuration={2.5}>
      <div className="w-full h-screen relative flex flex-col items-center justify-end pb-24 px-8 pt-8">
        
        <div className="scene-num-pos p-8 absolute top-0 right-0 z-20">
          <SceneNumber number={3} />
        </div>

        <div className="z-10 pointer-events-none text-center w-full">
          <h1 className="text-display text-display-xl leading-none tracking-tighter w-full">
            <span className="block pb-2 w-full text-center">
              <SplitText type="blur" className="text-ivory" duration={1.2}>THE</SplitText>
            </span>
            <span className="block pb-2 w-full text-center">
              <SplitText type="blur" className="text-gold-400" duration={1.2} delay={0.2}>INFUSION</SplitText>
            </span>
          </h1>
          <p className="apple-subtitle-3 mt-8 text-body text-center max-w-lg mx-auto text-lg text-parchment-200 pointer-events-none">
            Water meets leaf. Time transforms them both.
          </p>
        </div>

      </div>
    </TransparentScrubScene>
  )
}
