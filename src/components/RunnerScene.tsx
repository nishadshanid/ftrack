import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

/**
 * EMI progress scene: a runner sprints toward the phone he's paying off.
 *
 * His limbs are two-segment (thigh+shin, upper-arm+forearm) and pump through a
 * proper run cycle via CSS rotations about each joint (transform-box: fill-box,
 * so every joint pivots about its own top-left corner). His horizontal position
 * is driven by `pct` — the more paid, the closer he gets — animated with a
 * framer-motion run-up. Month milestones line the track; at 100% he reaches the
 * phone and it celebrates.
 */

const P = 0.5 // one stride, seconds

const css = `
@keyframes emi-thigh { 0%{transform:rotate(40deg)} 25%{transform:rotate(8deg)} 50%{transform:rotate(-30deg)} 75%{transform:rotate(0deg)} 100%{transform:rotate(40deg)} }
@keyframes emi-shin  { 0%{transform:rotate(6deg)} 25%{transform:rotate(48deg)} 50%{transform:rotate(80deg)} 75%{transform:rotate(96deg)} 100%{transform:rotate(6deg)} }
@keyframes emi-uarm  { 0%{transform:rotate(-38deg)} 50%{transform:rotate(40deg)} 100%{transform:rotate(-38deg)} }
@keyframes emi-farm  { 0%{transform:rotate(-74deg)} 50%{transform:rotate(-36deg)} 100%{transform:rotate(-74deg)} }
@keyframes emi-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes emi-dust  { 0%{transform:translate(0,0) scale(.4);opacity:.55} 100%{transform:translate(-18px,-4px) scale(2);opacity:0} }
@keyframes emi-sweat { 0%{transform:translate(0,0);opacity:0} 25%{opacity:.9} 100%{transform:translate(-9px,-9px);opacity:0} }
@keyframes emi-dash  { to { stroke-dashoffset:-34 } }
@keyframes emi-cloud { to { transform:translateX(-220px) } }
@keyframes emi-spark { 0%,100%{opacity:.1;transform:scale(.5)} 50%{opacity:1;transform:scale(1)} }
@keyframes emi-banner{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2.5px)} }
.emi-j { transform-box: fill-box; transform-origin: left top; }
.emi-c { transform-box: fill-box; transform-origin: center; }
`

const anim = (a: string): CSSProperties => ({ animation: a })

// Two-segment leg: thigh pivots at the hip, shin pivots at the knee.
function Leg({ delay, thigh, shin, shoe, w }: { delay: string; thigh: string; shin: string; shoe: string; w: number }) {
  return (
    <g className="emi-j" style={anim(`emi-thigh ${P}s ease-in-out ${delay} infinite`)}>
      <line x1={0} y1={0} x2={1} y2={13} stroke={thigh} strokeWidth={w} strokeLinecap="round" />
      <g transform="translate(1,13)">
        <g className="emi-j" style={anim(`emi-shin ${P}s ease-in-out ${delay} infinite`)}>
          <line x1={0} y1={0} x2={0} y2={13} stroke={shin} strokeWidth={w - 0.5} strokeLinecap="round" />
          <path d="M0,11.5 L7,12 Q11,12 11,14.6 Q11,16.2 8,16.2 L2,16.2 Q0,16.2 0,14.2 Z" fill={shoe} />
        </g>
      </g>
    </g>
  )
}

// Two-segment arm: upper arm pivots at the shoulder, forearm at the elbow.
function Arm({ delay, skin, w }: { delay: string; skin: string; w: number }) {
  return (
    <g className="emi-j" style={anim(`emi-uarm ${P}s ease-in-out ${delay} infinite`)}>
      <line x1={0} y1={0} x2={1} y2={11} stroke={skin} strokeWidth={w} strokeLinecap="round" />
      <g transform="translate(1,11)">
        <g className="emi-j" style={anim(`emi-farm ${P}s ease-in-out ${delay} infinite`)}>
          <line x1={0} y1={0} x2={1} y2={10} stroke={skin} strokeWidth={w - 0.5} strokeLinecap="round" />
          <circle cx={2.6} cy={11} r={2.6} fill={skin} />
        </g>
      </g>
    </g>
  )
}

function Clouds() {
  const c = (x: number, y: number, s: number) => (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="rgba(255,255,255,0.92)">
      <circle cx="0" cy="0" r="7" />
      <circle cx="9" cy="-3" r="9" />
      <circle cx="19" cy="0" r="7" />
      <rect x="-2" y="0" width="23" height="7" rx="3" />
    </g>
  )
  return (
    <g>
      {c(30, 34, 1)}
      {c(120, 24, 0.8)}
      {c(180, 44, 0.95)}
    </g>
  )
}

const SPARKS = [
  [330, 66],
  [378, 76],
  [354, 56],
  [380, 104],
  [328, 100],
]

