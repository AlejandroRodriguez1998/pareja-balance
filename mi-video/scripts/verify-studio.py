"""Check Studio loading, frame seeking and visible title bounds on the real timeline."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FRAMES = [20, 30, 70, 120, 165, 240, 390, 495, 600, 705, 810, 885, 1020, 1125, 1230, 1305, 1380, 1455, 1530, 1710, 1799]

with sync_playwright() as pw:
    installed = sorted((Path.home() / '.cache/ms-playwright').glob('chromium-*/chrome-linux/chrome'))
    browser = pw.chromium.launch(**({'executable_path': str(installed[-1])} if installed else {}))
    page = browser.new_page(viewport={'width': 1600, 'height': 1000})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto('http://localhost:3000/ParejaBalancePromo', wait_until='networkidle')
    page.wait_for_function('typeof window.remotion_setFrame === "function"')
    results = []
    for frame in FRAMES:
        page.evaluate('(f) => window.remotion_setFrame(f, "ParejaBalancePromo", 0)', frame)
        page.wait_for_timeout(130)
        data = page.evaluate('''() => [...document.querySelectorAll('[data-video-copy]')].flatMap(el => {
          const stage = el.closest('[data-video-stage]');
          if (!stage || getComputedStyle(el).opacity < 0.9) return [];
          const box = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
          if (box.width < 1 || box.height < 1) return [];
          const scale = s.width / 1920;
          if (!scale) return [];
          const text = el.innerText.trim();
          const r = {text, x: (box.x-s.x)/scale, y: (box.y-s.y)/scale, width: box.width/scale, height: box.height/scale};
          const css = getComputedStyle(el);
          r.overflow = (css.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 2) || (css.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 2);
          r.outsideFrame = r.x < 0 || r.y < 0 || r.x + r.width > 1922 || r.y + r.height > 1082;
          return [r];
        })''')
        results.append({'frame': frame, 'texts': data})
    page.screenshot(path=str(ROOT / 'out/studio-preview.png'))
    report = {'url': page.url, 'errors': errors, 'frames': results}
    (ROOT / 'out/studio-check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    browser.close()
    issues = [(r['frame'], t) for r in results for t in r['texts'] if t['overflow'] or t['outsideFrame']]
    if errors or issues:
        raise RuntimeError(json.dumps({'errors': errors, 'issues': issues}, ensure_ascii=False))
    if not any(r['texts'] for r in results):
        raise RuntimeError('No visible titles found; inspection did not reach the preview.')
    print(f'Studio OK: {len(FRAMES)} frames, no JavaScript errors, no title overflow.')
