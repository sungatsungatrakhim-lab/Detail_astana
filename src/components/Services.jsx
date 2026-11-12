import { useState } from 'react'
import { ArrowUpRight, Clock, Flame } from 'lucide-react'
import { CATEGORIES, SERVICES, fmt } from '../data'
import { Icon, Reveal, SectionHead, SmartImg } from './ui'

export default function Services({ onBook }) {
  const [cat, setCat] = useState('all')
  const list = cat === 'all' ? SERVICES : SERVICES.filter((s) => s.cat === cat)

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHead eyebrow="Услуги и цены" title="Всё для идеального состояния авто"
            text="Цены указаны для седана. Точную стоимость мастер назовёт после бесплатного осмотра." />
        </div>

        <div className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Категории услуг">
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 active:scale-95 ${cat === c.id ? 'border-gold bg-gold text-ink' : 'border-line text-mist hover:border-gold/60 hover:text-ivory'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s, i) => (
            <Reveal key={`${cat}-${s.id}`} delay={i * 60} as="article"
              className="group card flex cursor-pointer flex-col overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(214,180,122,.35)]">
              <div onClick={() => onBook(s.id)} className="flex flex-1 flex-col">
                <div className="relative">
                  <SmartImg src={s.img} alt={s.title} icon={s.icon} className="aspect-[4/3]" imgClass="transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
                  {s.popular && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-gold backdrop-blur">
                      <Flame className="size-3.5" /> Популярно
                    </span>
                  )}
                  <span className="absolute -bottom-5 left-5 grid size-11 place-items-center rounded-2xl bg-gold text-ink shadow-lg">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-8">
                  <h3 className="text-lg leading-snug font-semibold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{s.desc}</p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-mist"><Clock className="size-4" /> {s.duration}</span>
                    <span className="font-display font-semibold text-gold">от {fmt(s.price)}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => onBook(s.id)} className="btn w-full border border-line bg-white/[.03] text-sm group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                  Записаться <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
