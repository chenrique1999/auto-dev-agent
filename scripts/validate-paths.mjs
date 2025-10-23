import { readFileSync, existsSync } from 'fs';
import path from 'path';

const root = process.cwd();
const requiredPaths = [
 'server.mjs',
 'agent.mjs',
 'openapi.json',
 'scripts/organize.mjs',
 'src/doctor.mjs',
 'src/fix-auth.mjs',
 'src/logger.mjs',
 'test/api.test.mjs'
];

let missing = [];
for (const rel of requiredPaths) {
 const full = path.resolve(root, rel);
 if (!existsSync(full)) missing.push(rel);
}

if (missing.length > 0) {
 console.error('[erro] caminhos ausentes:', missing);
 process.exit(1);
} else {
 console.log('[ok] todos os caminhos requeridos existem');
}
