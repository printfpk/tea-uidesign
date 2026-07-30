import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AnimatedCounter from '../components/AnimatedCounter'
import SplitText from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

const awards = [
  { number: 98, suffix: '%', label: 'Organic' },
  { number: 100, suffix: '+', label: 'Exports' },
  { number: 47, suffix: '', label: 'Awards Won' },
  { number: 12, suffix: '', label: 'Gold Medals' },
]

export default function Scene09Quality() {
  const cardsRef = useRef(null)

  useEffect(() => {
    if (!cardsRef.current) return

    const cards = cardsRef.current.querySelectorAll('.award-card')

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className="scene scene-09">
      <motion.div
        className="text-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        09 — Quality
      </motion.div>

      <SplitText
        type="blur"
        className="text-display text-display-md"
        stagger={0.05}
        duration={1}
        tag="h2"
      >
        Excellence Certified
      </SplitText>

      <motion.p
        className="text-body"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        style={{ textAlign: 'center', maxWidth: '40ch' }}
      >
        Recognized by the world's most
        <br />
        discerning tea connoisseurs.
      </motion.p>

      <div ref={cardsRef} className="awards-grid">
        {awards.map((award, i) => (
          <div key={i} className="award-card">
            <AnimatedCounter
              end={award.number}
              suffix={award.suffix}
              label={award.label}
              className="award-number"
              labelClassName="award-label"
              duration={2}
            />
          </div>
        ))}
      </div>

      {/* Decorative gold line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: '60%' }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
          marginTop: '1rem',
        }}
      />
    </section>
  )
}
