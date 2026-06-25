import type { CSSProperties, ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'

/**
 * A lively, looping ride scene shown on the dashboard:
 * parallax sky / hills / trees / road, a sun (or moon + stars in dark mode),
 * drifting clouds, and a scooter, car and motorbike that take turns driving
 * across — each with a rider, spinning wheels, headlight, exhaust and speed
 * lines.
 *
 * Motion is done with CSS animations (reliable for SVG transforms on every
 * browser, and GPU-friendly). Graphics are pure inline SVG.
 */

// Vehicles take turns: one shared period, evenly staggered, so only one is on
// screen at a time with a short empty gap between.
const CROSS = 5 // seconds to drive across
const PERIOD = 24 // full cycle; stagger = PERIOD / 3 = 8s → ~3s empty road between
const CROSS_PCT = ((CROSS / PERIOD) * 100).toFixed(2) // when the crossing ends

const css = `
@keyframes ftk-cross {
  0%   { transform: translateX(-140px); }
  ${CROSS_PCT}% { transform: translateX(430px); }
  100% { transform: translateX(430px); }
}
@keyframes ftk-bob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes ftk-spin  { to { transform: rotate(360deg); } }
@keyframes ftk-scroll{ to { transform: translateX(-400px); } }
@keyframes ftk-dash  { to { stroke-dashoffset: -42; } }
@keyframes ftk-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes ftk-speed { 0% { transform: translateX(2px); opacity: 0; } 50% { opacity: .8; } 100% { transform: translateX(-12px); opacity: 0; } }
@keyframes ftk-puff  { 0% { transform: translate(0,0) scale(.5); opacity: .5; } 100% { transform: translate(-16px,-4px) scale(2.2); opacity: 0; } }
.ftk-spin { transform-box: fill-box; transform-origin: center; }
.ftk-puff { transform-box: fill-box; transform-origin: center; }
`

const anim = (a: string): CSSProperties => ({ animation: a })

// ── A spinning wheel ───────────────────────────────────────────────────────
function Wheel({ cx, cy, r, dur = 0.55 }: { cx: number; cy: number; r: number; dur?: number }) {
  const angles = [0, 45, 90, 135]
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#15181f" />
      <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke="#2b303b" strokeWidth={r * 0.18} />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#d7dde6" />
      <g className="ftk-spin" style={anim(`ftk-spin ${dur}s linear infinite`)}>
        {angles.map((a) => {
          const rad = (a * Math.PI) / 180
          const dx = Math.cos(rad) * r * 0.46
          const dy = Math.sin(rad) * r * 0.46
          return (
            <line
              key={a}
              x1={cx - dx}
              y1={cy - dy}
              x2={cx + dx}
              y2={cy + dy}
              stroke="#9aa6b6"
              strokeWidth={r * 0.16}
              strokeLinecap="round"
            />
          )
        })}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#5b6675" />
    </g>
  )
}

function SpeedLines({ x, y, color = 'rgba(255,255,255,0.55)' }: { x: number; y: number; color?: string }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={x}
          y1={y + i * 6}
          x2={x - 16}
          y2={y + i * 6}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          style={anim(`ftk-speed 0.7s ease-out ${i * 0.18}s infinite`)}
        />
      ))}
    </g>
  )
}

function Puffs({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 0.5, 1].map((delay, i) => (
        <circle
          key={i}
          className="ftk-puff"
          cx={x}
          cy={y}
          r={3}
          fill="rgba(255,255,255,0.45)"
          style={anim(`ftk-puff 1.2s ease-out ${delay}s infinite`)}
        />
      ))}
    </g>
  )
}

// ── A vehicle that drives across, bobbing, with its ground shadow ──────────
function Ride({ delay, shadowWidth, children }: { delay: number; shadowWidth: number; children: ReactNode }) {
  return (
    <g style={anim(`ftk-cross ${PERIOD}s linear ${delay}s infinite both`)}>
      <ellipse cx={shadowWidth / 2} cy={151} rx={shadowWidth / 2} ry={4} fill="rgba(0,0,0,0.22)" filter="url(#soft)" />
      <g style={anim('ftk-bob 0.55s ease-in-out infinite')}>{children}</g>
    </g>
  )
}

