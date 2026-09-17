import { useState } from 'react'
import { motion } from 'framer-motion'

const memories = [
  {
    src: '/photos/01.jpg',
    fallback: '/photos/placeholder-01.svg',
    alt: 'A favourite memory together',
    caption: 'The moment I knew you were my favourite person',
    rotate: -5,
  },
  {
    src: '/photos/02.jpg',
    fallback: '/photos/placeholder-02.svg',
    alt: 'A happy day spent together',
    caption: 'Every adventure is better with you',
    rotate: 2,
  },
  {
    src: '/photos/03.jpg',
    fallback: '/photos/placeholder-03.svg',
    alt: 'A quiet and cosy memory together',
    caption: 'Home is wherever I am next to you',
    rotate: 5,
  },
  {
    src: '/photos/04.jpg',
    fallback: '/photos/placeholder-04.svg',
    alt: 'A joyful memory together',
    caption: 'More laughter, more love, more us',
    rotate: -2,
  },
]

function MemoryPhoto({ memory, index, reducedMotion }) {
  const [source, setSource] = useState(memory.src)

  return (
    <motion.figure
      className={`memory-card memory-card-${index + 1}`}
      style={{ '--rotation': `${memory.rotate}deg` }}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 60, rotate: memory.rotate * 1.8 }}
      whileInView={{ opacity: 1, y: 0, rotate: memory.rotate }}
      whileHover={reducedMotion ? undefined : { y: -12, rotate: 0, scale: 1.025 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reducedMotion ? 0 : 0.75,
        delay: reducedMotion ? 0 : index * 0.09,
        type: reducedMotion ? 'tween' : 'spring',
      }}
    >
      <div className="frame-topbar" aria-hidden="true">
        <span>Frame {String(index + 1).padStart(2, '0')}</span>
        <span className="frame-dots">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="memory-image-shell">
        <img
          src={source}
          alt={memory.alt}
          loading={index < 2 ? 'eager' : 'lazy'}
          onError={() => setSource(memory.fallback)}
        />
        <span className="frame-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <figcaption>
        <span>{memory.caption}</span>
        <small>Our archive</small>
      </figcaption>
    </motion.figure>
  )
}

function MemoryCollage({ reducedMotion }) {
  return (
    <section className="memories" aria-labelledby="memories-title">
      <motion.div
        className="memories-heading"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <span className="section-number">01 · our tiny forever</span>
        <h2 id="memories-title">Us, in a handful of frames.</h2>
        <p>
          Swap these placeholders with our photographs and this little wall becomes
          a time machine.
        </p>
      </motion.div>

      <div className="photo-wall">
        {memories.map((memory, index) => (
          <MemoryPhoto
            key={memory.src}
            memory={memory}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
        <motion.div
          className="memory-centerpiece"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <span>you + me</span>
          <strong>still my favourite story</strong>
          <span aria-hidden="true">∞</span>
        </motion.div>
      </div>
    </section>
  )
}

export default MemoryCollage
