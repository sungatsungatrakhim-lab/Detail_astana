import { useEffect, useRef, useState } from 'react'
import {
  Sparkles, Gem, ShieldCheck, Armchair, BrushCleaning, Droplets, SunDim, Zap,
  BadgeCheck, Sun, Layers, CalendarCheck, Car, Star, CircleCheck, X, UserRound,
} from 'lucide-react'

const ICONS = { Sparkles, Gem, ShieldCheck, Armchair, BrushCleaning, Droplets, SunDim, Zap, BadgeCheck, Sun, Layers, CalendarCheck, Car, UserRound }

// Иконка Lucide по имени из data.js
export function Icon({ name, ...props }) {
  const C = ICONS[name] ?? Sparkles
  return <C {...props} />
}

// Изображение с плавным появлением и красивым запасным фоном, если фото не загрузилось
export function SmartImg({ src, alt, className = '', icon = 'Car', imgClass = '' }) {
  const [state, setState] = useState('loading')
  return (
    <div className={`relative overflow-hidden bg-graphite ${className}`}>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(214,180,122,.22),transparent_55%),linear-gradient(135deg,#1d1d21,#0f0f11)]">
        {state === 'error' && icon && <Icon name={icon} className="size-12 text-gold/40" strokeWidth={1.2} />}
      </div>
      {state !== 'error' && (
        <img src={src} alt={alt} loading="lazy" onLoad={() => setState('ok')} onError={() => setState('error')}
          className={`relative h-full w-full object-cover transition duration-700 ${state === 'ok' ? 'opacity-100' : 'opacity-0'} ${imgClass}`} />
      )}
    </div>
  )
}

// Появление блока при прокрутке
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} style={{ animationDelay: `${delay}ms` }} className={`${shown ? 'animate-fade-up' : 'opacity-0'} ${className}`}>
      {children}
    </Tag>
  )
}

export function Stars({ value, size = 'size-4' }) {
  return (
    <div className="flex gap-0.5" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-gold text-gold' : 'text-line'}`} />
      ))}
    </div>
  )
}

export function SectionHead({ eyebrow, title, text, center = false }) {
  return (
    <Reveal className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <span className="eyebrow"><span className="h-px w-6 bg-gold" />{eyebrow}</span>
      <h2 className="h2 mt-4">{title}</h2>
      {text && <p className="mt-4 text-lg text-mist">{text}</p>}
    </Reveal>
  )
}

// Уведомления
export function Toasts({ items, onClose }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full max-w-md animate-fade-up items-start gap-3 rounded-2xl border border-gold/30 bg-graphite/95 p-4 shadow-2xl backdrop-blur">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-gold" />
          <div className="flex-1">
            <p className="font-semibold">{t.title}</p>
            {t.text && <p className="mt-0.5 text-sm text-mist">{t.text}</p>}
          </div>
          <button onClick={() => onClose(t.id)} className="rounded-full p-1 text-mist transition hover:bg-white/10 hover:text-ivory" aria-label="Закрыть уведомление">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Маска телефона Казахстана: +7 (7XX) XXX-XX-XX
export function formatPhoneInput(value, prev) {
  let n = value.startsWith('+7') ? value.slice(2).replace(/\D/g, '') : value.replace(/\D/g, '')
  if (n.length === 11 && /^[78]/.test(n)) n = n.slice(1)
  if (n === '8') n = ''
  n = n.slice(0, 10)
  if (!n && value.length < prev.length) return ''
  let out = '+7 (' + n.slice(0, 3)
  if (n.length > 3) out += ') ' + n.slice(3, 6)
  if (n.length > 6) out += '-' + n.slice(6, 8)
  if (n.length > 8) out += '-' + n.slice(8, 10)
  return out
}
export const phoneComplete = (p) => p.replace(/\D/g, '').length === 11

// Иконки соцсетей (в Lucide нет брендовых)
export const WhatsAppIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.5Z" />
  </svg>
)
export const InstagramIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
export const TelegramIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7 13.1l-4.6-1.4c-1-.3-1-1 .2-1.5L20.5 3.3c.8-.3 1.6.2 1.4 1Z" />
  </svg>
)
