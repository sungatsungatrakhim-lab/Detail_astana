// Настройки кинематографичного интро.
// Видео и кадры лежат в public/media (кладутся скриптом scripts/prepare-media.sh).

const m = (f) => `${import.meta.env.BASE_URL}media/${f}`

export const INTRO = {
  playbackRate: 1.5,      // скорость роликов
  quietMs: 180,           // пауза тишины, после которой возможен новый жест (гасим инерцию трекпада)
  loadTimeoutMs: 4000,    // сколько ждать загрузку видео, прежде чем перейти без него
  exitMs: 350,            // уход блока при начале следующего перехода
  swipeMin: 40,           // минимальный свайп на телефоне, px
}

// 4 сцены = 4 состояния покоя. poster — кадр покоя (последний кадр предыдущего перехода)
export const SCENES = [
  { id: 'far', poster: m('scene-0.jpg') },
  { id: 'rear', poster: m('scene-1.jpg') },
  { id: 'front', poster: m('scene-2.jpg') },
  { id: 'wheel', poster: m('scene-3.jpg') },
]

// 3 перехода между сценами (имена файлов без расширения: есть .mp4 и .webm).
// reverse — заранее развёрнутый ролик (ffmpeg -vf reverse)
export const mediaUrl = m
export const TRANSITIONS = [
  { name: 'подъезд', forward: 't1', reverse: 't1-rev' },
  { name: 'разворот', forward: 't2', reverse: 't2-rev' },
  { name: 'наезд на колесо', forward: 't3', reverse: 't3-rev' },
]
