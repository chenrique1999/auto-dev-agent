import { gerarPreview } from './codepen-utils.mjs';
import { extrairCodigoDoCodePen, salvarComoComponente } from './codepen-importer.cjs';

const [,, penUrl, nome, destino = '.temp/codepen'] = process.argv;

(async () => {
 if (!penUrl || !nome) {
 console.error('Uso: codepen-importar.cjs <url> <nome-componente> [destino]');
 process.exit(1);
 }

 console.log(`🔍 Extraindo pen: ${penUrl}`);
 const dados = await extrairCodigoDoCodePen(penUrl);
 if (!dados) {
 console.error('❌ Falha ao extrair PEN');
 process.exit(1);
 }

 salvarComoComponente(dados, destino, nome);
})();
