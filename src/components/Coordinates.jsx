import { motion } from 'framer-motion'

/**
 * Coordinates — Editorial coordinate/data display
 * 
 * Props:
 * - lat: latitude string
 * - lng: longitude string
 * - altitude: altitude string
 * - temperature: temperature string
 */
export default function Coordinates({ lat, lng, altitude, temperature }) {
  return (
    <motion.div
      className="coordinates"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.5 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.5, delay: 0.5 }}
    >
      {lat && <div>{lat}</div>}
      {lng && <div>{lng}</div>}
      {altitude && (
        <>
          <div style={{ height: '0.5rem' }} />
          <div>{altitude}</div>
        </>
      )}
      {temperature && <div>{temperature}</div>}
    </motion.div>
  )
}
