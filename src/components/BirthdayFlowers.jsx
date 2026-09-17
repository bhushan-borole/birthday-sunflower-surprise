import { motion } from 'framer-motion'

function Sunflower({ className = '' }) {
  return (
    <div className={`css-flower sunflower-bloom ${className}`}>
      <div className="flower-face">
        {Array.from({ length: 16 }, (_, index) => (
          <span className="sun-petal" key={index} style={{ '--petal': index }} />
        ))}
        <span className="sun-center" />
      </div>
      <span className="flower-stem" />
      <span className="flower-leaf leaf-left" />
      <span className="flower-leaf leaf-right" />
    </div>
  )
}

function Rose({ className = '' }) {
  return (
    <div className={`css-flower rose-bloom ${className}`}>
      <div className="rose-face">
        {Array.from({ length: 9 }, (_, index) => (
          <span className="rose-petal" key={index} style={{ '--petal': index }} />
        ))}
        <span className="rose-heart" />
      </div>
      <span className="flower-stem" />
      <span className="flower-leaf leaf-left" />
    </div>
  )
}

function BirthdayFlowers({ reducedMotion, compact = false }) {
  return (
    <motion.div
      className={`birthday-flowers ${compact ? 'is-compact' : ''}`}
      initial={{ y: reducedMotion ? 0 : 70 }}
      animate={{ y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 1.2, ease: 'easeOut' }}
      aria-label="A bouquet of sunflowers and roses"
      role="img"
    >
      <span className="garden-glow" aria-hidden="true" />
      <Sunflower className="flower-one" />
      <Rose className="flower-two" />
      <Sunflower className="flower-three" />
      <Rose className="flower-four" />
      <Sunflower className="flower-five" />
      {!compact && (
        <div className="floating-hearts" aria-hidden="true">
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
        </div>
      )}
    </motion.div>
  )
}

export default BirthdayFlowers
