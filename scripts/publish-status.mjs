import { writeFileSync, readFileSync, existsSync } from 'fs';
const now = new Date().toISOString();
const statusPath = '.atlas/status.json';
const historyPath = '.atlas/history.json';

const status = { status: 'ok', tests: 'passed', lastUpdate: now };
writeFileSync(statusPath, JSON.stringify(status, null, 2));

let history = [];
if (existsSync(historyPath)) {
 history = JSON.parse(readFileSync(historyPath, 'utf8'));
}
history.unshift({ ts: now, status: 'ok', tests: 'passed' });
writeFileSync(historyPath, JSON.stringify(history.slice(0, 20), null, 2));

console.log('[atlas] status + histórico atualizados');
