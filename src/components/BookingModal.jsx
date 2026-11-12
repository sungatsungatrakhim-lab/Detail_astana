import { useEffect, useMemo, useState } from 'react'
import {
  X, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Star, Users,
  Loader2, CalendarDays, User, Phone, MessageSquare, Car, PartyPopper, Home,
} from 'lucide-react'
import { CAR_CLASSES, MASTERS, SERVICES, SLOT_HOURS, fmt, priceFor } from '../data'
import { Icon, SmartImg, formatPhoneInput, phoneComplete } from './ui'

const STEPS = ['Услуга', 'Мастер', 'Дата и время', 'Ваши данные']
const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const keyOf = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const fmtDate = (d) => d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
const hh = (h) => `${String(h).padStart(2, '0')}:00`

// Детерминированный «псевдослучайный» генератор — демо-занятость слотов
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}
function slotsFor(date, master) {
  const now = new Date()
  const isToday = keyOf(date) === keyOf(now)
  const weekend = [0, 6].includes(date.getDay())
  const fullDay = hash(`full-${keyOf(date)}`) < 0.1 // ~10% дней полностью заняты
  return SLOT_HOURS.filter((h) => !(weekend && (h < 10 || h > 18))).map((h) => {
    const busyRate = master === 'any' ? 0.2 : 0.38
    const past = isToday && h <= now.getHours()
    const busy = fullDay || hash(`${keyOf(date)}-${h}-${master}`) < busyRate
    return { h, label: hh(h), free: !past && !busy, past }
  })
}

