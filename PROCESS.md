# Кинематографичное интро: как это сделано и как повторить

Процесс повторяет урок «дизайн сайта за 5 шагов» (Higgsfield → Kling → дизайн → Claude Code → правки),
адаптирован под бренд OBSIDIAN.

## Шаг 1. Кадры сцен — Higgsfield, GPT Image 2.6, 16:9 (0,25 кредита за кадр)

Сначала главный кадр, затем остальные ракурсы **с главным кадром в качестве референса** — так машина везде одна и та же.

**Главный кадр (вид спереди 3/4)**
> Cinematic studio product photograph of a modern luxury sports coupe with a deep glossy obsidian-black paint, mirror-like freshly polished and ceramic-coated finish, shown from a front three-quarter view, low camera angle. Generic unbranded car design: no logos, no badges, no emblems, no text, no license plate. Dark minimalist automotive photo studio, seamless matte charcoal floor and backdrop. Dramatic lighting: long warm champagne-gold softbox strips reflecting as crisp lines along the body, subtle cool rim light, soft golden glow pooling on the floor under the car, faint haze. Ultra photorealistic, premium automotive commercial, sharp reflections, high detail, 16:9 composition with the car slightly right of center and empty dark space on the left for text.

**Дальний план** (референс — главный кадр)
> The exact same car from the reference image (identical body shape, wheels, gold brake calipers, glossy obsidian-black paint, no logos), now seen in a wide establishing shot from far away: the car is small in the center-right of the frame, front-facing toward the camera, standing deep inside a vast dark automotive studio. Same lighting mood… cinematic, ultra photorealistic, 16:9.

**Вид сзади 3/4** (референс — главный кадр)
> The exact same car from the reference image (…), now seen from a rear three-quarter view, camera behind and to the left of the car at low height… Taillights glowing thin red lines… empty dark space on the left for text…

**Колесо крупно** (референс — главный кадр)
> Extreme close-up of the front wheel of the exact same car from the reference image: multi-spoke dark bronze alloy wheel, gold brake caliper… Wheel fills the right two-thirds of the frame…

Правило: в каждом кадре оставляйте **тёмное пустое место слева** — туда встанет текст.

## Шаг 2. Переходы — Kling 3.0, режим start/end frame, pro, 5 с, без звука (7,5 кредита за ролик)

| Переход | Начальный кадр | Конечный кадр | Промпт |
|---|---|---|---|
| Подъезд | дальний план | сзади 3/4 | camera glides forward toward the car and arcs around to its rear three-quarter side… car stays still… no cuts |
| Разворот | сзади 3/4 | спереди 3/4 | camera circles around the stationary car from rear 3/4, along its side, to front 3/4… |
| Наезд | спереди 3/4 | колесо крупно | camera dollies forward and lowers into an extreme close-up of the front wheel… |

Всего на этот набор ушло около 24 кредитов.

## Шаг 3. Подготовка медиа

```bash
bash scripts/prepare-media.sh raw/kling1.mp4 raw/kling2.mp4 raw/kling3.mp4
```
Скрипт кладёт в `public/media`: ролики MP4 (H.264) + WebM (VP9), **развёрнутые** версии для движения назад
(`ffmpeg -vf reverse`) и кадры покоя `scene-0..3.jpg` (последний кадр каждого перехода).

## Шаг 4. Сборка — промпт для Claude Code (адаптирован из урока)

