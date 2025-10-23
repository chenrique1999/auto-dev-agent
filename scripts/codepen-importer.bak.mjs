// Extrator CodePen via embed iframe
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export async function extrairCodigoDoCodePen(penUrl) {
 try {
 const embedUrl = penUrl.replace('/pen/', '/embed/');
 const browser = await puppeteer.launch({ headless: 'new' });
 const page = await browser.newPage();
 await page.goto(embedUrl, { waitUntil: 'networkidle2' });

 const html = await page.evaluate(() => document.querySelector('#result')?.innerHTML || '');
 const css = await page.evaluate(() => Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n'));
 const js = await page.evaluate(() => Array.from(document.querySelectorAll('script')).map(s => s.innerHTML).join('\n'));

 await browser.close();
 return { html, css, js };
 } catch (err) {
 console.error('[codepen-importer] Puppeteer erro:', err.message);
 return null;
 }
}

export function salvarComoComponente({ html, css, js }, destino, nome) {
 if (!html && !css && !js) return;
 const base = path.join(destino, 'components', nome);
 fs.mkdirSync(base, { recursive: true });
 if (html) fs.writeFileSync(path.join(base, 'index.html'), html);
 if (css) fs.writeFileSync(path.join(base, 'style.css'), css);
 if (js) fs.writeFileSync(path.join(base, 'script.js'), js);
 console.log(`✅ Componente ${nome} criado em ${base}`);
}
