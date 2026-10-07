import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import BloomGarden from './components/BloomGarden.jsx'
import BirthdayWelcome from './components/BirthdayWelcome.jsx'
import BirthdayReveal from './components/BirthdayReveal.jsx'
import togetherPhoto from './img/Image (4).jpg'
import favouriteStoryPhoto from './img/Image (5).jpg'
import './App.css'

const BIRTHDAY = new Date(2026, 9, 8, 0, 0, 0)
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const photoFiles = import.meta.glob('/public/photos/0[1-4].jpg', {
  eager: true, query: '?url', import: 'default',
})
const captions = [
  'The moment I knew you were my favourite person.',
  'Every adventure is better with you.',
  'Our first pray to Ganpati together',
  'More laughter, more love, more us.',
]
const photographs = [
  {
    src: togetherPhoto,
    alt: 'A mirror photograph of us standing close together.',
    title: 'My favourite place?',
    emphasis: 'Next to you.',
    note: "Not because of where we are, but because we're there together.",
    caption: 'Our first pray to Ganpati together',
    width: 768,
    height: 1024,
  },
  {
    src: favouriteStoryPhoto,
    alt: 'Another mirror photograph of us sharing a moment together.',
    title: 'You and me.',
    emphasis: 'Still my favourite story.',
    note: 'The little moments, the familiar smiles, the feeling of being close. I want a lifetime more of this.',
    caption: 'More laughter. More adventures. More us.',
    width: 768,
    height: 1024,
  },
  ...Object.entries(photoFiles).sort(([a], [b]) => a.localeCompare(b)).map(([path, src]) => ({
    src,
    alt: 'A favourite photograph of us together.',
    title: 'A moment to keep.',
    emphasis: 'A little more of us.',
    note: 'Some photographs hold much more than a moment.',
    caption: captions[Number(path.match(/0([1-4])\.jpg$/)[1]) - 1],
  })),
]

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
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useLayoutEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])
  return { reduced }
}

function Header() {
  return (
    <header className="story-header">
      <span className="wordmark">a little more than words<span aria-hidden="true">.</span></span>
    </header>
  )
}

function Countdown({ timeLeft, settings }) {
  return (
    <main className="locked-experience">
      <Header />
      <div className="countdown-layout">
        <section className="countdown-shell" aria-labelledby="countdown-title">
          <p className="eyebrow"><span className="countdown-star" aria-hidden="true">✧</span> For you. And only you.</p>
          <h1 id="countdown-title">Your birthday surprise<span>is waiting for you.</span></h1>
          <p className="countdown-intro">A few words. A little wonder.<br />Something made with love.</p>
          <div className="countdown" aria-label="Countdown to October 8, 2026">
            {Object.entries(timeLeft).filter(([unit]) => unit !== 'total').map(([unit, value]) => (
              <div className="time-unit" key={unit}>
                <span className="time-value">{String(value).padStart(2, '0')}</span>
                <span className="time-label">{unit}</span>
              </div>
            ))}
          </div>
          <p className="timezone-note"><time dateTime="2026-10-08">October 8, 2026</time><span>Midnight, in your local time</span></p>
        </section>
        <div className="countdown-garden" aria-hidden="true">
          <BloomGarden reduced={settings.reduced} />
          <p className="countdown-garden-note">a little love, quietly growing</p>
        </div>
      </div>
      <p className="locked-footer">Some things are worth waiting for.</p>
    </main>
  )
}

function BotanicalMark() {
  return (
    <svg className="botanical-mark" viewBox="0 0 240 340" fill="none" aria-hidden="true">
      <path d="M122 323C94 210 131 173 119 93M119 197C72 179 36 132 43 105C98 109 113 142 119 197ZM116 234C178 231 207 191 204 160C149 155 122 190 116 234ZM119 131C155 106 174 66 163 47C126 56 114 89 119 131Z" />
      <path d="M118 94C94 62 74 36 96 19C113 7 129 35 129 35C143 10 173 15 172 36C171 61 137 85 118 94Z" />
    </svg>
  )
}

function PhotoScene({ photo, photoIndex }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [photo.src])
  return (
    <div className={`photo-chapter ${photoIndex % 2 ? 'is-reversed' : ''}`}>
      <div className="photo-chapter-copy">
        <p className="eyebrow">The moments I keep</p>
        <h1 id="story-title" tabIndex={-1}>{photo.title}<em>{photo.emphasis}</em></h1>
        <p className="scene-description">{photo.note}</p>
        <p className="photo-chapter-count" aria-label={`Photograph ${photoIndex + 1} of ${photographs.length}`}>
          <span aria-hidden="true">{String(photoIndex + 1).padStart(2, '0')} <span className="photo-count-rule" /> {String(photographs.length).padStart(2, '0')}</span>
        </p>
      </div>
      <figure className="story-photo">
        <div className="photo-mat">
          {failed ? (
            <p className="photo-error" role="status">This photograph could not be opened. The memory is still ours.</p>
          ) : (
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
              decoding="async" onError={() => setFailed(true)} />
          )}
        </div>
        <figcaption>{photo.caption}</figcaption>
      </figure>
    </div>
  )
}

