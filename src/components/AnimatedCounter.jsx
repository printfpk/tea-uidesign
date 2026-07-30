import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * AnimatedCounter — Counts from 0 to target value on scroll
 * 
 * Props:
 * - end: target number
 * - suffix: text after number (e.g., '%', '+')
 * - prefix: text before number (e.g., '$')
 * - duration: animation duration in seconds
 * - className: CSS class for the number
 * - labelClassName: CSS class for the label
 * - label: label text below the number
 */
export default function AnimatedCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  className = 'stat-number',
  labelClassName = 'stat-label',
  label = '',
}) {
  const [display, setDisplay] = useState(0)
  const containerRef = useRef(null)
  const counterObj = useRef({ val: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(counterObj.current, {
        val: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          setDisplay(Math.round(counterObj.current.val))
        },
      })
    })

    return () => ctx.revert()
  }, [end, duration])

  return (
    <div ref={containerRef} className="stat-item">
      <div className={className}>
        {prefix}{display}{suffix}
      </div>
      {label && <div className={labelClassName}>{label}</div>}
    </div>
  )
}
