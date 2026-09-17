import { useCallback, useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Heart, Sparkles } from 'lucide-react'
import BirthdayFlowers from './components/BirthdayFlowers.jsx'
import MemoryCollage from './components/MemoryCollage.jsx'
import './App.css'

const BIRTHDAY = new Date(2026, 9, 8, 0, 0, 0)
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function getTimeLeft(now = Date.now()) {
  const difference = Math.max(0, BIRTHDAY.getTime() - now)

  return {
    total: difference,
    days: Math.floor(difference / DAY),
    hours: Math.floor((difference % DAY) / HOUR),
    minutes: Math.floor((difference % HOUR) / MINUTE),
    seconds: Math.floor((difference % MINUTE) / SECOND),
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

function readThemeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function CountdownCard({ timeLeft }) {
  const units = [
    ['days', timeLeft.days],
    ['hours', timeLeft.hours],
    ['minutes', timeLeft.minutes],
    ['seconds', timeLeft.seconds],
  ]

  return (
    <div className="countdown" aria-label="Countdown to October 8, 2026">
      {units.map(([label, value]) => (
        <div className="time-unit" key={label}>
          <AnimatePresence mode="popLayout">
            <motion.span
              className="time-value"
              key={value}
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              {String(value).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <span className="time-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

function LockedExperience({ timeLeft, reducedMotion }) {
  return (
    <main className="experience locked-experience">
      <div className="aurora aurora-one" aria-hidden="true" />
      <div className="aurora aurora-two" aria-hidden="true" />
      <div className="star-field" aria-hidden="true">
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} style={{ '--star': index }} />
        ))}
      </div>

      <motion.section
        className="countdown-shell"
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.9, ease: 'easeOut' }}
      >
        <div className="tiny-orbit" aria-hidden="true">
          <span>🌻</span>
          <span>🌹</span>
        </div>
        <p className="eyebrow">
          <Heart size={14} fill="currentColor" />
          Something beautiful is growing
        </p>
        <h1>
          A little universe
          <span>is waiting for you.</span>
        </h1>
        <p className="countdown-intro">
          Come back when the clock strikes midnight on October 8.
          The stars, flowers, and every little memory will be ready.
        </p>
        <CountdownCard timeLeft={timeLeft} />
        <p className="timezone-note">Your midnight · your local time</p>
      </motion.section>

      <div className="locked-flowers" aria-hidden="true">
        <BirthdayFlowers reducedMotion={reducedMotion} compact />
      </div>
    </main>
  )
}

function BirthdayExperience({ reducedMotion }) {
  const celebrate = useCallback(() => {
    if (reducedMotion) return

    const colors = [
      readThemeColor('--cp-warning'),
      readThemeColor('--cp-accent'),
      readThemeColor('--cp-success'),
      readThemeColor('--cp-accent-hover'),
    ]

    const end = Date.now() + 2200
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 62,
        origin: { x: 0, y: 0.72 },
        colors,
        disableForReducedMotion: true,
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 62,
        origin: { x: 1, y: 0.72 },
        colors,
        disableForReducedMotion: true,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [reducedMotion])

  useEffect(() => {
    celebrate()
  }, [celebrate])

  return (
    <main className="experience birthday-experience">
      <div className="aurora aurora-one" aria-hidden="true" />
      <div className="aurora aurora-two" aria-hidden="true" />

      <header className="topbar">
        <span className="eyebrow">
          <Heart size={14} fill="currentColor" />
          October 8 · your day
        </span>
        <button className="celebrate-button" type="button" onClick={celebrate}>
          <Sparkles size={16} />
          More magic
        </button>
      </header>

      <section className="birthday-hero" aria-labelledby="birthday-title">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.9 }}
        >
          <p className="birthday-kicker">The wait is over, birthday girl</p>
          <h1 id="birthday-title">
            Happy Birthday,
            <span>my favourite human.</span>
          </h1>
          <p className="hero-message">
            Today the sunflowers are standing taller, the roses are showing off,
            and the whole universe has one very important reason to celebrate: you.
          </p>
          <a className="scroll-cue" href="#memories">
            Open your surprise
            <ArrowDown size={18} />
          </a>
        </motion.div>

        <motion.div
          className="hero-garden"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reducedMotion ? 0 : 0.25, duration: reducedMotion ? 0 : 1 }}
        >
          <BirthdayFlowers reducedMotion={reducedMotion} />
        </motion.div>
      </section>

      <div id="memories">
        <MemoryCollage reducedMotion={reducedMotion} />
      </div>

      <section className="love-letter" aria-labelledby="letter-title">
        <motion.article
          className="letter-card"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 36, rotate: reducedMotion ? 0 : -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
        >
          <span className="letter-kicker">For you, always</span>
          <h2 id="letter-title">You make ordinary days feel like magic.</h2>
          <p>
            Happy birthday to the girl who makes my world softer, brighter, and infinitely
            more beautiful. Thank you for every laugh, every adventure, every quiet moment,
            and every version of us we are still becoming.
          </p>
          <p>
            I hope this year brings you the kind of joy you give so effortlessly to everyone
            around you. I will be right beside you, cheering the loudest, holding your hand,
            and collecting a million more memories with you.
          </p>
          <p className="letter-ending">
            In every lifetime, I would still find you.
            <span>Happy birthday, my love. ❤️</span>
          </p>
          <div className="letter-seal" aria-hidden="true">
            <Heart size={20} fill="currentColor" />
          </div>
        </motion.article>
      </section>

      <footer>
        Made with way too much love, a little code, and flowers that never fade.
        <span aria-hidden="true">🌻 🌹</span>
      </footer>
    </main>
  )
}

function App() {
  const reducedMotion = useReducedMotion()
  const previewBirthday = useMemo(
    () => new URLSearchParams(window.location.search).get('preview') === 'birthday',
    [],
  )
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft())

  useEffect(() => {
    if (previewBirthday || timeLeft.total === 0) return undefined
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), SECOND)
    return () => window.clearInterval(timer)
  }, [previewBirthday, timeLeft.total])

  const unlocked = previewBirthday || timeLeft.total === 0

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div key="birthday" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BirthdayExperience reducedMotion={reducedMotion} />
        </motion.div>
      ) : (
        <motion.div key="countdown" exit={{ opacity: 0, scale: 1.03 }}>
          <LockedExperience timeLeft={timeLeft} reducedMotion={reducedMotion} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
