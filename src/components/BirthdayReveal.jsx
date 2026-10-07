import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import '../styles/reveal.css'

export const BIRTHDAY_REVEAL_DURATION = 3600
export const REDUCED_REVEAL_DURATION = 800

const petals = Array.from({ length: 18 }, (_, index) => {
  const angle = index * Math.PI * 2 / 18
  const radius = 24 + (index % 3) * 7
  return {
    '--petal-x': `${Math.cos(angle) * radius}vmin`,
    '--petal-y': `${Math.sin(angle) * radius - 7}vmin`,
    '--petal-turn': `${index * 37 + 90}deg`,
    '--petal-delay': `${0.35 + index * 0.035}s`,
  }
})

export default function BirthdayReveal({ reduced, onComplete }) {
  const duration = reduced ? REDUCED_REVEAL_DURATION : BIRTHDAY_REVEAL_DURATION
  useEffect(() => {
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <main className="birthday-reveal" data-reduced={reduced}
      style={{ '--reveal-duration': `${duration}ms` }} aria-labelledby="reveal-title">
      <div className="reveal-glow" aria-hidden="true" />
      <div className="reveal-petals" aria-hidden="true">
        {petals.map((style, index) => <span className="reveal-petal" style={style} key={index} />)}
      </div>
      <div className="reveal-content">
        <svg className="reveal-heart" viewBox="0 0 200 180" fill="none" aria-hidden="true">
          <path className="reveal-heart-outline" pathLength="1"
            d="M100 155C78 139 25 102 25 61C25 21 77 10 100 48C123 10 175 21 175 61C175 102 122 139 100 155Z" />
          <path className="reveal-heart-inner" pathLength="1"
            d="M100 143C80 129 38 97 38 64C38 34 77 25 100 62C123 25 162 34 162 64C162 97 120 129 100 143Z" />
        </svg>
        <p className="eyebrow">The wait is over</p>
        <h1 id="reveal-title">Today is all<br /><em>about you.</em></h1>
        <p className="reveal-dedication">A little love. A little magic. Just for you.</p>
      </div>
      <button className="reveal-skip text-button" type="button" onClick={onComplete}>
        Open my surprise <ArrowRight size={15} />
      </button>
      <span className="sr-only" role="status">Your birthday surprise is opening.</span>
    </main>
  )
}
