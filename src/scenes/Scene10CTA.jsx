import { motion } from 'framer-motion'
import SplitText from '../components/SplitText'

export default function Scene10CTA() {
  return (
    <section className="scene scene-10">
      <SplitText
        type="chars"
        className="cta-title"
        stagger={0.04}
        duration={1.2}
        tag="h2"
      >
        FROM MOUNTAIN TO MOMENT
      </SplitText>

      <motion.a
        href="#"
        className="cta-button"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Explore the Collection
        <span className="arrow">→</span>
      </motion.a>

      {/* Tiny footer label */}
      <motion.div
        className="text-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{ marginTop: '4rem' }}
      >
        Darjeeling Origins — Est. 1978
      </motion.div>
    </section>
  )
}
