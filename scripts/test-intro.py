"""Автотест механики кинематографичного интро.
Запуск: npm run build && python3 -m http.server 4173 -d dist & python3 scripts/test-intro.py
Требуется: pip install playwright && playwright install chromium
"""
import sys, time
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/'
results = []

def check(name, ok, info=''):
    results.append(ok)
    print(('  OK  ' if ok else ' FAIL ') + name + (f'  [{info}]' if info else ''))

def scene(pg): return pg.evaluate('window.__intro.scene')
def busy(pg): return pg.evaluate('window.__intro.busy')
def wait_idle(pg, timeout=15):
    t = time.time()
    while time.time() - t < timeout:
        if not busy(pg): return True
        pg.wait_for_timeout(100)
    return False
def wait_intro(pg, timeout=15):
    """Ждём, пока автозапуск интро доведёт до второй сцены."""
    t = time.time()
    while time.time() - t < timeout:
        if pg.evaluate('window.__intro && window.__intro.scene') == 1 and not busy(pg): return True
        pg.wait_for_timeout(100)
    return False
def block_visible(pg, i):
    return pg.evaluate(f'document.querySelector("[data-block=\\"{i}\\"]").classList.contains("is-in")')

def inertial_wheel(pg, dy, n=25, gap=16):
    """Имитация инерции трекпада: сплошной поток событий без пауз = один жест."""
    for _ in range(n):
        pg.mouse.wheel(0, dy); pg.wait_for_timeout(gap)

def fresh_gesture(pg, dy):
    pg.wait_for_timeout(260)  # пауза тишины > 180 мс
    pg.mouse.wheel(0, dy)

