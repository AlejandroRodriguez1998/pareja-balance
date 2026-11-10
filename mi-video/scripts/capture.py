"""Capture the original application pages with isolated, illustrative local data.

Requires Python Playwright. Start `npm run capture:serve` first.
All remote requests are blocked; no Firebase connection or credentials are used.
"""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'screens'
OUT.mkdir(parents=True, exist_ok=True)


async def main():
    async with async_playwright() as pw:
        installed = sorted((Path.home() / '.cache/ms-playwright').glob('chromium-*/chrome-linux/chrome'))
        browser = await pw.chromium.launch(**({'executable_path': str(installed[-1])} if installed else {}))
        context = await browser.new_context(viewport={'width': 430, 'height': 900}, device_scale_factor=2, locale='es-ES', timezone_id='Europe/Madrid', color_scheme='dark', reduced_motion='reduce')
        await context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(('http://127.0.0.1:4173/', 'data:', 'blob:')) else route.abort())
        await context.route('**/api/electricity', lambda route: route.fulfill(status=503, json={'error': 'Precio actual no disponible'}))
        page = await context.new_page()
        await page.clock.install(time=datetime(2026, 11, 10, 11, 0, tzinfo=timezone.utc))
        await context.add_init_script("document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = 'html[data-capture-crop] .app-bottom-nav, html[data-capture-crop] .app-fab, html[data-capture-crop] .app-top-nav {visibility:hidden !important}'; document.head.append(s); });")
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        metadata = {}

        async def open_page(name):
            await page.goto('http://127.0.0.1:4173/?page=' + name)
            await page.locator('.dashboard-container').wait_for()
            await page.evaluate('document.fonts.ready')
            await page.wait_for_timeout(350)

        async def shot(name):
            await page.screenshot(path=str(OUT / (name + '.png')))

        async def crop(name, selector):
            element = page.locator(selector).first
            await page.evaluate("document.documentElement.setAttribute('data-capture-crop', '')")
            await element.screenshot(path=str(OUT / (name + '.png')))
            metadata[name] = await element.bounding_box()
            await page.evaluate("document.documentElement.removeAttribute('data-capture-crop'); window.scrollTo(0, 0)")

        await open_page('dashboard')
        await shot('dashboard-mobile')
        await crop('balance-card', '.balance-hero')
        await crop('week-card', '.week-summary')
        await page.get_by_role('button', name='Añadir', exact=True).click()
        await page.get_by_role('button', name='Gasto Registrar un gasto compartido').click()
        await page.get_by_placeholder('Ejemplo: Supermercado').fill('Compra de la semana')
        await page.locator('input[type=number]').fill('62.50')
        await page.wait_for_timeout(250)
        await shot('expense-form')
        await crop('expense-modal', '.modal-content')

        await open_page('meals')
        await shot('meals-mobile')
        await crop('today-card', '.today-meal-panel')
        await crop('tomorrow-card', '.tomorrow-meal-panel')
        await crop('meals-week-card', '.meals-overview')
        await page.get_by_role('tab', name='Lista de compra').click()
        await page.get_by_role('heading', name='Lista de la compra').wait_for()
        await shot('shopping-mobile')
        await page.get_by_role('button', name='Marcar Tomates como comprado', exact=True).click()
        await page.get_by_role('button', name='Marcar Tomates como pendiente', exact=True).wait_for()
        await shot('shopping-done-mobile')

        await open_page('tasks')
        await shot('tasks-mobile')
        await crop('tasks-card', '.tasks-panel')
        for i in range(3):
            await crop(f'assignment-{i+1}', f'.tasks-panel:first-child .shared-task-row >> nth={i}')
        await page.get_by_role('button', name='Completar Poner la lavadora', exact=True).click()
        await page.get_by_role('button', name='Marcar Poner la lavadora como pendiente', exact=True).wait_for()
        await shot('tasks-done-mobile')
        await crop('completed-card', '.tasks-panel >> nth=1')

        await open_page('us')
        await shot('us-mobile')
        await crop('plan-card', '.couple-grid .couple-card')
        await crop('savings-card', '.savings-section')

        await open_page('dashboard')
        await page.get_by_role('button', name='Ajustes', exact=True).click()
        await page.get_by_role('button', name='Claro', exact=True).click()
        await page.locator('.modal .btn-close').click()
        await page.wait_for_timeout(350)
        await shot('dashboard-light-mobile')
        await page.get_by_role('button', name='Ajustes', exact=True).click()
        await page.get_by_role('button', name='Oscuro', exact=True).click()
        await page.locator('.modal .btn-close').click()

        await page.set_viewport_size({'width': 1440, 'height': 960})
        await open_page('dashboard')
        await shot('dashboard-desktop')
        await open_page('us')
        await shot('us-desktop')
        await page.goto('http://127.0.0.1:4173/?page=landing')
        await page.locator('.landing-hero').wait_for()
        await page.evaluate('document.fonts.ready')
        await shot('landing-desktop')

        (OUT / 'capture-report.json').write_text(json.dumps({'errors': errors, 'crops': metadata, 'source': 'Original React pages + original CSS; isolated local fixture data', 'date': '2026-11-10', 'mobileViewport': [430, 900], 'desktopViewport': [1440, 960], 'deviceScaleFactor': 2}, ensure_ascii=False, indent=2))
        await browser.close()
        if errors:
            raise RuntimeError('\n'.join(errors))
        print('Captures OK: original pages, task and shopping interactions, mobile + desktop. No page errors.')


asyncio.run(main())
