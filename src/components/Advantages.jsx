import { ADVANTAGES, STATS } from '../data'
import { Icon, Reveal } from './ui'

// Блок сразу после интро: цифры доверия + преимущества
export default function Advantages() {
  return (
    <section id="advantages" className="relative border-b border-line/60 py-20 sm:py-24">
      <div className="container-x">
        <Reveal className="mb-12 grid gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="border-t border-gold/30 pt-5">
              <p className="font-display text-4xl font-semibold sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-mist">{s.label}</p>
            </div>
          ))}
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}
              className="group rounded-3xl border border-white/10 bg-white/[.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[.05]">
              <div className="grid size-12 place-items-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20 transition group-hover:bg-gold group-hover:text-ink">
                <Icon name={a.icon} className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{a.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