with sync_playwright() as p:
    b = p.chromium.launch()

    print('\n— Десктоп: основные сценарии')
    pg = b.new_page(viewport={'width': 1440, 'height': 810})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.mouse.move(700, 400)
    pg.wait_for_function('window.__intro && window.__intro.busy', timeout=5000)
    check('интро стартует само (без скролла) и уходит в переход', busy(pg))
    check('блок сцены 2 НЕ виден, пока идёт видео', not block_visible(pg, 1))
    wait_intro(pg)
    check('после интро — сцена 2 (индекс 1) и её блок', scene(pg) == 1 and block_visible(pg, 1), f'scene={scene(pg)}')

    fresh_gesture(pg, 120); inertial_wheel(pg, 60)
    wait_idle(pg)
    check('инерционный жест = один шаг, не три', scene(pg) == 2, f'scene={scene(pg)}')

    fresh_gesture(pg, 120); pg.wait_for_timeout(150)
    check('переход идёт', busy(pg))
    for _ in range(3):
        pg.wait_for_timeout(250); pg.mouse.wheel(0, 120)  # отдельные жесты ВО ВРЕМЯ перехода
    wait_idle(pg); pg.wait_for_timeout(400)
    check('скролл во время перехода игнорируется и не копится', scene(pg) == 3 and not busy(pg), f'scene={scene(pg)}')
    check('страница не прокручивалась во время сцен', pg.evaluate('scrollY') < 4)

    fresh_gesture(pg, -120); pg.wait_for_timeout(150)
    rev_visible = pg.evaluate('[...document.querySelectorAll(".intro video")].findIndex(v=>v.classList.contains("is-visible"))')
    check('назад играет развёрнутый ролик', rev_visible == 5, f'video idx={rev_visible}')
    wait_idle(pg)
    check('назад: сцена 3 (индекс 2)', scene(pg) == 2)

    pg.keyboard.press('ArrowUp'); wait_idle(pg)
    check('клавиатура: стрелка вверх', scene(pg) == 1)
    fresh_gesture(pg, -120); wait_idle(pg)
    check('назад до первой сцены', scene(pg) == 0)
    fresh_gesture(pg, -120); pg.wait_for_timeout(300)
    check('упор на первой сцене: назад нельзя', scene(pg) == 0 and not busy(pg))

    for k in ['PageDown', 'ArrowDown', ' ']:
        pg.keyboard.press(k); wait_idle(pg)
    check('клавиатура: PageDown / ↓ / пробел', scene(pg) == 3, f'scene={scene(pg)}')

    fresh_gesture(pg, 120); pg.wait_for_timeout(1500)
    y = pg.evaluate('scrollY')
    check('с последней сцены жест отпускает страницу к сайту', y > 300 and scene(pg) == 3, f'scrollY={y}')
    pg.mouse.wheel(0, 600); pg.wait_for_timeout(500)
    check('ниже интро — обычный скролл', pg.evaluate('scrollY') > y)

    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(300)
    fresh_gesture(pg, -120); wait_idle(pg)
    check('вернулись наверх — интро снова управляет (назад к сцене 3)', scene(pg) == 2)

    pg.click('header button:has-text("Записаться")'); pg.wait_for_timeout(300)
    pg.mouse.wheel(0, 300); pg.wait_for_timeout(400)
    check('при открытой записи колесо не листает сцены', scene(pg) == 2)
    pg.keyboard.press('Escape')
    check('нет ошибок JS', not errs, '; '.join(errs))

    print('\n— Нет reverse-файлов: промотка назад вручную')
    pg2 = b.new_page(viewport={'width': 1440, 'height': 810})
    pg2.route('**/*-rev.*', lambda r: r.abort())
    pg2.goto(URL); pg2.mouse.move(700, 400); wait_intro(pg2)
    fresh_gesture(pg2, 120); wait_idle(pg2)
    t = time.time(); fresh_gesture(pg2, -120); pg2.wait_for_timeout(200)
    check('назад без reverse — это протяжка, а не мгновенный скачок', busy(pg2))
    wait_idle(pg2, 20)
    check('…и доходит до сцены', scene(pg2) == 1, f'{time.time()-t:.1f}s')

    print('\n— Видео недоступно: навигация не зависает')
    pg3 = b.new_page(viewport={'width': 1440, 'height': 810})
    pg3.route('**/*.mp4', lambda r: r.abort()); pg3.route('**/*.webm', lambda r: r.abort())
    pg3.goto(URL); pg3.mouse.move(700, 400)
    ok = wait_intro(pg3, 15)
    check('интро завершается по таймауту загрузки', ok and scene(pg3) == 1)
    check('показаны кадры вместо видео и предупреждение', pg3.locator('.intro img.is-visible').count() == 1 and pg3.locator('.intro-warn').count() == 1)
    fresh_gesture(pg3, 120); check('дальше переходы работают', wait_idle(pg3, 12) and scene(pg3) == 2)

    print('\n— Телефон: свайпы')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
    m = ctx.new_page(); m.goto(URL); wait_intro(m)
    def swipe(page, dy):
        page.evaluate(f'''() => {{
          const t = (y) => new Touch({{identifier: 1, target: document.body, clientX: 200, clientY: y}});
          const s = 600, e = 600 - ({dy});
          window.dispatchEvent(new TouchEvent('touchstart', {{touches: [t(s)], changedTouches: [t(s)], bubbles: true}}));
          window.dispatchEvent(new TouchEvent('touchmove', {{touches: [t(e)], changedTouches: [t(e)], bubbles: true, cancelable: true}}));
          window.dispatchEvent(new TouchEvent('touchend', {{touches: [], changedTouches: [t(e)], bubbles: true}}));
        }}''')
    swipe(m, 200); wait_idle(m)
    check('свайп вверх — следующая сцена', scene(m) == 2)
    swipe(m, -200); wait_idle(m)
    check('свайп вниз — предыдущая сцена', scene(m) == 1)
    swipe(m, 20); m.wait_for_timeout(300)
    check('короткий свайп игнорируется', scene(m) == 1)
    m.screenshot(path='/tmp/intro_mobile.png')

    b.close()

print(f'\nИтого: {sum(results)}/{len(results)} проверок пройдено')
sys.exit(0 if all(results) else 1)
