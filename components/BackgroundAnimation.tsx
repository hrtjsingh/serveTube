'use client'

const MIST_COUNT = 30
const EMBER_COUNT = 28
const DUST_COUNT = 32

const mist = Array.from({ length: MIST_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 23 + 7) % 100}%`,
  bottom: `${(i * 19) % 70}%`,
  width: 60 + (i % 5) * 35,
  delay: `${(i * 2.1) % 22}s`,
  duration: `${18 + (i % 6) * 3}s`,
  opacity: 0.05 + (i % 4) * 0.02,
}))

const embers = Array.from({ length: EMBER_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 27 + 3) % 100}%`,
  size: 2 + (i % 4),
  delay: `${(i * 1.4) % 16}s`,
  duration: `${6 + (i % 5) * 2}s`,
  drift: i % 2 === 0 ? 1 : -1,
}))

const dust = Array.from({ length: DUST_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 19 + 11) % 100}%`,
  top: `${(i * 13 + 5) % 85}%`,
  size: 1.5 + (i % 3) * 1.2,
  delay: `${(i * 1.6) % 20}s`,
  duration: `${12 + (i % 7) * 3}s`,
  drift: (i % 3) - 1,
  tone: i % 3,
}))

const KANJI = [
  { id: 'bushido', text: '武士道', sub: 'Way of the warrior', top: '10%', left: '5%', size: 'large' as const, rotate: -10 },
  { id: 'focus', text: '集中', sub: 'Focus', top: '38%', left: '3%', size: 'medium' as const, vertical: true, rotate: 0 },
  { id: 'calm', text: '静心', sub: 'Still mind', top: '22%', left: '78%', size: 'medium' as const, vertical: true, rotate: 4 },
  { id: 'discipline', text: '自律', sub: 'Discipline', bottom: '28%', left: '10%', size: 'medium' as const, rotate: -6 },
  { id: 'silence', text: '静寂', sub: 'Silence', bottom: '18%', right: '14%', size: 'large' as const, rotate: 8 },
  { id: 'way', text: '道', sub: 'The path', top: '58%', left: '68%', size: 'large' as const, rotate: 12 },
]

export function BackgroundAnimation() {
  return (
    <div aria-hidden className="bg-animation">
      <div className="bg-base" />
      <div className="bg-aurora" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-mountains" />
      <div className="bg-torii" />
      <div className="bg-moon-light" />
      <div className="bg-kanji">
        {KANJI.map((k, i) => (
          <div
            key={k.id}
            className={`kanji-mark kanji-mark-${k.size}${k.vertical ? ' kanji-mark-vertical' : ''}`}
            style={{
              top: k.top,
              left: k.left,
              right: k.right,
              bottom: k.bottom,
              ['--kanji-rotate' as string]: `${k.rotate ?? 0}deg`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            {k.text}
            <span className="kanji-sub">{k.sub}</span>
          </div>
        ))}
      </div>
      <div className="bg-mist">
        {mist.map((m) => (
          <span
            key={m.id}
            className="mist-wisp"
            style={{
              left: m.left,
              bottom: m.bottom,
              width: m.width,
              animationDelay: m.delay,
              animationDuration: m.duration,
              opacity: m.opacity,
            }}
          />
        ))}
      </div>
      <div className="bg-dust">
        {dust.map((d) => (
          <span
            key={d.id}
            className={`dust-particle dust-particle-${d.tone}`}
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              animationDelay: d.delay,
              animationDuration: d.duration,
              ['--drift' as string]: `${d.drift * (24 + (d.id % 5) * 14)}px`,
            }}
          />
        ))}
      </div>
      <div className="bg-embers">
        {embers.map((e) => (
          <span
            key={e.id}
            className="ember-spark"
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              animationDelay: e.delay,
              animationDuration: e.duration,
              ['--drift' as string]: `${e.drift * (20 + (e.id % 4) * 12)}px`,
            }}
          />
        ))}
      </div>
      <div className="bg-shimmer" />
      <div className="bg-glass-veil" />
      <div className="bg-noise" />
      <div className="bg-red-moon-glow" />
      <div className="bg-red-moon" />
    </div>
  )
}
