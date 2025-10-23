#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const moves = [
 { from: 'README.md', to: 'docs/README.md' },
 { from: 'scripts/doctor.mjs', to: 'src/doctor.mjs' },
 { from: 'scripts/fix-auth.mjs', to: 'src/fix-auth.mjs' },
 { from: 'tests/api.test.cjs', to: 'test/api.test.cjs' },
];

const base = process.cwd();

for (const { from, to } of moves) {
 const src = path.join(base, from);
 const dest = path.join(base, to);
 try {
 await fs.mkdir(path.dirname(dest), { recursive: true });
 await fs.rename(src, dest);
 console.log(`✔️ Moved: ${from} → ${to}`);
 } catch (err) {
 if (err.code === 'ENOENT') {
 console.warn(`⚠️ Not found: ${from}`);
 } else {
 console.error(`❌ Error moving ${from}:`, err);
 }
 }
}
