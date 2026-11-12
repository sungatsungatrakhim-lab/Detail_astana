import { useState } from 'react'
import { Clock, MapPin, Phone, Navigation, PhoneCall, Loader2 } from 'lucide-react'
import { BRAND, waLink } from '../data'
import { InstagramIcon, Reveal, SectionHead, TelegramIcon, WhatsAppIcon, formatPhoneInput, phoneComplete } from './ui'
import { Logo, NAV } from './Header'

// Стилизованная карта без внешних API
function MapArt() {
  return (
    <a href={BRAND.gis} target="_blank" rel="noopener noreferrer" className="group relative block h-full min-h-[280px] overflow-hidden rounded-3xl border border-line bg-[#101013]" aria-label="Открыть адрес в 2ГИС">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 400">
        <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="#1e1e23" /></pattern></defs>
        <rect width="600" height="400" fill="url(#g)" />
        <path d="M-20 300 C 120 260, 200 330, 330 250 S 520 160, 640 190" stroke="#1f2a33" strokeWidth="38" fill="none" />
        <path d="M-20 300 C 120 260, 200 330, 330 250 S 520 160, 640 190" stroke="#24323d" strokeWidth="2" strokeDasharray="6 10" fill="none" />
        <path d="M0 120 H600 M180 0 V400 M430 0 V400 M0 360 L600 40" stroke="#2a2a2f" strokeWidth="10" />
        <path d="M0 120 H600 M180 0 V400 M430 0 V400" stroke="#33333a" strokeWidth="1" />
        <rect x="210" y="140" width="80" height="60" rx="6" fill="#18181c" /><rect x="460" y="60" width="100" height="40" rx="6" fill="#18181c" />
        <rect x="40" y="150" width="110" height="70" rx="6" fill="#18181c" /><rect x="320" y="20" width="80" height="80" rx="6" fill="#18181c" />
      </svg>
      <div className="absolute top-[42%] left-[52%] -translate-x-1/2 -translate-y-full">
        <span className="absolute left-1/2 top-full size-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-gold/20" />
        <span className="relative grid size-12 place-items-center rounded-full rounded-br-none bg-gold text-ink shadow-[0_10px_30px_rgba(214,180,122,.5)] rotate-45">
          <MapPin className="size-5 -rotate-45" />
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-ink/85 p-4 backdrop-blur">
        <div>
          <p className="font-semibold">{BRAND.address}</p>
          <p className="text-sm text-mist">{BRAND.addressNote}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-ink transition group-hover:scale-110"><Navigation className="size-4" /></span>
      </div>
    </a>
  )
}

function Callback({ notify }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (name.trim().length < 2) er.name = 'Укажите имя'
    if (!phoneComplete(phone)) er.phone = 'Введите номер полностью'
    setErr(er)
    if (Object.keys(er).length) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false); setName(''); setPhone('')
      notify({ title: 'Заявка принята', text: `${name.trim()}, перезвоним в течение 15 минут.` })
    }, 700)
  }
  return (
    <form onSubmit={submit} noValidate className="mt-8 rounded-3xl border border-line bg-coal p-5">
      <p className="flex items-center gap-2 font-semibold"><PhoneCall className="size-4 text-gold" /> Перезвоним за 15 минут</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" aria-label="Имя" aria-invalid={!!err.name} autoComplete="name"
            className={`field ${err.name ? 'border-red-400/70' : ''}`} />
          {err.name && <p className="mt-1 text-xs text-red-300">{err.name}</p>}
        </div>
        <div>
          <input value={phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (7__) ___-__-__" aria-label="Телефон" aria-invalid={!!err.phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value, phone))}
            onFocus={() => !phone && setPhone('+7 (')} onBlur={() => phone === '+7 (' && setPhone('')}
            className={`field ${err.phone ? 'border-red-400/70' : ''}`} />
          {err.phone && <p className="mt-1 text-xs text-red-300">{err.phone}</p>}
        </div>
        <button disabled={busy} className="btn-gold h-[54px]">{busy ? <Loader2 className="size-5 animate-spin" /> : 'Жду звонка'}</button>
      </div>
    </form>
  )
}

export default function Contacts({ notify }) {
  const tel = `tel:${BRAND.phone.replace(/\s/g, '')}`
  return (
    <section id="contacts" className="py-24 sm:py-32">
      <div className="container-x grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="Контакты" title="Приезжайте в студию" />
          <Reveal className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <MapPin className="size-5 text-gold" />
              <p className="mt-4 text-sm text-mist">Адрес</p>
              <p className="mt-1 font-semibold">{BRAND.address}</p>
            </div>
            <div className="card p-6">
              <Clock className="size-5 text-gold" />
              <p className="mt-4 text-sm text-mist">График работы</p>
              {BRAND.hours.map((h) => <p key={h.d} className="mt-1 font-semibold">{h.d}: <span className="font-normal">{h.t}</span></p>)}
            </div>
            <a href={tel} className="card group p-6 transition hover:border-gold/50">
              <Phone className="size-5 text-gold" />
              <p className="mt-4 text-sm text-mist">Телефон</p>
              <p className="mt-1 font-semibold transition group-hover:text-gold">{BRAND.phone}</p>
            </a>
            <div className="card p-6">
              <p className="text-sm text-mist">Мы в соцсетях</p>
              <div className="mt-4 flex gap-3">
                {[
                  { href: BRAND.instagram, label: 'Instagram', Icon: InstagramIcon },
                  { href: BRAND.telegram, label: 'Telegram', Icon: TelegramIcon },
                  { href: waLink(), label: 'WhatsApp', Icon: WhatsAppIcon },
                ].map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="grid size-12 place-items-center rounded-2xl border border-line transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-ink">
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <a href={waLink('Здравствуйте! Хочу записаться в OBSIDIAN.')} target="_blank" rel="noopener noreferrer"
              className="btn mt-4 h-14 w-full bg-[#25d366] text-base text-white hover:brightness-110">
              <WhatsAppIcon className="size-5" /> Написать в WhatsApp
            </a>
            <Callback notify={(t) => notify(t)} />
          </Reveal>
        </div>
        <Reveal delay={150} className="lg:pt-28"><MapArt /></Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-coal">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist" aria-label="Меню в подвале">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="transition hover:text-gold">{n.label}</a>)}
        </nav>
        <p className="text-sm text-mist">© 2026 {BRAND.name} · {BRAND.city}</p>
      </div>
    </footer>
  )
}
