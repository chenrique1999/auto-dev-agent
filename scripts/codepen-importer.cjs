const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function extrairCodigoDoCodePen(penUrl) {
 try {
 const editUrl = penUrl + '?editors=111';
 const browser = await puppeteer.launch({ headless: false });
 const page = await browser.newPage();
 await page.goto(editUrl, { waitUntil: 'networkidle2' });
 await page.waitForSelector('.CodeMirror', { timeout: 15000 });

 const { html, css, js } = await page.evaluate(() => {
 const get = (i) => document.querySelectorAll('.CodeMirror')[i]?.CodeMirror?.getValue?.() || '';
 return {
 html: get(0),
 css: get(1),
 js: get(2),
 };
 });

 await browser.close();
 return { html, css, js };
 } catch (err) {
 console.error('[codepen-importer] Puppeteer erro:', err.message);
 return null;
 }
}

function salvarComoComponente({ html, css, js }, destino, nome) {
 if (!html && !css && !js) return;
 const base = path.join(destino, 'components', nome);
 fs.mkdirSync(base, { recursive: true });
 if (html) fs.writeFileSync(path.join(base, 'index.html'), html);
 if (css) fs.writeFileSync(path.join(base, 'style.css'), css);
 if (js) fs.writeFileSync(path.join(base, 'script.js'), js);
 console.log(`✅ Componente ${nome} criado em ${base}`);
}

module.exports = { extrairCodigoDoCodePen, salvarComoComponente };
