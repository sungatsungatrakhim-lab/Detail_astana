import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarCheck, ChevronDown, Star } from 'lucide-react'
import { INTRO, SCENES, TRANSITIONS, mediaUrl } from './config'

/*
  Механика:
  — 4 сцены (состояния покоя), между ними 3 видео-перехода;
  — пока страница вверху, вьюпорт зафиксирован: один жест = ровно один переход, через сцену не прыгнуть;
  — назад играет заранее развёрнутый ролик; если его нет или play() отклонён — протяжка currentTime через rAF;
  — блок сцены появляется ТОЛЬКО после того, как переход доиграл; с началом следующего — уходит (~0.35 с);
  — после последней сцены следующий жест отпускает страницу вниз, к обычному сайту.
*/

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Ждём, пока у видео появится кадр, но не дольше таймаута — иначе недоступный файл повесит навигацию
function whenReady(v, timeout) {
  if (!v) return Promise.resolve(false)
  if (v.readyState >= 2) return Promise.resolve(true)
  return new Promise((resolve) => {
    const done = (ok) => { clearTimeout(t); v.removeEventListener('loadeddata', on); v.removeEventListener('error', off); resolve(ok) }
    const on = () => done(true)
    const off = () => done(false)
    const t = setTimeout(() => done(v.readyState >= 2), timeout)
    v.addEventListener('loadeddata', on)
    v.addEventListener('error', off)
    v.querySelector('source:last-of-type')?.addEventListener('error', off, { once: true })
    if (v.preload !== 'auto') v.preload = 'auto'
    v.load?.()
  })
}