function Scooter() {
  return (
    <g>
      <SpeedLines x={-2} y={120} />
      <Puffs x={2} y={140} />
      <path d="M8,140 Q3,123 17,121 L35,121 Q45,121 45,132 L45,140 Z" fill="url(#scoot)" />
      <path d="M48,140 L48,117 Q48,111 55,111 L58,111 L59,140 Z" fill="url(#scoot)" />
      <rect x="30" y="133" width="20" height="5" rx="2" fill="#1f2530" />
      <rect x="12" y="116" width="22" height="6" rx="3" fill="#222833" />
      <line x1="55" y1="113" x2="61" y2="104" stroke="#2b3240" strokeWidth="3" strokeLinecap="round" />
      <circle cx="61" cy="103" r="2.2" fill="#1f2530" />
      <path d="M26,123 L40,133" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
      <path d="M26,124 L21,135 L28,135" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20" y="103" width="10" height="18" rx="5" fill="#2563eb" />
      <line x1="28" y1="108" x2="58" y2="111" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
      <circle cx="25" cy="98" r="6.5" fill="#f1f5f9" />
      <path d="M25,92 A6.5,6.5 0 0 1 31,99 L25,99 Z" fill="#38bdf8" />
      <Wheel cx={12} cy={140} r={10} />
      <Wheel cx={54} cy={140} r={10} />
    </g>
  )
}

function Car() {
  return (
    <g>
      <SpeedLines x={-4} y={120} />
      <Puffs x={2} y={136} />
      <path
        d="M6,139 L6,126 Q6,118 16,116 L30,114 L44,99 L66,99 L80,114 L94,116 Q104,118 104,126 L104,139 Z"
        fill="url(#car)"
      />
      <path d="M6,139 L104,139 L104,131 L6,131 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M30,114 L44,100 L66,100 L79,114" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d="M46,101 L64,101 L76,114 L34,114 Z" fill="#1e3a5f" />
      <rect x="53" y="101" width="3" height="13" fill="url(#car)" />
      <rect x="47" y="108" width="13" height="7" rx="2" fill="#ef4444" />
      <circle cx="55" cy="105" r="5.5" fill="#f2c9a0" />
      <path d="M49.5,104 A5.5,5.5 0 0 1 60.5,104 Z" fill="#3f2a1a" />
      <path d="M46,101 L64,101 L76,114 L34,114 Z" fill="rgba(255,255,255,0.16)" />
      <path d="M46,101 L56,101 L48,114 L34,114 Z" fill="rgba(255,255,255,0.12)" />
      <line x1="55" y1="116" x2="55" y2="137" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
      <rect x="60" y="122" width="6" height="2" rx="1" fill="rgba(0,0,0,0.3)" />
      <circle cx="7" cy="123" r="2.6" fill="#ff5a5a" />
      <circle cx="103" cy="123" r="3" fill="#fff3b0" />
      <path d="M103,123 L126,116 L126,131 Z" fill="url(#beam)" filter="url(#glow)" />
      <Wheel cx={28} cy={139} r={11} />
      <Wheel cx={80} cy={139} r={11} />
    </g>
  )
}

function Motorbike() {
  return (
    <g>
      <SpeedLines x={-6} y={118} />
      <line x1="16" y1="133" x2="42" y2="120" stroke="#2b3240" strokeWidth="3" strokeLinecap="round" />
      <rect x="34" y="123" width="20" height="12" rx="2" fill="#3a4150" />
      <path d="M40,124 Q44,112 58,114 L63,119 L60,124 Z" fill="url(#bike)" />
      <rect x="24" y="116" width="20" height="5" rx="2" fill="#1f2530" />
      <line x1="55" y1="124" x2="70" y2="107" stroke="#5b6675" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="124" x2="71" y2="108" stroke="#5b6675" strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="108" x2="74" y2="106" stroke="#2b3240" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="132" x2="74" y2="137" stroke="#aab3c0" strokeWidth="3" strokeLinecap="round" />
      <Puffs x={74} y={137} />
      <path d="M30,121 L36,134 L44,134" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30,120 L52,105" stroke="#16a34a" strokeWidth="9" strokeLinecap="round" />
      <line x1="52" y1="106" x2="70" y2="107" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="58" cy="99" r="6.5" fill="#ef4444" />
      <path d="M58,93 A6.5,6.5 0 0 1 64,100 L58,100 Z" fill="#bfe3ff" />
      <circle cx="73" cy="112" r="2.4" fill="#fff3b0" />
      <path d="M73,112 L94,107 L94,119 Z" fill="url(#beam)" filter="url(#glow)" />
      <Wheel cx={14} cy={137} r={13} dur={0.5} />
      <Wheel cx={78} cy={137} r={13} dur={0.5} />
    </g>
  )
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="rgba(255,255,255,0.9)">
      <circle cx="0" cy="0" r="9" />
      <circle cx="11" cy="-3" r="11" />
      <circle cx="24" cy="0" r="9" />
      <rect x="-2" y="0" width="28" height="9" rx="4" />
    </g>
  )
}

