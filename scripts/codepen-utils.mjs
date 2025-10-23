
export async function gerarPreview(nome, destino) {
 const fs = await import('fs');
 const path = await import('path');

 const htmlPath = path.join(destino, 'index.html');
 const cssPath = path.join(destino, 'style.css');
 const jsPath = path.join(destino, 'script.js');
 const previewPath = path.join(destino, 'preview.html');

 const html = fs.existsSync(htmlPath) ? await fs.promises.readFile(htmlPath, 'utf-8') : '';
 const hasJS = fs.existsSync(jsPath);
 const hasCSS = fs.existsSync(cssPath);

 const preview = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>${nome}</title>
 ${hasCSS ? '<link rel="stylesheet" href="./style.css">' : ''}
</head>
<body>
 ${html}
 ${hasJS ? '<script src="./script.js"></script>' : ''}
</body>
</html>`;

 await fs.promises.writeFile(previewPath, preview, 'utf-8');
}

