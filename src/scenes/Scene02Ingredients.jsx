import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TransparentScrubScene from '../components/TransparentScrubScene'
import SceneNumber from '../components/SceneNumber'
import SplitText from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

const ingredients = [
  { name: 'Darjeeling', top: '15%', left: '12%', lineHeight: 60 },
  { name: 'Cardamom', top: '18%', right: '12%', lineHeight: 50 },
  { name: 'Cinnamon', bottom: '28%', left: '10%', lineHeight: 55 },
  { name: 'Rose', bottom: '20%', right: '14%', lineHeight: 45 },
]

export default function Scene02Ingredients() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Typography Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.scene-02',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        }
      })
      
      tl.fromTo('.apple-subtitle-2', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        0.5
      )
      
      tl.to('.apple-subtitle-2', {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power2.in'
      }, 3)

      // 2. Ingredient Labels Timeline (non-scrubbed, triggers on entry)
      const labels = gsap.utils.toArray('.ingredient-label')
      const lines = gsap.utils.toArray('.label-line')
      
      gsap.set(labels, { opacity: 0, y: 20 })
      gsap.set(lines, { scaleY: 0, transformOrigin: 'top center' })

      gsap.to(lines, {
        scaleY: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.scene-02',
          start: 'top 50%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(labels, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        delay: 0.4,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.scene-02',
          start: 'top 50%',
          toggleActions: 'play none none none',
        },
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <TransparentScrubScene ref={containerRef} className="scene-02" scrubDuration={2.5}>
      <div className="w-full h-screen relative flex flex-col items-center justify-end pb-24 px-8 pt-8">
        
        <div className="scene-num-pos p-8 absolute top-0 right-0 z-20">
          <SceneNumber number={2} />
        </div>

        {/* Central Apple Typography */}
        <div className="z-10 pointer-events-none text-center w-full">
          <h1 className="text-display text-display-xl leading-none tracking-tighter w-full">
            <span className="block pb-2 w-full text-center">
              <SplitText type="blur" className="text-gold-400" duration={1.2}>NATURE'S</SplitText>
            </span>
            <span className="block pb-2 w-full text-center">
              <SplitText type="blur" className="text-ivory" duration={1.2} delay={0.2}>FINEST</SplitText>
            </span>
          </h1>
          <p className="apple-subtitle-2 mt-8 text-body text-center max-w-lg mx-auto text-lg text-parchment-200 pointer-events-none">
            Handpicked botanicals blending perfectly with the purity of the mountains.
          </p>
        </div>

        {/* Ingredient Labels */}
        <div className="ingredient-labels absolute inset-0 pointer-events-none z-20">
          {ingredients.map((ing, i) => {
            const posStyle = {}
            if (ing.top) posStyle.top = ing.top
            if (ing.bottom) posStyle.bottom = ing.bottom
            if (ing.left) posStyle.left = ing.left
            if (ing.right) posStyle.right = ing.right

            return (
              <div key={i} className="ingredient-label" style={posStyle}>
                <span className="label-text">{ing.name}</span>
                <div className="label-line" style={{ height: `${ing.lineHeight}px` }} />
                <div className="gold-dot" />
              </div>
            )
          })}
        </div>

      </div>
    </TransparentScrubScene>
  )
}
