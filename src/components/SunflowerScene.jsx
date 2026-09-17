import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

const PETALS = Array.from({ length: 24 }, (_, index) => index * 15)
const SEEDS = Array.from({ length: 18 }, (_, index) => {
  const angle = index * 137.5 * (Math.PI / 180)
  const radius = 5 + index * 1.35
  return {
    x: 250 + Math.cos(angle) * radius,
    y: 188 + Math.sin(angle) * radius,
    size: 2.2 + (index % 3) * 0.45,
  }
})

function SunflowerScene({ onBloomComplete, reducedMotion }) {
  const root = useRef(null)
  const stem = useRef(null)
  const leftLeaf = useRef(null)
  const rightLeaf = useRef(null)
  const petals = useRef([])
  const center = useRef(null)
  const seeds = useRef([])
  const sparkles = useRef([])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(
          [stem.current, leftLeaf.current, rightLeaf.current, ...petals.current, center.current, ...seeds.current],
          { opacity: 1, scale: 1, strokeDashoffset: 0 },
        )
        onBloomComplete()
        return
      }

      const length = stem.current.getTotalLength()
      gsap.set(stem.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      })
      gsap.set([leftLeaf.current, rightLeaf.current], {
        opacity: 0,
        scale: 0,
        transformOrigin: '50% 100%',
      })
      gsap.set(petals.current, {
        opacity: 0,
        scale: 0,
        transformOrigin: '50% 100%',
      })
      gsap.set(center.current, {
        opacity: 0,
        scale: 0,
        transformOrigin: '50% 50%',
      })
      gsap.set(seeds.current, { opacity: 0, scale: 0 })
      gsap.set(sparkles.current, { opacity: 0, scale: 0 })

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: onBloomComplete,
      })

      timeline
        .to(stem.current, { strokeDashoffset: 0, duration: 1.65, ease: 'power2.inOut' })
        .to(
          [leftLeaf.current, rightLeaf.current],
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.18, ease: 'back.out(1.8)' },
          '-=0.72',
        )
        .to(
          petals.current,
          { opacity: 1, scale: 1, duration: 0.85, stagger: 0.035, ease: 'back.out(1.7)' },
          '-=0.25',
        )
        .to(center.current, { opacity: 1, scale: 1, duration: 0.72, ease: 'back.out(1.5)' }, '-=0.55')
        .to(
          seeds.current,
          { opacity: 1, scale: 1, duration: 0.35, stagger: 0.025, ease: 'back.out(2)' },
          '-=0.4',
        )
        .to(
          sparkles.current,
          { opacity: 0.7, scale: 1, duration: 0.5, stagger: 0.1 },
          '-=0.2',
        )

      gsap.to('.flower-head', {
        rotation: 1.8,
        transformOrigin: '50% 100%',
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 3.2,
      })

      gsap.to(sparkles.current, {
        y: -8,
        opacity: 0.25,
        duration: 1.7,
        stagger: 0.24,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 3.4,
      })
    }, root)

    return () => context.revert()
  }, [onBloomComplete, reducedMotion])

  return (
    <div className="sunflower-wrap" ref={root}>
      <svg
        className="sunflower"
        viewBox="0 0 500 560"
        role="img"
        aria-labelledby="sunflower-title sunflower-description"
      >
        <title id="sunflower-title">An animated sunflower</title>
        <desc id="sunflower-description">
          A sunflower grows from its stem, opens its leaves, and blooms into golden petals.
        </desc>

        <ellipse className="ground-shadow" cx="250" cy="516" rx="92" ry="15" />

        <path
          ref={stem}
          className="stem"
          d="M250 510 C238 435 274 365 251 293 C243 267 246 237 250 216"
        />

        <g ref={leftLeaf} className="leaf leaf-left">
          <path d="M244 388 C183 362 148 385 141 430 C188 430 226 416 244 388 Z" />
          <path className="leaf-vein" d="M235 393 C206 401 180 412 153 422" />
        </g>
        <g ref={rightLeaf} className="leaf leaf-right">
          <path d="M257 337 C310 301 349 315 366 355 C322 369 283 361 257 337 Z" />
          <path className="leaf-vein" d="M267 339 C299 340 326 346 352 353" />
        </g>

        <g className="flower-head">
          <g className="rear-petals">
            {PETALS.map((angle, index) => (
              <g
                key={angle}
                ref={(element) => {
                  petals.current[index] = element
                }}
                transform={`rotate(${angle} 250 190)`}
              >
                <ellipse className="petal" cx="250" cy="116" rx="18" ry="62" />
                <ellipse className="petal-sheen" cx="245" cy="110" rx="5" ry="36" />
              </g>
            ))}
          </g>

          <g ref={center} className="flower-center">
            <circle className="center-halo" cx="250" cy="190" r="62" />
            <circle className="center-core" cx="250" cy="190" r="51" />
            {SEEDS.map((seed, index) => (
              <circle
                key={`${seed.x}-${seed.y}`}
                ref={(element) => {
                  seeds.current[index] = element
                }}
                className="seed"
                cx={seed.x}
                cy={seed.y}
                r={seed.size}
              />
            ))}
          </g>
        </g>

        <g className="sparkles" aria-hidden="true">
          {[
            [126, 183, 6],
            [382, 143, 5],
            [112, 286, 4],
            [395, 256, 6],
          ].map(([x, y, radius], index) => (
            <circle
              key={`${x}-${y}`}
              ref={(element) => {
                sparkles.current[index] = element
              }}
              className="sparkle"
              cx={x}
              cy={y}
              r={radius}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

export default SunflowerScene
