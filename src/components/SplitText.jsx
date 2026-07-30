import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * SplitText — Animates text character-by-character or word-by-word
 * Uses Framer Motion (reliable) instead of GSAP ScrollTrigger (conflicts inside pinned sections)
 *
 * Props:
 * - children: string text to animate
 * - type: 'chars' | 'words' | 'lines' | 'blur' | 'mask'
 * - tag: HTML tag to render (default: 'div')
 * - className: additional CSS classes
 * - delay: animation delay in seconds
 * - stagger: stagger between elements in seconds
 * - duration: animation duration
 */
export default function SplitText({
  children,
  type = 'chars',
  tag: Tag = 'div',
  className = '',
  delay = 0,
  stagger = 0.03,
  duration = 0.8,
}) {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })
  const textContent = typeof children === 'string' ? children : ''

  const animations = {
    chars: {
      hidden: { opacity: 0, y: 40, rotateX: -60 },
      visible: { opacity: 1, y: 0, rotateX: 0 },
    },
    words: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(12px)', scale: 0.98 },
      visible: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    },
    mask: {
      hidden: { clipPath: 'inset(100% 0 0 0)' },
      visible: { clipPath: 'inset(0% 0 0 0)' },
    },
    lines: {
      hidden: { opacity: 0, y: 50, skewY: 2 },
      visible: { opacity: 1, y: 0, skewY: 0 },
    },
  }

  const config = animations[type] || animations.chars

  const getUnits = () => {
    if (type === 'words' || type === 'lines') {
      return textContent.split(' ').map((word, i) => ({ text: word, key: i }))
    }
    return textContent.split('').map((char, i) => ({
      text: char === ' ' ? '\u00A0' : char,
      key: i,
      isSpace: char === ' ',
    }))
  }

  const units = getUnits()

  return (
    <Tag ref={containerRef} className={className} style={{ perspective: '1000px' }}>
      {units.map((unit, i) => (
        <motion.span
          key={unit.key}
          initial={config.hidden}
          animate={isInView ? config.visible : config.hidden}
          transition={{
            duration,
            delay: delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: unit.isSpace ? 'inline' : 'inline-block',
            whiteSpace: unit.isSpace ? 'pre' : 'normal',
            marginRight: (type === 'words' || type === 'lines') ? '0.3em' : undefined,
          }}
        >
          {unit.text}
        </motion.span>
      ))}
    </Tag>
  )
}