/* ---------- Шаг 1: услуга ---------- */
function StepService({ data, set }) {
  return (
    <div className="animate-slide-in space-y-8">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-mist"><Car className="size-4" /> Класс автомобиля</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {CAR_CLASSES.map((c) => (
            <button key={c.id} onClick={() => set({ carClass: c.id })}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[.98] ${data.carClass === c.id ? 'border-gold bg-gold/10 text-ivory' : 'border-line text-mist hover:border-gold/50 hover:text-ivory'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-mist">Выберите услугу</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const sel = data.serviceId === s.id
            return (
              <button key={s.id} onClick={() => set({ serviceId: s.id, masterId: null, date: null, time: null })}
                className={`group flex cursor-pointer gap-4 rounded-2xl border p-3 text-left transition duration-300 active:scale-[.99] ${sel ? 'border-gold bg-gold/[.07] shadow-[0_0_0_1px_var(--color-gold)]' : 'border-line hover:border-gold/50 hover:bg-white/[.02]'}`}>
                <SmartImg src={s.img} alt="" icon={s.icon} className="size-20 shrink-0 rounded-xl" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-start justify-between gap-2">
                    <span className="leading-snug font-semibold">{s.title}</span>
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${sel ? 'border-gold bg-gold text-ink' : 'border-line'}`}>
                      {sel && <Check className="size-3.5" />}
                    </span>
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-2 text-sm">
                    <span className="flex items-center gap-1 text-mist"><Clock className="size-3.5" />{s.duration}</span>
                    <span className="font-semibold text-gold">{fmt(priceFor(s, data.carClass))}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Шаг 2: мастер ---------- */
function StepMaster({ data, set, service }) {
  const masters = MASTERS.filter((m) => m.cats.includes(service.cat))
  const pick = (id) => set({ masterId: id, time: null })
  return (
    <div className="animate-slide-in">
      <p className="mb-5 text-mist">Мастера, которые выполняют «{service.title}»:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => pick('any')}
          className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[.99] sm:col-span-2 ${data.masterId === 'any' ? 'border-gold bg-gold/[.07] shadow-[0_0_0_1px_var(--color-gold)]' : 'border-line hover:border-gold/50'}`}>
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold"><Users className="size-7" /></span>
          <span className="flex-1">
            <span className="block font-semibold">Любой свободный мастер</span>
            <span className="block text-sm text-mist">Больше свободного времени для записи</span>
          </span>
          <Radio on={data.masterId === 'any'} />
        </button>
        {masters.map((m) => (
          <button key={m.id} onClick={() => pick(m.id)}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[.99] ${data.masterId === m.id ? 'border-gold bg-gold/[.07] shadow-[0_0_0_1px_var(--color-gold)]' : 'border-line hover:border-gold/50'}`}>
            <SmartImg src={m.photo} alt={m.name} icon="UserRound" className="size-16 shrink-0 rounded-2xl" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{m.name}</span>
              <span className="block truncate text-sm text-mist">{m.role}</span>
              <span className="mt-1 flex items-center gap-3 text-xs text-mist">
                <span className="flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" />{m.rating.toFixed(1)}</span>
                <span>Опыт {m.exp}</span>
              </span>
            </span>
            <Radio on={data.masterId === m.id} />
          </button>
        ))}
      </div>
    </div>
  )
}
const Radio = ({ on }) => (
  <span className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${on ? 'border-gold bg-gold text-ink' : 'border-line'}`}>
    {on && <Check className="size-3.5" />}
  </span>
)

/* ---------- Шаг 3: календарь и время ---------- */
function StepDate({ data, set }) {
  const [today] = useState(() => startOfDay(new Date()))
  const [view, setView] = useState(() => {
    const d = data.date ?? today
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const maxView = new Date(today.getFullYear(), today.getMonth() + 2, 1) // запись на 3 месяца вперёд
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)
  const canNext = view < maxView

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))]
  }, [view])

  const slots = data.date ? slotsFor(data.date, data.masterId) : []

  return (
    <div className="animate-slide-in grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-line p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Предыдущий месяц"
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-line transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ivory">
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display font-semibold" aria-live="polite">{MONTHS[view.getMonth()]} {view.getFullYear()}</p>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} disabled={!canNext} aria-label="Следующий месяц"
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-line transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ivory">
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-mist">
          {WEEK.map((w, i) => <span key={w} className={`py-2 ${i > 4 ? 'text-gold/70' : ''}`}>{w}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />
            const past = d < today
            const free = !past && slotsFor(d, data.masterId).some((s) => s.free)
            const sel = data.date && keyOf(d) === keyOf(data.date)
            const isToday = keyOf(d) === keyOf(today)
            return (
              <button key={keyOf(d)} disabled={!free} onClick={() => set({ date: d, time: null })}
                aria-label={`${fmtDate(d)}${free ? '' : past ? ', прошедшая дата' : ', нет свободного времени'}`} aria-pressed={!!sel}
                className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl text-sm font-semibold transition duration-200
                  ${sel ? 'scale-105 bg-gold text-ink shadow-[0_8px_24px_-8px_rgba(214,180,122,.8)]' : free ? 'hover:bg-white/[.06] active:scale-95' : 'cursor-not-allowed text-mist/30'}
                  ${!past && !free ? 'line-through decoration-mist/30' : ''} ${isToday && !sel ? 'ring-1 ring-gold/50' : ''}`}>
                {d.getDate()}
                {free && !sel && <span className="absolute bottom-1.5 size-1 rounded-full bg-gold/70" />}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mist">
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-gold/70" />есть время</span>
          <span className="flex items-center gap-1.5"><span className="line-through">15</span>всё занято</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded ring-1 ring-gold/50" />сегодня</span>
        </div>
      </div>

      <div>
        {!data.date ? (
          <div className="grid h-full min-h-48 place-items-center rounded-3xl border border-dashed border-line p-6 text-center text-mist">
            <div><CalendarDays className="mx-auto mb-3 size-8 text-gold/60" />Выберите дату в календаре, чтобы увидеть свободное время</div>
          </div>
        ) : (
          <div key={keyOf(data.date)} className="animate-fade-in">
            <p className="mb-1 text-sm text-mist">Свободное время</p>
            <p className="mb-4 font-semibold first-letter:uppercase">{fmtDate(data.date)}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
              {slots.map((s) => {
                const sel = data.time === s.label
                return (
                  <button key={s.h} disabled={!s.free} onClick={() => set({ time: s.label })} aria-pressed={sel}
                    title={s.free ? '' : s.past ? 'Время прошло' : 'Занято'}
                    className={`cursor-pointer rounded-xl border py-3 text-sm font-semibold transition duration-200
                      ${sel ? 'border-gold bg-gold text-ink' : s.free ? 'border-line hover:border-gold hover:text-gold active:scale-95' : 'cursor-not-allowed border-transparent bg-white/[.02] text-mist/30 line-through'}`}>
                    {s.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-mist"><span className="inline-block h-3 w-6 rounded bg-white/[.04]" /> зачёркнуто — время занято</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Шаг 4: данные клиента ---------- */
function StepDetails({ data, set, errors }) {
  return (
    <div className="animate-slide-in mx-auto max-w-xl space-y-5">
      <Field label="Ваше имя" required icon={User} error={errors.name}>
        <input value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Например, Айгерим" autoComplete="name"
          aria-invalid={!!errors.name} className={`field pl-12 ${errors.name ? 'border-red-400/70' : ''}`} />
      </Field>
      <Field label="Номер телефона" required icon={Phone} error={errors.phone}>
        <input value={data.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (7__) ___-__-__" aria-invalid={!!errors.phone}
          onChange={(e) => set({ phone: formatPhoneInput(e.target.value, data.phone) })}
          onFocus={() => !data.phone && set({ phone: '+7 (' })} onBlur={() => data.phone === '+7 (' && set({ phone: '' })}
          className={`field pl-12 ${errors.phone ? 'border-red-400/70' : ''}`} />
      </Field>
      <Field label="Комментарий" icon={MessageSquare} hint="необязательно">
        <textarea value={data.comment} onChange={(e) => set({ comment: e.target.value })} rows={3} maxLength={300}
          placeholder="Марка авто, пожелания, нужен ли трансфер" className="field resize-none pl-12" />
      </Field>
      <p className="text-xs text-mist">Нажимая «Подтвердить запись», вы соглашаетесь на обработку персональных данных.</p>
    </div>
  )
}
function Field({ label, required, hint, icon: I, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-sm font-semibold">{label}{required && <span className="text-gold">*</span>}{hint && <span className="font-normal text-mist">· {hint}</span>}</span>
      <span className="relative block">
        <I className="pointer-events-none absolute top-4 left-4 size-5 text-mist" />
        {children}
      </span>
      {error && <span className="mt-1.5 block text-sm text-red-300" role="alert">{error}</span>}
    </label>
  )
}

/* ---------- Итог справа ---------- */
function Summary({ data, service, master }) {
  const cls = CAR_CLASSES.find((c) => c.id === data.carClass)
  const rows = [
    { icon: Car, label: 'Авто', value: cls.label },
    { icon: Users, label: 'Мастер', value: data.masterId === 'any' ? 'Любой свободный' : master?.name },
    { icon: CalendarDays, label: 'Дата', value: data.date && fmtDate(data.date) },
    { icon: Clock, label: 'Время', value: data.time },
  ]
  return (
    <aside className="rounded-3xl border border-line bg-coal p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Ваша запись</p>
      {service ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-gold/10 text-gold"><Icon name={service.icon} className="size-5" /></span>
          <span className="leading-snug font-semibold">{service.title}</span>
        </div>
      ) : <p className="mt-4 text-sm text-mist">Услуга не выбрана</p>}
      <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <dt className="flex items-center gap-2 text-mist"><r.icon className="size-4" />{r.label}</dt>
            <dd className={`text-right font-semibold first-letter:uppercase ${r.value ? '' : 'text-mist/40'}`}>{r.value || '—'}</dd>
          </div>
        ))}
      </dl>
      {service && (
        <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
          <span className="text-sm text-mist">Стоимость</span>
          <span className="font-display text-2xl font-semibold text-gold">{fmt(priceFor(service, data.carClass))}</span>
        </div>
      )}
    </aside>
  )
}

/* ---------- Экран успеха ---------- */
function Success({ data, service, master, onHome }) {
  return (
    <div className="animate-fade-in flex flex-col items-center px-2 py-2 text-center">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/30" />
        <span className="animate-pop relative grid size-20 place-items-center rounded-full bg-gold text-ink shadow-[0_20px_60px_-10px_rgba(214,180,122,.8)]">
          <Check className="size-10" strokeWidth={3} />
        </span>
      </div>
      <h2 className="mt-6 flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">Вы записаны! <PartyPopper className="size-7 text-gold" /></h2>
      <p className="mt-3 max-w-md text-mist">{data.name.trim()}, спасибо! Мы отправим подтверждение в WhatsApp на номер {data.phone} и напомним о визите за день.</p>

      <div className="mt-6 w-full max-w-md rounded-3xl border border-gold/30 bg-gold/[.04] px-6 py-3 text-left">
        {[
          ['Услуга', service.title],
          ['Дата', fmtDate(data.date)],
          ['Время', data.time],
          ['Мастер', data.masterId === 'any' ? 'Любой свободный' : master?.name],
          ['Клиент', data.name.trim()],
          ['Стоимость', fmt(priceFor(service, data.carClass))],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
            <span className="text-mist">{k}</span><span className="text-right font-semibold first-letter:uppercase">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-mist">Номер записи: <b className="text-ivory">OB-{String(Math.abs(Math.round(hash(data.phone + data.time) * 90000)) + 10000)}</b></p>
      <button onClick={onHome} className="btn-gold mt-6 h-14 px-10"><Home className="size-5" /> Вернуться на главную</button>
    </div>
  )
}

/* ---------- Модальное окно ---------- */
const empty = { serviceId: null, carClass: 'sedan', masterId: null, date: null, time: null, name: '', phone: '', comment: '' }

export default function BookingModal({ initialService, onClose, notify }) {
  // Компонент создаётся заново при каждом открытии (key в App), поэтому состояние стартует с нуля.
  // Если пришли с карточки услуги — сразу шаг «Мастер».
  const [step, setStep] = useState(initialService ? 1 : 0)
  const [data, setData] = useState({ ...empty, serviceId: initialService ?? null })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])


  const set = (patch) => { setData((d) => ({ ...d, ...patch })); setErrors({}) }
  const service = SERVICES.find((s) => s.id === data.serviceId)
  const master = MASTERS.find((m) => m.id === data.masterId)

  const canNext = [!!service, !!data.masterId, !!(data.date && data.time), true][step]
  const hints = ['Выберите услугу', 'Выберите мастера', data.date ? 'Выберите время' : 'Выберите дату', '']

  const next = () => {
    if (step < 3) return setStep(step + 1)
    const e = {}
    if (data.name.trim().length < 2) e.name = 'Введите имя — минимум 2 буквы'
    if (!phoneComplete(data.phone)) e.phone = 'Введите номер телефона полностью'
    setErrors(e)
    if (Object.keys(e).length) return
    setSending(true)
    setTimeout(() => {
      setSending(false); setDone(true)
      notify({ title: 'Запись подтверждена', text: `${service.title} · ${data.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${data.time}` })
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Онлайн-запись">
      <div className="animate-fade-in absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-up relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-graphite sm:h-auto sm:max-h-[92vh] sm:rounded-[32px] sm:border sm:border-line">
        {/* Шапка */}
        <div className="flex items-center gap-4 border-b border-line px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex-1">
            <p className="font-display text-lg font-semibold sm:text-xl">{done ? 'Готово' : 'Онлайн-запись'}</p>
            {!done && <p className="text-sm text-mist">Шаг {step + 1} из 4 · {STEPS[step]}</p>}
          </div>
          <button onClick={onClose} aria-label="Закрыть" className="grid size-11 cursor-pointer place-items-center rounded-full border border-line transition hover:rotate-90 hover:border-gold hover:text-gold">
            <X className="size-5" />
          </button>
        </div>

        {/* Прогресс */}
        {!done && (
          <ol className="flex gap-2 px-5 pt-5 sm:px-8">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <button disabled={i > step} onClick={() => setStep(i)} className="group w-full cursor-pointer text-left disabled:cursor-default">
                  <span className="block h-1 overflow-hidden rounded-full bg-line">
                    <span className={`block h-full rounded-full bg-gold transition-all duration-500 ${i <= step ? 'w-full' : 'w-0'}`} />
                  </span>
                  <span className={`mt-2 hidden items-center gap-1.5 text-xs font-semibold transition sm:flex ${i === step ? 'text-ivory' : i < step ? 'text-gold group-hover:underline' : 'text-mist/50'}`}>
                    {i < step && <Check className="size-3.5" />}{s}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {done ? (
            <Success data={data} service={service} master={master} onHome={() => { onClose(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div key={step}>
                {step === 0 && <StepService data={data} set={set} />}
                {step === 1 && <StepMaster data={data} set={set} service={service} />}
                {step === 2 && <StepDate data={data} set={set} />}
                {step === 3 && <StepDetails data={data} set={set} errors={errors} />}
              </div>
              <div className="hidden lg:block"><div className="sticky top-0"><Summary data={data} service={service} master={master} /></div></div>
            </div>
          )}
        </div>

        {/* Навигация */}
        {!done && (
          <div className="flex items-center gap-3 border-t border-line bg-graphite/95 px-5 py-4 sm:px-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-ghost px-5"><ArrowLeft className="size-4" /> <span className="hidden sm:inline">Назад</span></button>
            ) : <span />}
            <div className="ml-auto hidden text-right text-sm sm:block">
              {service && <><span className="text-mist">Итого: </span><b className="text-gold">{fmt(priceFor(service, data.carClass))}</b></>}
              {!canNext && <p className="text-xs text-mist">{hints[step]}</p>}
            </div>
            <button onClick={next} disabled={!canNext || sending} className="btn-gold ml-auto flex-1 sm:ml-0 sm:flex-none sm:px-8">
              {sending ? <><Loader2 className="size-5 animate-spin" /> Отправляем…</>
                : step === 3 ? <><Check className="size-5" /> Подтвердить запись</>
                : <>{canNext ? 'Далее' : hints[step]} <ArrowRight className="size-4" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