```
Собери интро лендинга из полноэкранных сцен, соединённых кинематографичными видео-переходами.
## Материалы
— 3 видео переходов (подъезд, разворот, наезд на колесо), 16:9, + их reverse-версии;
— кадры покоя scene-0..3.jpg.
## Механика сцен
4 сцены = 4 состояния покоя, между ними 3 перехода:
дальний план → [подъезд] → вид сзади 3/4 → [разворот] → вид спереди 3/4 → [наезд] → колесо крупно.
Пока страница вверху, вьюпорт зафиксирован. Один жест скролла = ровно один переход. Перепрыгнуть через сцену нельзя.
Состояние покоя — это последний кадр предыдущего видео.
Назад: играй заранее развёрнутые ролики нативно. Промотка currentTime назад — только запасной вариант.
## Скролл
— колесо / трекпад, свайпы, стрелки, PageUp/PageDown, пробел;
— инерция трекпада гасится: пока события идут сплошным потоком — это один жест, новый шаг только после паузы тишины (~180 мс);
— события во время перехода игнорируются и НЕ копятся в очередь;
— на первой сцене назад нельзя; с последней сцены жест отпускает страницу к обычному сайту.
## Интро
При заходе первое видео запускается само и доводит до второй сцены, где появляется её блок. Дальше — только по скроллу.
Если play() отклонён — проигрывай переход ручной протяжкой currentTime через requestAnimationFrame, не схлопывай в скачок.
Скорость роликов — настройка playbackRate = 1.5.
## Блоки
— содержимое блока появляется ТОЛЬКО после того, как видео перехода доиграло;
— с началом следующего перехода блок уходит согласованной анимацией (~0.35 с);
— элементы выезжают со своей задержкой: подъём + растворение + уход размытия;
— prefers-reduced-motion: простое проявление.
Масштабирование: все размеры calc(N * var(--s)), --s: min(100vw/1440, 100vh/810). На телефоне — отдельная раскладка.
Шрифты — локально (woff2), не из сети.
## Надёжность
— ожидание загрузки видео ограничено по времени;
— если воспроизведение не дошло до конца — всё равно доведи кадр в финальное положение;
— страница не должна молча чернеть: если видео не загрузилось — показывай кадры покоя и сообщение.
## Проверка
Автотест механики: вперёд, назад, упоры, инерционный жест (один шаг, не три), скролл во время перехода,
свайпы, клавиатура, промотка без reverse-файла, недоступное видео.
```

## Шаг 5. Проверка
```bash
npm run build
python3 -m http.server 4173 -d dist &
python3 scripts/test-intro.py      # 26 проверок
```

## Что найдено и исправлено при проверке
- Chromium сбрасывает закончившееся видео на 0, если перемотать его к последнему кадру. Поэтому после естественного конца
  ролик не трогаем, а если кадр всё же не встал — показываем кадр покоя.
- Chromium из Playwright может не играть H.264, поэтому у роликов два источника: MP4 и WebM.

## Как заменить машину / ролики
1. Сгенерируйте новые кадры и переходы по шагам 1–2.
2. `bash scripts/prepare-media.sh путь/к/t1.mp4 путь/к/t2.mp4 путь/к/t3.mp4`
3. Тексты блоков — в `src/intro/CinematicIntro.jsx`, настройки (скорость, паузы, таймауты) — в `src/intro/config.js`.

## Фото для разделов сайта — Higgsfield, GPT Image 2.6 (0,25 кредита за фото, ~4 кредита за 16 шт.)

Где в кадре машина — главный кадр интро передаётся как `image_references`, поэтому машина везде одна.
Общий хвост каждого промпта: *dark detailing studio, warm champagne-gold lighting, premium automotive photography, no logos, no text*.

| Файл | Пропорции | Сюжет |
|---|---|---|
| svc-polish | 4:3 | детейлер полирует капот машинкой с оранжевым кругом, половина капота уже зеркальная |
| svc-ceramic | 4:3 | нанесение керамики аппликатором, капли воды скатываются с покрытия |
| svc-ppf | 4:3 | поклейка прозрачной плёнки на бампер ракелем |
| svc-interior | 4:3 | химчистка кожаного сиденья щёткой с паром |
| svc-leather | 4:3 | ухоженные чёрно-коньячные кожаные сиденья, салфетка и флакон |
| svc-wash | 4:3 | ручная мойка: машина в белой пене, рукавица |
| svc-tint | 4:3 | тонировка бокового стекла феном и ракелем |
| svc-optics | 4:3 | восстановленная прозрачная LED-фара крупным планом |
| about-studio | 3:4 | студия под линейными лампами, мастер проверяет ЛКП фонарём |
| about-tools | 1:1 | полка с машинками, кругами, микрофибрами и флаконами без этикеток |
| after | 16:9 | борт после полировки и керамики — зеркальный блеск |
| before | 16:9 | **редактирование after**: тот же кадр, но тусклый лак, голограммы, пыль — ракурс совпадает идеально |
| master-* | 4:5 | портреты мастеров в чёрной рабочей форме в студии (у каждого атрибут: плёнка, щётка, микрофибра) |

Совет: запускайте не больше ~8 генераций за раз — иначе Higgsfield отвечает 429 (лимит частоты), задания не создаются и кредиты не списываются.
