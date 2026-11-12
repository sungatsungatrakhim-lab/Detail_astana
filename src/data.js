// Все демонстрационные данные сайта. Чтобы адаптировать под реальный бизнес —
// достаточно поменять значения в этом файле.

// Фото сгенерированы в Higgsfield в стиле бренда и лежат в public/photos (из сети ничего не грузится)
const ph = (name) => `${import.meta.env.BASE_URL}photos/${name}.webp`

export const BRAND = {
  name: 'OBSIDIAN',
  tagline: 'детейлинг-студия',
  city: 'Астана',
  address: 'Астана, пр. Туран, 37/1',
  addressNote: 'Левый берег · 5 минут от «Хан Шатыра»',
  hours: [
    { d: 'Пн–Пт', t: '09:00 – 21:00' },
    { d: 'Сб–Вс', t: '10:00 – 20:00' },
  ],
  phone: '+7 777 123 45 67',
  whatsapp: '77771234567',
  instagram: 'https://instagram.com/',
  telegram: 'https://t.me/',
  gis: 'https://2gis.kz/astana',
}

export const waLink = (text = '') =>
  `https://wa.me/${BRAND.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const IMG = {
  about1: ph('about-studio'),
  about2: ph('about-tools'),
  before: ph('before'),
  after: ph('after'),
}

export const CATEGORIES = [
  { id: 'all', label: 'Все услуги' },
  { id: 'body', label: 'Кузов' },
  { id: 'protect', label: 'Защита' },
  { id: 'interior', label: 'Салон' },
  { id: 'glass', label: 'Стёкла и оптика' },
]

// price — цена для седана; для других классов умножается на коэффициент
export const SERVICES = [
  { id: 'polish', cat: 'body', icon: 'Sparkles', title: 'Восстановительная полировка',
    desc: 'Убираем до 95% царапин, голограмм и «паутинки». Возвращаем глубину цвета и зеркальный блеск.',
    price: 85000, duration: '1–2 дня', img: ph('svc-polish'), popular: true },
  { id: 'ceramic', cat: 'protect', icon: 'Gem', title: 'Керамическое покрытие',
    desc: 'Твёрдый защитный слой 9H на 2–3 года: реагенты, песок и солнце больше не страшны. Машина дольше чистая.',
    price: 140000, duration: '2 дня', img: ph('svc-ceramic'), popular: true },
  { id: 'ppf', cat: 'protect', icon: 'ShieldCheck', title: 'Плёнка PPF — передняя часть',
    desc: 'Капот, бампер, крылья, фары и зеркала. Самовосстанавливающийся полиуретан от сколов и гравия.',
    price: 290000, duration: '2–3 дня', img: ph('svc-ppf'), popular: true },
  { id: 'interior', cat: 'interior', icon: 'Armchair', title: 'Детейлинг-химчистка салона',
    desc: 'Глубокая чистка сидений, потолка, ковров и пластика. Удаляем пятна и запахи, обрабатываем озоном.',
    price: 55000, duration: '6–8 часов', img: ph('svc-interior'), popular: true },
  { id: 'leather', cat: 'interior', icon: 'BrushCleaning', title: 'Уход за кожей',
    desc: 'Деликатная очистка, восстановление цвета и пропитка кожаного салона. Без трещин и потёртостей.',
    price: 35000, duration: '3–4 часа', img: ph('svc-leather') },
  { id: 'wash', cat: 'body', icon: 'Droplets', title: 'Детейлинг-мойка',
    desc: 'Двухфазная ручная мойка, очистка дисков и арок, удаление битума, сушка и быстрый воск.',
    price: 12000, duration: '1,5 часа', img: ph('svc-wash') },
  { id: 'tint', cat: 'glass', icon: 'SunDim', title: 'Атермальная тонировка',
    desc: 'Плёнки премиум-класса: салон меньше нагревается летом, стёкла — в рамках закона.',
    price: 40000, duration: '3 часа', img: ph('svc-tint') },
  { id: 'optics', cat: 'glass', icon: 'Zap', title: 'Полировка и бронь фар',
    desc: 'Убираем помутнение и желтизну, затем защищаем оптику прозрачной плёнкой от сколов.',
    price: 25000, duration: '2 часа', img: ph('svc-optics') },
]

export const CAR_CLASSES = [
  { id: 'sedan', label: 'Седан / хэтчбек', k: 1 },
  { id: 'cross', label: 'Кроссовер', k: 1.15 },
  { id: 'suv', label: 'Внедорожник / минивэн', k: 1.3 },
]

export const priceFor = (service, classId = 'sedan') => {
  const k = CAR_CLASSES.find((c) => c.id === classId)?.k ?? 1
  return Math.round((service.price * k) / 500) * 500
}

export const fmt = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸'

export const MASTERS = [
  { id: 'arman', name: 'Арман', role: 'Мастер полировки и керамики', exp: '9 лет', rating: 4.9, works: 1240,
    cats: ['body', 'protect'], photo: ph('master-arman') },
  { id: 'daniyar', name: 'Данияр', role: 'Специалист по PPF и тонировке', exp: '7 лет', rating: 5.0, works: 860,
    cats: ['protect', 'glass'], photo: ph('master-daniyar') },
  { id: 'aliya', name: 'Алия', role: 'Мастер химчистки и кожи', exp: '6 лет', rating: 4.9, works: 1530,
    cats: ['interior', 'body'], photo: ph('master-aliya') },
  { id: 'timur', name: 'Тимур', role: 'Детейлер-универсал', exp: '5 лет', rating: 4.8, works: 980,
    cats: ['body', 'interior', 'glass'], photo: ph('master-timur') },
]

export const ADVANTAGES = [
  { icon: 'BadgeCheck', title: 'Гарантия в договоре', text: 'До 3 лет на керамику и до 5 лет на плёнку — прописываем в документах.' },
  { icon: 'Sun', title: 'Свет как в лаборатории', text: 'Студийные лампы показывают каждый дефект — ничего не уходит недоделанным.' },
  { icon: 'Layers', title: 'Премиальные материалы', text: 'Работаем только с сертифицированной химией и плёнками.' },
  { icon: 'CalendarCheck', title: 'Точно в срок', text: 'Называем срок до начала работ. Опоздали — мойка в подарок.' },
]

export const STATS = [
  { value: '4 600+', label: 'автомобилей' },
  { value: '4.9', label: 'рейтинг в 2ГИС' },
  { value: '8 лет', label: 'на рынке' },
]

// Демонстрационные отзывы
export const REVIEWS = [
  { name: 'Ерлан К.', car: 'Toyota Land Cruiser 300', rating: 5, date: 'октябрь 2026',
    text: 'Делал полировку и керамику перед продажей. Машине 4 года, а покупатель спросил, не из салона ли она. Отдельное спасибо за фотоотчёт каждого этапа.' },
  { name: 'Мадина С.', car: 'Kia Sportage', rating: 5, date: 'сентябрь 2026',
    text: 'Химчистка после двух детей и собаки — думала, это невозможно. Вернули салон как новый, запаха нет совсем. Записалась онлайн за минуту.' },
  { name: 'Айдос Т.', car: 'BMW X5', rating: 5, date: 'август 2026',
    text: 'Оклеили перед плёнкой. Швов практически не видно, края завёрнуты аккуратно. Через месяц пригласили на бесплатный осмотр — сервис на уровне.' },
  { name: 'Ольга В.', car: 'Hyundai Tucson', rating: 4, date: 'август 2026',
    text: 'Качество отличное, тонировка ровная. Одна звезда минус — пришлось подождать 20 минут, но предупредили заранее и угостили кофе.' },
  { name: 'Нурлан Б.', car: 'Lexus ES', rating: 5, date: 'июль 2026',
    text: 'Езжу сюда третий год на мойку и уход. Стабильно, аккуратно, без навязывания лишних услуг. Мастера объясняют, что и зачем делают.' },
  { name: 'Дана Ж.', car: 'Chery Tiggo 8 Pro', rating: 5, date: 'июнь 2026',
    text: 'Восстановили фары — были жёлтые и мутные. Теперь светят как новые, и ещё забронировали плёнкой. Цена совпала с названной в WhatsApp.' },
]

// Время работы для слотов записи (часы начала)
export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