function SceneCopy({ scene, photo, photoIndex, reduced }) {
  if (scene === 'intro') return (
    <>
      <p className="eyebrow">October 8 · a birthday note</p>
      <h1 id="story-title" tabIndex={-1}>Hey,<br /><em>my favourite person.</em></h1>
      <p className="scene-description">I made something for you.<br />Take a little moment with me.</p>
      <BotanicalMark />
    </>
  )
  if (scene === 'message') return (
    <>
      <p className="eyebrow">I tried to put it into words.</p>
      <p className="unsent-message" aria-hidden="true">Happy birthday!</p>
      <h1 id="story-title" tabIndex={-1}>But you deserve<br /><em>more than a message.</em></h1>
      <p className="scene-description">Because you have this way of making<br />the smallest things mean everything.</p>
    </>
  )
  if (scene === 'meaning') return (
    <>
      <p className="eyebrow">The thing about you</p>
      <h1 id="story-title" tabIndex={-1}>Ordinary days.<br /><em>Extraordinary you.</em></h1>
      <p className="scene-description meaning-copy">
        Every laugh. Every adventure. Every quiet moment.<br />
        I love the life that happens in between,<br className="desktop-break" /> because I get to share it with you.
      </p>
      <p className="handwritten">More laughter. More adventures. More us.</p>
    </>
  )
  if (scene === 'photos') return (
    <PhotoScene photo={photo} photoIndex={photoIndex} />
  )
  return (
    <>
      <div className="garden-message">
        <p className="eyebrow">If I could make a feeling bloom</p>
        <h1 id="story-title" tabIndex={-1}>Happy birthday,<br /><em>my love.</em></h1>
        <p className="scene-description">May this year be as beautiful as the world is with you in it.</p>
      </div>
      <BloomGarden reduced={reduced} />
      <p className="garden-dedication">In every lifetime, I would still find you.</p>
    </>
  )
}

function BirthdayStory({ settings }) {
  const scenes = ['intro', 'message', 'meaning', ...photographs.map(() => 'photos'), 'garden']
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(true)
  const navigating = useRef(false)
  const shouldFocus = useRef(false)
  const scene = scenes[index]
  const garden = scene === 'garden'
  useEffect(() => {
    document.getElementById('story-title')?.focus({ preventScroll: true })
  }, [])

  const go = (next) => {
    if (navigating.current || next === index) return
    navigating.current = true
    shouldFocus.current = true
    setReady(false)
    setIndex(next)
  }
  const entered = () => {
    navigating.current = false
    setReady(true)
    if (shouldFocus.current) {
      document.getElementById('story-title')?.focus({ preventScroll: true })
      shouldFocus.current = false
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  return (
    <main className={`birthday-story ${garden ? 'is-garden' : ''}`} data-scene={scene}
      data-photo-index={scene === 'photos' ? index - 3 : undefined} data-ready={ready}>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.section className={`story-scene scene-${scene}`} key={index}
          aria-labelledby="story-title"
          initial={{ opacity: settings.reduced ? 1 : 0, y: settings.reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: settings.reduced ? 1 : 0, y: settings.reduced ? 0 : -12 }}
          transition={{ duration: settings.reduced ? 0 : 0.35 }}
          onAnimationComplete={(definition) => { if (definition.opacity === 1) entered() }}>
          <SceneCopy scene={scene} photo={photographs[index - 3]} photoIndex={index - 3} reduced={settings.reduced} />
        </motion.section>
      </AnimatePresence>
      <nav className="story-controls" aria-label="Your birthday note">
        <div className="navigation-side">
          {index > 0 && <button className="text-button" type="button" onClick={() => go(index - 1)} disabled={!ready}>
            <ArrowLeft size={16} /> Back
          </button>}
        </div>
        <button className="continue-button" type="button" disabled={!ready}
          onClick={() => go(garden ? 0 : index + 1)}>
          {garden ? <><RotateCcw size={16} /> Replay</> : <>{index === 0 ? 'Begin' : 'Continue'} <ArrowRight size={18} /></>}
        </button>
        <div className="navigation-side navigation-side-right">
          {!garden && <button className="text-button skip-button" type="button"
            onClick={() => go(scenes.length - 1)} disabled={!ready}>Skip to flowers</button>}
        </div>
      </nav>
      <div className="story-progress" aria-hidden="true">
        {scenes.map((_, step) => <span key={step} className={step <= index ? 'is-read' : ''} />)}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{ready ? `Part ${index + 1} of ${scenes.length}` : ''}</p>
    </main>
  )
}

export default function App() {
  const settings = useReducedMotion()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [revealFinished, setRevealFinished] = useState(false)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)
  const completeReveal = useCallback(() => setRevealFinished(true), [])
  const [preview] = useState(() => new URLSearchParams(location.search).get('preview') === 'birthday')
  const unlocked = preview || timeLeft.total === 0
  useEffect(() => {
    if (unlocked) return undefined
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), SECOND)
    return () => clearInterval(timer)
  }, [unlocked])
  return (
    <MotionConfig reducedMotion={settings.reduced ? 'always' : 'never'}
      transition={{ duration: settings.reduced ? 0 : 0.35 }}>
      {!unlocked ? <Countdown timeLeft={timeLeft} settings={settings} />
        : !revealFinished ? <BirthdayReveal reduced={settings.reduced} onComplete={completeReveal} />
          : !welcomeDismissed ? <BirthdayWelcome onDismiss={() => setWelcomeDismissed(true)} />
            : <BirthdayStory settings={settings} />}
    </MotionConfig>
  )
}