export function RunnerScene({ pct, paid, total }: { pct: number; paid: number; total: number }) {
  const { dark } = useTheme()
  const clamped = Math.max(0, Math.min(100, pct))
  const done = clamped >= 100

  // Run-up: from the left to just shy of the phone at the finish.
  const START = 16
  const END = 298
  const x = START + ((END - START) * clamped) / 100

  const skinN = '#f2c9a0' // near limbs
  const skinF = '#d8a87f' // far limbs (shaded for depth)
  const shirt = '#f97316'
  const hair = '#3a2417'
  const shoeN = '#f8fafc'
  const shoeF = '#cbd5e1'

  const sky = dark ? ['#0b1230', '#22315c'] : ['#bfe0ff', '#eef7ff']
  const buildingFill = dark ? '#16223f' : '#aac6e4'
  const groundTop = dark ? '#2a3650' : '#cdd7e6'
  const groundBot = dark ? '#1a2235' : '#a9b9cd'

  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/15"
      aria-label={`Runner ${clamped}% of the way to the phone — ${paid} of ${total} months paid`}
      role="img"
    >
      <style>{css}</style>
      <svg viewBox="0 0 400 150" className="w-full">
        <defs>
          <linearGradient id="emi-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
          <linearGradient id="emi-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={groundTop} />
            <stop offset="1" stopColor={groundBot} />
          </linearGradient>
          <radialGradient id="emi-sun">
            <stop offset="0" stopColor={dark ? 'rgba(226,232,240,0.9)' : 'rgba(255,236,150,0.95)'} />
            <stop offset="1" stopColor={dark ? 'rgba(226,232,240,0)' : 'rgba(255,236,150,0)'} />
          </radialGradient>
          <filter id="emi-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="150" fill="url(#emi-sky)" />

        {/* Sun / moon */}
        <circle cx="62" cy="34" r="26" fill="url(#emi-sun)" />
        <circle cx="62" cy="34" r="13" fill={dark ? '#e2e8f0' : '#ffd34d'} />
        {dark && <circle cx="56" cy="30" r="11" fill="url(#emi-sky)" />}

        {/* Drifting clouds */}
        <g style={anim('emi-cloud 34s linear infinite')}>
          <Clouds />
          <g transform="translate(220,0)">
            <Clouds />
          </g>
        </g>

        {/* Distant skyline */}
        <g fill={buildingFill} opacity={dark ? 0.9 : 0.8}>
          {[
            [20, 96, 26],
            [50, 104, 18],
            [78, 88, 22],
            [150, 100, 20],
            [196, 92, 24],
            [232, 106, 16],
            [262, 96, 22],
          ].map(([bx, by, bw], i) => (
            <rect key={i} x={bx} y={by} width={bw} height={124 - by} rx={1.5} />
          ))}
        </g>

        {/* Ground */}
        <rect x="0" y="124" width="400" height="26" fill="url(#emi-ground)" />
        <rect x="0" y="124" width="400" height="1.5" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)'} />

        {/* Month milestone markers along the track */}
        {Array.from({ length: total }).map((_, i) => {
          const mx = START + ((END - START) * (i + 1)) / total
          const reached = i < paid
          return (
            <g key={i}>
              <rect
                x={mx - 0.8}
                y={129}
                width={1.6}
                height={6}
                rx={0.8}
                fill={reached ? '#22c55e' : dark ? '#4b5874' : '#94a3b8'}
              />
              <circle cx={mx} cy={129} r={2.4} fill={reached ? '#22c55e' : dark ? '#4b5874' : '#94a3b8'} />
            </g>
          )
        })}

        {/* Track centre line, scrolling for a sense of speed */}
        <line
          x1="0"
          y1="140"
          x2="400"
          y2="140"
          stroke={dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.7)'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="16 14"
          style={anim('emi-dash 0.5s linear infinite')}
        />

        {/* Finish line + the prize phone */}
        <g transform="translate(320,80)">
          <rect x="0" y="0" width="3" height="44" fill={dark ? '#94a3b8' : '#64748b'} />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 2 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={3 + c * 5} y={r * 5} width="5" height="5" fill={(r + c) % 2 ? '#ffffff' : '#1f2937'} />
            )),
          )}
        </g>

        <g>
          {done && <circle cx="356" cy="98" r="30" fill="#22c55e" opacity="0.35" filter="url(#emi-glow)" />}
          {/* floating "NEW PHONE" banner */}
          <g style={anim('emi-banner 2.6s ease-in-out infinite')}>
            <rect x="335" y="60" width="42" height="12" rx="6" fill={dark ? '#1e293b' : '#ffffff'} stroke="#f97316" strokeWidth="1" />
            <text x="356" y="69" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#f97316">
              NEW PHONE
            </text>
          </g>
          {/* pedestal */}
          <rect x="343" y="116" width="26" height="8" rx="2" fill={dark ? '#0f172a' : '#475569'} />
          {/* gift bow on top */}
          <circle cx="352" cy="80" r="2.6" fill="#ef4444" />
          <circle cx="360" cy="80" r="2.6" fill="#ef4444" />
          {/* phone */}
          <rect x="346" y="80" width="20" height="38" rx="4" fill="#111827" stroke={done ? '#22c55e' : '#334155'} strokeWidth="1.5" />
          <rect x="348.5" y="83" width="15" height="32" rx="2" fill={done ? '#16351f' : dark ? '#0b1f3a' : '#1e3a5f'} />
          {done ? (
            <path d="M351,99 l3.5,4 6.5,-8" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <text x="356" y="103" textAnchor="middle" fontSize="13" fontWeight="700" fill="#7dd3fc">
              ₹
            </text>
          )}
        </g>

        {/* The runner */}
        <motion.g initial={{ x: START }} animate={{ x }} transition={{ duration: 1.2, ease: 'easeOut' }}>
          {/* vertical placement on the wrapper (attribute), bob on the inner g
              (CSS transform) — keeping them separate so neither overrides the other */}
          <g transform="translate(0,98)">
          <g style={anim(`emi-bob ${P / 2}s ease-in-out infinite`)}>
            {/* ground contact shadow */}
            <ellipse cx={1} cy={26} rx={13} ry={3} fill="rgba(0,0,0,0.16)" filter="url(#emi-glow)" />

            {/* speed lines trailing behind */}
            {[-12, -5, 2].map((y, i) => (
              <line
                key={i}
                x1={-9 - i * 2}
                y1={y}
                x2={-22 - i * 2}
                y2={y}
                stroke={dark ? 'rgba(148,163,184,0.5)' : 'rgba(255,255,255,0.7)'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}

            {/* dust kicked up at the feet */}
            {[0, 0.25, 0.5].map((d, i) => (
              <circle
                key={i}
                cx={-7}
                cy={24}
                r={2.6}
                fill={dark ? 'rgba(203,213,225,0.5)' : 'rgba(255,255,255,0.8)'}
                style={anim(`emi-dust 0.9s ease-out ${d}s infinite`)}
              />
            ))}

            {/* far-side limbs (behind the torso) */}
            <g transform="translate(0,0)">
              <Leg delay="-0.25s" thigh={skinF} shin={skinF} shoe={shoeF} w={6} />
            </g>
            <g transform="translate(1,-20)">
              <Arm delay="0s" skin={skinF} w={4.5} />
            </g>

            {/* torso + shorts */}
            <line x1={1} y1={-20} x2={0} y2={0} stroke={shirt} strokeWidth={11} strokeLinecap="round" />
            <line x1={-1.5} y1={-19} x2={-2.5} y2={-2} stroke="rgba(0,0,0,0.12)" strokeWidth={3} strokeLinecap="round" />
            <rect x={-5} y={-3} width={11} height={9} rx={3} fill="#1f2937" />

            {/* head */}
            <line x1={1} y1={-20} x2={3} y2={-24} stroke={skinN} strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={4} cy={-31} r={7.5} fill={skinN} />
            <path d="M4,-39 A8,8 0 0 0 -3.5,-29 Q-1,-35 4,-34 Z" fill={hair} />
            <path d="M-3.6,-32 q9,-4 11,1" fill="none" stroke="#f97316" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={8} cy={-31} r={1.2} fill="#27303f" />
            {/* sweat fleck */}
            <circle cx={9} cy={-35} r={1.6} fill="#bae6fd" style={anim('emi-sweat 1.1s ease-out 0.3s infinite')} />

            {/* near-side limbs (in front) */}
            <g transform="translate(1,-20)">
              <Arm delay="-0.25s" skin={skinN} w={5} />
            </g>
            <circle cx={1} cy={-20} r={3} fill={shirt} />
            <g transform="translate(0,0)">
              <Leg delay="0s" thigh={skinN} shin={skinN} shoe={shoeN} w={6.5} />
            </g>
          </g>
          </g>
        </motion.g>

        {/* celebration sparkles */}
        {done &&
          SPARKS.map(([sx, sy], i) => (
            <g key={i} className="emi-c" style={anim(`emi-spark ${1.2 + (i % 3) * 0.4}s ease-in-out ${i * 0.2}s infinite`)}>
              <path
                d={`M${sx},${sy - 4} L${sx + 1.2},${sy - 1.2} L${sx + 4},${sy} L${sx + 1.2},${sy + 1.2} L${sx},${sy + 4} L${sx - 1.2},${sy + 1.2} L${sx - 4},${sy} L${sx - 1.2},${sy - 1.2} Z`}
                fill="#fde68a"
              />
            </g>
          ))}
      </svg>
    </div>
  )
}
