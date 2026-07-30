import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function GoldDivider({ width = '100%' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        className="gold-line"
        initial={{ width: 0 }}
        animate={isInView ? { width } : { width: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ width: 0 }}
      />
    </div>
  )
}