function Tree({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},0)`}>
      <rect x="-2" y="118" width="4" height="14" rx="1" fill="#5b3b1f" />
      <circle cx="0" cy="112" r="11" fill="var(--leaf)" />
      <circle cx="-7" cy="118" r="8" fill="var(--leaf)" />
      <circle cx="7" cy="118" r="8" fill="var(--leaf)" />
    </g>
  )
}

// Two side-by-side copies, scrolled left forever (parallax).
function Parallax({ width, duration, children }: { width: number; duration: number; children: ReactNode }) {
  return (
    <g style={anim(`ftk-scroll ${duration}s linear infinite`)}>
      <g>{children}</g>
      <g transform={`translate(${width},0)`}>{children}</g>
    </g>
  )
}

const STARS = [
  [20, 28], [55, 16], [88, 40], [130, 22], [165, 50], [205, 18],
  [240, 38], [280, 24], [315, 52], [360, 20], [385, 44], [110, 60],
]

export function RideScene() {
  const { dark } = useTheme()

  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/15"
      style={{ ['--leaf' as string]: dark ? '#1f5135' : '#43a047' }}
    >
      <style>{css}</style>
      <svg viewBox="0 0 400 180" className="w-full" role="img" aria-label="Animated scene of a scooter, car and motorbike on the road">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            {dark ? (
              <>
                <stop offset="0" stopColor="#070b22" />
                <stop offset="0.7" stopColor="#16203f" />
                <stop offset="1" stopColor="#243056" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#8fd0ff" />
                <stop offset="0.55" stopColor="#cdecff" />
                <stop offset="1" stopColor="#eaf7ff" />
              </>
            )}
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={dark ? '#2a2f3a' : '#454b59'} />
            <stop offset="1" stopColor={dark ? '#1a1e27' : '#2c313c'} />
          </linearGradient>
          <linearGradient id="car" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fb9d3a" />
            <stop offset="1" stopColor="#ef7918" />
          </linearGradient>
          <linearGradient id="bike" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff5d5d" />
            <stop offset="1" stopColor="#d62828" />
          </linearGradient>
          <linearGradient id="scoot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,240,160,0.85)" />
            <stop offset="1" stopColor="rgba(255,240,160,0)" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="rgba(255,236,150,0.9)" />
            <stop offset="1" stopColor="rgba(255,236,150,0)" />
          </radialGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="180" fill="url(#sky)" />

        {dark ? (
          <g>
            {STARS.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 1.6 : 1}
                fill="#fefce8"
                style={anim(`ftk-twinkle ${1.8 + (i % 4) * 0.5}s ease-in-out ${i * 0.2}s infinite`)}
              />
            ))}
            <circle cx="332" cy="40" r="16" fill="#f6f3df" />
            <circle cx="326" cy="35" r="15" fill="url(#sky)" />
          </g>
        ) : (
          <g>
            <circle cx="332" cy="40" r="34" fill="url(#sunGlow)" />
            <g className="ftk-spin" style={{ ...anim('ftk-spin 24s linear infinite'), transformOrigin: '332px 40px' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180
                return (
                  <line
                    key={i}
                    x1={332 + Math.cos(a) * 20}
                    y1={40 + Math.sin(a) * 20}
                    x2={332 + Math.cos(a) * 27}
                    y2={40 + Math.sin(a) * 27}
                    stroke="#ffd34d"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )
              })}
            </g>
            <circle cx="332" cy="40" r="15" fill="#ffd34d" />
          </g>
        )}

        {!dark && (
          <Parallax width={400} duration={42}>
            <Cloud x={40} y={36} s={1.1} />
            <Cloud x={180} y={26} s={0.8} />
            <Cloud x={290} y={58} s={1} />
          </Parallax>
        )}

        <Parallax width={400} duration={30}>
          <path
            d="M0,132 C40,104 90,104 130,120 C170,134 210,102 260,112 C300,120 350,108 400,124 L400,132 Z"
            fill={dark ? '#16213f' : '#bfe3c4'}
          />
        </Parallax>
        <Parallax width={400} duration={20}>
          <path
            d="M0,132 C50,118 90,120 140,128 C190,135 230,116 280,122 C330,127 370,120 400,128 L400,132 Z"
            fill={dark ? '#1c2a4a' : '#9bd49f'}
          />
        </Parallax>

        <Parallax width={400} duration={13}>
          <Tree x={60} />
          <Tree x={150} />
          <Tree x={250} />
          <Tree x={340} />
        </Parallax>

        <rect x="0" y="131" width="400" height="49" fill="url(#road)" />
        <rect x="0" y="131" width="400" height="2" fill="rgba(255,255,255,0.25)" />
        <line
          x1="0"
          y1="170"
          x2="400"
          y2="170"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="22 20"
          style={anim('ftk-dash 0.5s linear infinite')}
        />

        {/* One at a time: scooter → car → motorbike → repeat */}
        <Ride delay={0} shadowWidth={66}>
          <Scooter />
        </Ride>
        <Ride delay={PERIOD / 3} shadowWidth={108}>
          <Car />
        </Ride>
        <Ride delay={(PERIOD / 3) * 2} shadowWidth={92}>
          <Motorbike />
        </Ride>
      </svg>
    </div>
  )
}
