import { useId } from 'react'

const PETALS_PER_RING = 18
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const seeds = Array.from({ length: 144 }, (_, index) => {
  const radius = Math.sqrt((index + 0.5) / 144) * 30
  const angle = index * GOLDEN_ANGLE
  return { x: 100 + radius * Math.cos(angle), y: 100 + radius * Math.sin(angle), angle }
})

export default function SunflowerHead() {
  const id = useId()
  return (
    <svg className="sunflower-head" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-petal`} x1="0" y1="1" x2="0.15" y2="0">
          <stop offset="0" stopColor="#c67b16" />
          <stop offset="0.42" stopColor="#f4bb2f" />
          <stop offset="1" stopColor="#ffe892" />
        </linearGradient>
        <radialGradient id={`${id}-centre`} cx="42%" cy="36%" r="64%">
          <stop offset="0" stopColor="#674122" />
          <stop offset="0.72" stopColor="#44281c" />
          <stop offset="1" stopColor="#2e1916" />
        </radialGradient>
        <radialGradient id={`${id}-bud`}>
          <stop offset="0" stopColor="#a4936a" />
          <stop offset="1" stopColor="#695741" />
        </radialGradient>
      </defs>
      <g className="sunflower-open">
        {[0, 1].map((ring) => (
          <g className={`sunflower-ring sunflower-ring-${ring}`} key={ring}>
            {Array.from({ length: PETALS_PER_RING }, (_, index) => (
              <g key={index} transform={`rotate(${index * 20 + ring * 10} 100 100)`}>
                <g className="sunflower-petal" style={{ '--petal-order': index + ring * 4 }}>
                  <path
                    d={ring === 0
                      ? 'M92 79 C81 61 84 28 100 5 C116 28 119 61 108 79 Q100 86 92 79Z'
                      : 'M93 81 C80 67 86 38 100 17 C114 38 120 67 107 81 Q100 87 93 81Z'}
                    fill={`url(#${id}-petal)`}
                    stroke="#d49725" strokeWidth="0.45"
                  />
                  <path className="sunflower-vein" d="M100 77 Q96 49 100 25" />
                </g>
              </g>
            ))}
          </g>
        ))}
        <g className="sunflower-centre">
          <circle cx="100" cy="100" r="35" fill="#d39a35" />
          <circle cx="100" cy="100" r="32.5" fill={`url(#${id}-centre)`} />
          {seeds.map((seed, index) => (
            <ellipse className="sunflower-seed" key={index} cx={seed.x} cy={seed.y}
              rx="1.05" ry="1.7" transform={`rotate(${seed.angle * 180 / Math.PI} ${seed.x} ${seed.y})`}
              fill={index % 3 === 0 ? '#c9a368' : '#947047'} />
          ))}
          <circle cx="100" cy="100" r="5" fill="#50321f" />
        </g>
      </g>
      <g className="sunflower-bud">
        <ellipse cx="100" cy="102" rx="19" ry="27" fill={`url(#${id}-bud)`} />
        <path d="M100 130Q75 105 91 77Q100 94 100 130ZM100 130Q126 105 109 77Q99 94 100 130Z"
          fill="#887652" stroke="#b6a477" strokeWidth="0.7" />
      </g>
    </svg>
  )
}
