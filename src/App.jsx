import { useCallback, useState } from 'react'
import Header from './components/Header'
import CinematicIntro from './intro/CinematicIntro'
import Advantages from './components/Advantages'
import Services from './components/Services'
import About from './components/About'
import Reviews from './components/Reviews'
import Contacts, { Footer } from './components/Contacts'
import BookingModal from './components/BookingModal'
import { Toasts, WhatsAppIcon } from './components/ui'
import { waLink } from './data'

export default function App() {
  const [booking, setBooking] = useState({ open: false, service: null, n: 0 })
  const [toasts, setToasts] = useState([])

  const openBooking = useCallback((serviceId = null) => setBooking((b) => ({ open: true, service: serviceId, n: b.n + 1 })), [])
  const closeBooking = useCallback(() => setBooking((b) => ({ ...b, open: false })), [])

  const closeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback((t) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { ...t, id }])
    setTimeout(() => closeToast(id), 5000)
  }, [closeToast])

  return (
    <>
      <Header onBook={openBooking} />
      <main>
        <CinematicIntro onBook={openBooking} />
        <Advantages />
        <Services onBook={openBooking} />
        <About onBook={openBooking} />
        <Reviews />
        <Contacts notify={notify} />
      </main>
      <Footer />

      <a href={waLink('Здравствуйте! Хочу узнать о детейлинге.')} target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp"
        className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(37,211,102,.45)] transition hover:scale-110 active:scale-95">
        <WhatsAppIcon className="size-7" />
      </a>

      {booking.open && <BookingModal key={booking.n} initialService={booking.service} onClose={closeBooking} notify={notify} />}
      <Toasts items={toasts} onClose={closeToast} />
    </>
  )
}
