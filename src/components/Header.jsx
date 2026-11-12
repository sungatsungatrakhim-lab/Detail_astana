import { useEffect, useState } from 'react'
import { Menu, X, Phone, CalendarCheck } from 'lucide-react'
import { BRAND } from '../data'

export const NAV = [
  { id: 'services', label: 'Услуги' },
  { id: 'about', label: 'О нас' },
  { id: 'team', label: 'Мастера' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'contacts', label: 'Контакты' },
]

export function Logo({ className = '' }) {
  return (
    <a href="#top" className={`group flex items-center gap-2.5 ${className}`} aria-label={`${BRAND.name} — на главную`}>
      <span className="grid size-9 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/40 transition group-hover:bg-gold/20">
        <svg viewBox="0 0 24 24" className="size-4 text-gold" fill="currentColor"><path d="M12 2l8 10-8 10-8-10z" /></svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-[17px] font-semibold tracking-[0.18em]">{BRAND.name}</span>
        <span className="block text-[10px] uppercase tracking-[0.3em] text-mist">{BRAND.tagline}</span>
      </span>
    </a>
  )
}

export default function Header({ onBook }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    // подсветка активного раздела
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Снимаем блокировку прокрутки до перехода по якорю, иначе браузер не прокрутит страницу
  const closeForNav = () => { document.body.style.overflow = ''; setOpen(false) }

  return (
    <>
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'border-b border-white/5 bg-ink/85 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="container-x flex h-[72px] items-center gap-6">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition hover:text-ivory ${active === n.id ? 'text-ivory' : 'text-mist'}`}>
              {n.label}
              <span className={`absolute inset-x-4 -bottom-0.5 h-px bg-gold transition-transform duration-300 ${active === n.id ? 'scale-x-100' : 'scale-x-0'}`} />
            </a>
          ))}
        </nav>

        <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="hidden items-center gap-2 text-sm font-semibold transition hover:text-gold xl:flex">
          <Phone className="size-4 text-gold" /> {BRAND.phone}
        </a>
        <button onClick={() => onBook()} className="btn-gold ml-auto hidden min-h-11 px-5 text-sm sm:inline-flex lg:ml-0">
          <CalendarCheck className="size-4" /> Записаться
        </button>

        <button onClick={() => setOpen(!open)} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open}
          className="ml-auto grid size-11 place-items-center rounded-full border border-white/10 transition hover:border-gold sm:ml-0 lg:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </header>

    {/* Мобильное меню — вне header: backdrop-filter у шапки ломает position: fixed у потомков */}
    <div className={`fixed inset-x-0 top-[72px] bottom-0 z-[49] bg-ink backdrop-blur-xl transition-all duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <nav className="container-x flex h-full flex-col pt-6 pb-10" aria-label="Мобильное меню">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={closeForNav} style={{ transitionDelay: open ? `${i * 50}ms` : '0ms' }}
              className={`flex items-center justify-between border-b border-line py-5 font-display text-2xl transition-all duration-500 ${open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
              {n.label}<span className="text-sm text-mist">0{i + 1}</span>
            </a>
          ))}
          <div className="mt-auto space-y-3">
            <button onClick={() => { setOpen(false); onBook() }} className="btn-gold w-full"><CalendarCheck className="size-5" /> Записаться онлайн</button>
            <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="btn-ghost w-full"><Phone className="size-4" /> {BRAND.phone}</a>
          </div>
        </nav>
    </div>
    </>
  )
}
