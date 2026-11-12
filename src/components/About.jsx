import { useRef, useState } from 'react'
import { Check, ChevronsLeftRight, Star, CalendarCheck } from 'lucide-react'
import { IMG, MASTERS } from '../data'
import { Reveal, SectionHead, SmartImg } from './ui'

const POINTS = [
  'Отдельные боксы с климат-контролем — пыль не попадает на свежую керамику',
  'Замер толщины ЛКП перед полировкой: снимаем ровно столько, сколько нужно',
  'Фотоотчёт до/после и рекомендации по уходу в WhatsApp',
  'Зона ожидания с кофе и Wi-Fi или трансфер по городу',
]

// Слайдер «до / после»
function BeforeAfter() {
  const [pos, setPos] = useState(50)
  const ref = useRef(null)
  const move = (clientX) => {
    const r = ref.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  return (
    <div ref={ref} className="relative aspect-video cursor-ew-resize touch-none overflow-hidden rounded-3xl border border-line select-none"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
      onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}>
      {/* «После» */}
      <SmartImg src={IMG.after} alt="Кузов после полировки и керамики" icon={null} className="!absolute inset-0" />
      {/* «До» — тот же ракурс: потёртости, голограммы, пыль */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <SmartImg src={IMG.before} alt="Кузов до детейлинга: царапины и потёртости" icon={null} className="!absolute inset-0" />
      </div>
      <span className="absolute top-4 left-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold backdrop-blur">До</span>
      <span className="absolute top-4 right-4 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">После</span>
      <div className="absolute inset-y-0 w-0.5 bg-gold" style={{ left: `${pos}%` }}>
        <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Сравнение до и после"
          className="absolute inset-0 opacity-0" />
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink shadow-xl">
          <ChevronsLeftRight className="size-5" />
        </span>
      </div>
    </div>
  )
}

export default function About({ onBook }) {
  return (
    <>
      <section id="about" className="relative border-y border-line/60 bg-coal py-24 sm:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="О студии" title="Мы любим машины так же, как вы" />
            <Reveal delay={100}>
              <p className="text-lg leading-relaxed text-mist">
                OBSIDIAN открылся в Астане в 2018 году как небольшой бокс на двух мастеров. Сегодня это студия на 6 постов,
                где каждый автомобиль ведёт один ответственный мастер — от осмотра до выдачи. Мы не работаем «на поток»:
                берём столько машин, сколько можем сделать идеально.
              </p>
              <ul className="mt-8 space-y-4">
                {POINTS.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Check className="size-3.5" /></span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Коллаж фотографий */}
          <Reveal delay={150} className="grid grid-cols-5 grid-rows-6 gap-4 sm:h-[540px]">
            <SmartImg src={IMG.about1} alt="Полировка кузова в студии" className="col-span-3 row-span-6 min-h-[340px] rounded-3xl" />
            <SmartImg src={IMG.about2} alt="Детейлинг-мойка" icon="Droplets" className="col-span-2 row-span-3 rounded-3xl" />
            <div className="col-span-2 row-span-3 flex flex-col justify-between rounded-3xl bg-gold p-5 text-ink">
              <Star className="size-6 fill-ink" />
              <div>
                <p className="font-display text-4xl font-semibold">6</p>
                <p className="text-sm font-semibold">чистых боксов с климат-контролем</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="container-x mt-24 grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-6 bg-gold" />Результат</span>
            <h3 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Потяните ползунок и сравните</h3>
            <p className="mt-4 text-mist">Типичный результат комплекса «полировка + керамика»: уходит матовость и мелкие царапины, цвет становится глубже, а покрытие — гладким, как стекло.</p>
            <button onClick={() => onBook('ceramic')} className="btn-gold mt-8"><CalendarCheck className="size-5" /> Хочу так же</button>
          </Reveal>
          <Reveal delay={100}><BeforeAfter /></Reveal>
        </div>
      </section>

      <section id="team" className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHead eyebrow="Команда" title="Мастера, которым доверяют"
            text="Каждый мастер прошёл сертификацию у производителей покрытий и плёнок. Выберите своего при записи." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MASTERS.map((m, i) => (
              <Reveal key={m.id} delay={i * 80} className="group card overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:border-gold/40">
                <div className="relative">
                  <SmartImg src={m.photo} alt={`Мастер ${m.name}`} icon="UserRound" className="aspect-[4/5]" imgClass="grayscale-[.35] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/10 to-transparent" />
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                    <Star className="size-3.5 fill-gold text-gold" /> {m.rating.toFixed(1)}
                  </span>
                  <div className="absolute inset-x-5 bottom-4">
                    <h3 className="font-display text-xl font-semibold">{m.name}</h3>
                    <p className="text-sm text-gold-soft">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line px-5 py-4 text-sm text-mist">
                  <span>Опыт {m.exp}</span><span>{m.works.toLocaleString('ru-RU')} работ</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
