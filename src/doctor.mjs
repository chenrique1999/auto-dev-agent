import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import 'dotenv/config';

const PORT = Number(process.env.AGENT_PORT || process.env.PORT || 7777);
const REPO_DIR = process.env.REPO_DIR || process.cwd();
const TOKEN = (process.env.AGENT_TOKEN || '').trim();

function exists(p){ try { fs.accessSync(p); return true; } catch { return false; } }

async function portFree(port){
  return await new Promise((resolve) => {
    const srv = net.createServer().once('error', () => resolve(false)).once('listening', () => {
      srv.close(() => resolve(true));
    }).listen(port, '127.0.0.1');
  });
}

(async () => {
  const out = {
    node: process.version,
    cwd: process.cwd(),
    repoDir: REPO_DIR,
    repoDirExists: exists(REPO_DIR),
    tokenSet: !!TOKEN,
    tokenIsPlaceholder: TOKEN === 'SENHASECRETA',
    port: PORT,
    portFree: await portFree(PORT),
    files: {
      serverMjs: exists('server.mjs'),
      agentMjs: exists('agent.mjs'),
      testsApi: exists('tests/api.test.cjs'),
      dockerfile: exists('Dockerfile'),
      compose: exists('docker-compose.yml'),
      packageJson: exists('package.json')
    }
  };
  console.log(JSON.stringify(out, null, 2));

  if (!out.tokenSet) console.warn('⚠️  AGENT_TOKEN ausente.');
  if (out.tokenIsPlaceholder) console.warn('⚠️  AGENT_TOKEN ainda é \'SENHASECRETA\'. Troque por algo forte.');
  if (!out.repoDirExists) console.warn('⚠️  REPO_DIR não existe. Ajuste no .env.');
  if (!out.portFree) console.warn(`⚠️  Porta ${PORT} ocupada. Libere antes de iniciar.`);
})();