// Ручная протяжка currentTime — когда autoplay запрещён (колесо мыши не считается жестом пользователя)
function ramp(v, { reverse = false, rate }) {
  return new Promise((resolve) => {
    const dur = v.duration || 5
    const start = performance.now()
    v.pause()
    const tick = (now) => {
      const t = Math.min(dur, ((now - start) / 1000) * rate)
      try { v.currentTime = reverse ? dur - t : t } catch { /* seek недоступен — просто дойдём до конца */ }
      if (t >= dur || document.hidden) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

// Нативное воспроизведение до конца с защитой от «зависшего» буфера и свёрнутой вкладки
function playToEnd(v, rate) {
  return new Promise((resolve, reject) => {
    v.currentTime = 0
    v.playbackRate = rate
    const maxMs = ((v.duration || 6) / rate) * 1000 + 1500
    const finish = () => { clearTimeout(t); v.removeEventListener('ended', finish); document.removeEventListener('visibilitychange', onHide); resolve() }
    const onHide = () => document.hidden && finish()
    const t = setTimeout(finish, maxMs)
    v.addEventListener('ended', finish)
    document.addEventListener('visibilitychange', onHide)
    v.play().catch((e) => { clearTimeout(t); v.removeEventListener('ended', finish); document.removeEventListener('visibilitychange', onHide); reject(e) })
  })
}

// Всегда доводим кадр в финальное положение, иначе состояние и картинка разъедутся.
// После естественного конца ролик уже стоит на последнем кадре — не трогаем его
// (Chromium сбрасывает ended-видео на 0 при перемотке к концу). Возвращает true, если кадр на месте.
async function settle(v) {
  try {
    v.pause()
    const end = (v.duration || 0) - 0.1
    if (v.ended || v.currentTime >= end) return true
    v.currentTime = Math.max(0, end)
    await Promise.race([new Promise((r) => v.addEventListener('seeked', r, { once: true })), wait(600)])
    return v.currentTime >= end - 0.05
  } catch { return false }
}

export default function CinematicIntro({ onBook }) {
  const [scene, setScene] = useState(0)          // текущая сцена покоя
  const [shown, setShown] = useState(null)       // чей блок сейчас показан
  const [leaving, setLeaving] = useState(false)  // блок уходит
  const [layer, setLayer] = useState({ type: 'poster', i: 0 }) // что видно: кадр или конкретное видео
  const [mediaOk, setMediaOk] = useState(true)

  const vids = useRef({})          // { 'f0': <video>, 'r0': <video>, ... }
  const busy = useRef(false)
  const sceneRef = useRef(0)
  const lastEvt = useRef(0)
  const rootRef = useRef(null)

  const reg = (key) => (el) => { if (el) vids.current[key] = el }

  const showBlock = (i) => { setLeaving(false); setShown(i) }

  // Один переход: dir = +1 вперёд, -1 назад
  const go = useCallback(async (dir) => {
    const from = sceneRef.current
    const to = from + dir
    if (busy.current || to < 0 || to >= SCENES.length) return
    busy.current = true
    sceneRef.current = to

    // блок уходит согласованной короткой анимацией — «смена страницы»
    setLeaving(true)
    const exit = wait(INTRO.exitMs)

    const ti = dir > 0 ? from : to
    const fwd = vids.current[`f${ti}`]
    const rev = vids.current[`r${ti}`]

    if (reduceMotion()) {
      await exit
      setLayer({ type: 'poster', i: to })
    } else {
      let video = dir > 0 ? fwd : rev
      let ok = await whenReady(video, INTRO.loadTimeoutMs)
      let manualReverse = false
      if (!ok && dir < 0) { // нет reverse-файла — проматываем прямой ролик назад
        video = fwd; manualReverse = true
        ok = await whenReady(video, INTRO.loadTimeoutMs)
      }
      if (!ok) {
        setMediaOk(false)
        await exit
        setLayer({ type: 'poster', i: to })
      } else {
        setLayer({ type: 'video', key: `${manualReverse ? 'f' : dir > 0 ? 'f' : 'r'}${ti}` })
        try {
          if (manualReverse) throw new Error('no reverse file')
          await playToEnd(video, INTRO.playbackRate)
        } catch {
          // play() отклонён или нет reverse-файла — не схлопываем переход в скачок, а тянем вручную
          if (manualReverse) { video.currentTime = video.duration || 0 }
          else video.currentTime = 0
          await ramp(video, { reverse: manualReverse, rate: INTRO.playbackRate })
        }
        let atEnd = true
        if (manualReverse) { try { video.pause(); atEnd = video.currentTime < 0.15 } catch { atEnd = false } }
        else atEnd = await settle(video)
        // кадр не встал на место — показываем кадр покоя целевой сцены (он равен последнему кадру перехода)
        if (!atEnd) setLayer({ type: 'poster', i: to })
        await exit
      }
    }

    setScene(to)
    showBlock(to)
    busy.current = false
  }, [])

  // Выход из интро вниз — к обычному сайту
  const release = () => document.getElementById('advantages')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })

  const step = useCallback((dir) => {
    if (busy.current) return // во время перехода события игнорируются и НЕ копятся
    const cur = sceneRef.current
    if (dir > 0 && cur === SCENES.length - 1) return release()
    if (dir < 0 && cur === 0) return // на первой сцене назад нельзя
    go(dir)
  }, [go])

  // Интро: первое видео запускается само и доводит до второй сцены
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await wait(reduceMotion() ? 0 : 600)
      if (!cancelled && window.scrollY < 4 && sceneRef.current === 0) go(1)
    })()
    return () => { cancelled = true }
  }, [go])

  // Ввод: колесо/трекпад, свайпы, клавиатура
  useEffect(() => {
    const engaged = () => window.scrollY < 4 && document.body.style.overflow !== 'hidden'

    const onWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
      const now = performance.now()
      const fresh = now - lastEvt.current > INTRO.quietMs // пока события идут сплошным потоком — это один жест
      lastEvt.current = now
      if (!engaged()) return
      // вверх от сцены 0 — блок; вниз с последней сцены отпускаем страницу без перехвата
      if (e.deltaY > 0 && sceneRef.current === SCENES.length - 1 && !busy.current) {
        if (fresh) { e.preventDefault(); release() } else e.preventDefault()
        return
      }
      e.preventDefault()
      if (fresh) step(e.deltaY > 0 ? 1 : -1)
    }

    let startY = null
    const onTouchStart = (e) => { startY = engaged() ? e.touches[0].clientY : null }
    const onTouchMove = (e) => { if (startY !== null && engaged() && e.cancelable) e.preventDefault() }
    const onTouchEnd = (e) => {
      if (startY === null) return
      const dy = startY - e.changedTouches[0].clientY
      startY = null
      if (Math.abs(dy) >= INTRO.swipeMin) step(dy > 0 ? 1 : -1)
    }

    const onKey = (e) => {
      if (!engaged() || e.target.closest?.('input, textarea, select, [contenteditable]')) return
      const fwd = ['ArrowDown', 'PageDown', ' '].includes(e.key)
      const back = ['ArrowUp', 'PageUp'].includes(e.key)
      if (!fwd && !back) return
      e.preventDefault()
      step(fwd ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [step])

  // для автотеста механики
  useEffect(() => {
    window.__intro = { get scene() { return sceneRef.current }, get busy() { return busy.current }, step }
  }, [step])

  const blockState = (i) => (shown === i ? (leaving ? 'is-out' : 'is-in') : 'is-hidden')

  return (
    <section id="top" ref={rootRef} className="intro" aria-label="Кинематографичное интро" data-scene={scene}>
      {/* Кадры покоя — всегда под видео, на случай если ролики не загрузились */}
      {SCENES.map((s, i) => (
        <img key={s.id} src={s.poster} alt="" aria-hidden="true" draggable="false"
          className={`intro-media ${layer.type === 'poster' && layer.i === i ? 'is-visible' : ''}`} />
      ))}
      {TRANSITIONS.map((t, i) => (
        ['f', 'r'].map((d) => (
          <video key={`${d}${i}`} ref={reg(`${d}${i}`)}
            muted playsInline preload={i === 0 && d === 'f' ? 'auto' : 'metadata'} disablePictureInPicture
            className={`intro-media ${layer.type === 'video' && layer.key === `${d}${i}` ? 'is-visible' : ''}`}>
            <source src={mediaUrl(`${d === 'f' ? t.forward : t.reverse}.mp4`)} type="video/mp4" />
            <source src={mediaUrl(`${d === 'f' ? t.forward : t.reverse}.webm`)} type="video/webm" />
          </video>
        ))
      ))}
      <div className="intro-shade" />

      {/* Блоки дизайна. Размеры — calc(N * var(--s)), где --s = 1px при 1440×810 */}
      <div className="intro-stage">
        <Block i={1} state={blockState(1)}>
          <div className="ib-chip" style={{ '--d': 0 }}><Star className="ib-star" /> <b>4.9</b> · 620 отзывов в 2ГИС</div>
          <h1 className="ib-title" style={{ '--d': 1 }}>Блеск, который<br /><span className="ib-gold">держится годами</span></h1>
          <p className="ib-text" style={{ '--d': 2 }}>Детейлинг-студия в Астане: полировка, керамика, защитная плёнка и химчистка салона. Студийный свет, гарантия и фотоотчёт каждого этапа.</p>
          <div className="ib-actions" style={{ '--d': 3 }}>
            <button onClick={() => onBook()} className="ib-btn ib-btn-gold"><CalendarCheck /> Записаться онлайн</button>
            <a href="#services" className="ib-btn ib-btn-ghost">Услуги и цены <ArrowRight /></a>
          </div>
        </Block>

        <Block i={2} state={blockState(2)}>
          <p className="ib-eyebrow" style={{ '--d': 0 }}>02 — Защита кузова</p>
          <h2 className="ib-title ib-title-sm" style={{ '--d': 1 }}>Керамика 9H.<br /><span className="ib-gold">Зеркало на 3 года</span></h2>
          <div className="ib-stats" style={{ '--d': 2 }}>
            <div><b>95%</b><span>царапин уходит после полировки</span></div>
            <div><b>9H</b><span>твёрдость защитного слоя</span></div>
            <div><b>3 года</b><span>гарантия в договоре</span></div>
          </div>
          <div className="ib-actions" style={{ '--d': 3 }}>
            <button onClick={() => onBook('ceramic')} className="ib-btn ib-btn-gold">Записаться на керамику <ArrowRight /></button>
            <span className="ib-price">от 140 000 ₸</span>
          </div>
        </Block>

        <Block i={3} state={blockState(3)}>
          <p className="ib-eyebrow" style={{ '--d': 0 }}>03 — Детали</p>
          <h2 className="ib-title ib-title-sm" style={{ '--d': 1 }}>Видим то,<br /><span className="ib-gold">что не видят другие</span></h2>
          <p className="ib-text" style={{ '--d': 2 }}>Диски, суппорты, оптика и стыки панелей — при студийном свете каждый дефект заметен. Поэтому ничего не уходит недоделанным.</p>
          <div className="ib-actions" style={{ '--d': 3 }}>
            <button onClick={() => onBook()} className="ib-btn ib-btn-gold"><CalendarCheck /> Выбрать время</button>
            <button onClick={release} className="ib-btn ib-btn-ghost">Смотреть сайт <ChevronDown /></button>
          </div>
        </Block>
      </div>

      {/* Индикатор сцен — только показывает, прыгнуть через сцену нельзя */}
      <div className="intro-progress" aria-hidden="true">
        {SCENES.map((s, i) => <span key={s.id} className={i === scene ? 'on' : i < scene ? 'past' : ''} />)}
        <em>0{scene + 1}<i>/0{SCENES.length}</i></em>
      </div>
      <div className={`intro-hint ${scene === SCENES.length - 1 ? 'last' : ''}`} aria-hidden="true">
        <span className="mouse"><span /></span>{scene === SCENES.length - 1 ? 'Листайте к услугам' : 'Листайте'}
      </div>
      {!mediaOk && <p className="intro-warn" role="status">Видео не загрузилось — показываем кадры. Проверьте папку media/.</p>}
      <span className="sr-only" aria-live="polite">Сцена {scene + 1} из {SCENES.length}</span>
    </section>
  )
}

function Block({ i, state, children }) {
  return (
    <div className={`intro-block ${state}`} aria-hidden={state !== 'is-in'} inert={state !== 'is-in' ? true : undefined} data-block={i}>
      {children}
    </div>
  )
}
