import { useEffect, useState } from 'react'
import SunflowerHead from './SunflowerHead.jsx'
import '../styles/flowers.css'
import '../styles/garden.css'

const longGrassDelays = [
  [3, 2.2, 3.4, 3.6], [3.6, 3.8, 4, 4.2], [4, 4.2, 4.4, 4.6],
  [4, 4.2, 3, 3.6], [4, 4.2, 3, 3.6], [4, 4.2, 3, 3.6],
  [4.2, 4.4, 4.6, 4.8], [3, 3.2, 3.5, 3.6],
]
const parts = (count, className) => Array.from({ length: count }, (_, i) => (
  <div key={i} className={`${className} ${className}--${i + 1}`} />
))

// React adaptation of GMP Sankalpa's MIT-licensed FLORES.html; license shipped in public/licenses.
export default function BloomGarden({ reduced }) {
  const [bloomed, setBloomed] = useState(false)
  useEffect(() => {
    if (reduced) return undefined
    setBloomed(false)
    const timer = setTimeout(() => setBloomed(true), 7200)
    return () => clearTimeout(timer)
  }, [reduced])
  return (
    <div className="bloom-garden" data-state={reduced ? 'still' : bloomed ? 'bloomed' : 'growing'}
      role="img" aria-label="Golden sunflowers unfolding their petals around dark spiral seed centres, surrounded by softly drifting lights">
      <div className="garden-haze" aria-hidden="true" />
      <div className="flowers" aria-hidden="true">
        {[1, 2, 3].map((number) => (
          <div className={`flower flower--${number} sunflower`} key={number}
            style={{ '--bloom-delay': `${1.55 + (number - 1) * 0.4}s` }}>
            <div className="flower__leafs sunflower-crown">
              <SunflowerHead />
              {parts(8, 'flower__light')}
            </div>
            <div className="flower__line">{parts(number === 1 ? 6 : 4, 'flower__line__leaf')}</div>
          </div>
        ))}
        <div className="grow-ans" style={{ '--d': '1.2s' }}>
          <div className="flower__g-long">
            <div className="flower__g-long__top" /><div className="flower__g-long__bottom" />
          </div>
        </div>
        {[1, 2].map((number) => (
          <div className="growing-grass" key={number}>
            <div className={`flower__grass flower__grass--${number}`}>
              <div className="flower__grass--top" /><div className="flower__grass--bottom" />
              {parts(8, 'flower__grass__leaf')}<div className="flower__grass__overlay" />
            </div>
          </div>
        ))}
        {[1, 2].map((number) => (
          <div className="grow-ans" style={{ '--d': `${number === 1 ? 2.4 : 2.8}s` }} key={number}>
            <div className={`flower__g-right flower__g-right--${number}`}><div className="leaf" /></div>
          </div>
        ))}
        <div className="grow-ans" style={{ '--d': '2.8s' }}>
          <div className="flower__g-front">
            {Array.from({ length: 8 }, (_, i) => (
              <div className={`flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${i + 1}`} key={i}>
                <div className="flower__g-front__leaf" />
              </div>
            ))}
            <div className="flower__g-front__line" />
          </div>
        </div>
        <div className="grow-ans" style={{ '--d': '3.2s' }}>
          <div className="flower__g-fr"><div className="leaf" />{parts(8, 'flower__g-fr__leaf')}</div>
        </div>
        {longGrassDelays.map((delays, number) => (
          <div className={`long-g long-g--${number}`} key={number}>
            {delays.map((delay, leaf) => (
              <div className="grow-ans" style={{ '--d': `${delay}s` }} key={leaf}>
                <div className={`leaf leaf--${leaf}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
