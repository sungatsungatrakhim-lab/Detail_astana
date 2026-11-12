import { Quote } from 'lucide-react'
import { REVIEWS } from '../data'
import { Reveal, SectionHead, Stars } from './ui'

export default function Reviews() {
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
  return (
    <section id="reviews" className="relative overflow-hidden border-y border-line/60 bg-coal py-24 sm:py-32">
      <div className="absolute -left-40 top-20 size-[500px] rounded-full bg-gold/5 blur-[120px]" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead eyebrow="Отзывы" title="Что говорят клиенты" text="Демонстрационные отзывы — на реальном сайте здесь будут отзывы из 2ГИС и Instagram." />
          <Reveal className="mb-12 flex items-center gap-5 rounded-3xl border border-line bg-graphite px-6 py-5">
            <span className="font-display text-5xl font-semibold text-gold">{avg.toFixed(1)}</span>
            <div>
              <Stars value={avg} />
              <p className="mt-1.5 text-sm text-mist">на основе {REVIEWS.length} отзывов</p>
            </div>
          </Reveal>
        </div>

        {/* На телефоне — горизонтальная прокрутка, на десктопе — сетка */}
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={(i % 3) * 80} as="figure"
              className="card relative flex w-[85%] shrink-0 snap-center flex-col p-7 transition duration-300 hover:border-gold/40 md:w-auto">
              <Quote className="absolute top-6 right-6 size-8 text-gold/15" />
              <Stars value={r.rating} />
              <blockquote className="mt-5 flex-1 leading-relaxed text-ivory/90">«{r.text}»</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid size-11 place-items-center rounded-full bg-gold/15 font-display font-semibold text-gold">{r.name[0]}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-sm text-mist">{r.car}</span>
                </span>
                <span className="text-xs text-mist">{r.date}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
