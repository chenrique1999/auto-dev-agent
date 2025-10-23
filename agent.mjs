// agent.mjs — Safe Mode Toolkit (multi-workspace)
import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execaCommand } from 'execa';

// ====== Raiz do agente (pasta deste arquivo)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const AGENT_ROOT = __dirname;

// ====== ENV & Defaults ======
const REPO_DIR = path.resolve(process.env.REPO_DIR || process.cwd());
const SAFE_MODE = String(process.env.AGENT_SAFE_MODE || 'on').toLowerCase() !== 'off';
const DRY_RUN = ['1', 'true', 'yes', 'on'].includes(String(process.env.AGENT_DRY_RUN || '0').toLowerCase());
const MAX_TIMEOUT_MS = Math.max(1_000, Math.min(10 * 60_000, Number(process.env.AGENT_MAX_TIMEOUT_MS || 180_000))); // 1s..10min
const MAX_OUTPUT_BYTES = Math.max(64 * 1024, Math.min(50 * 1024 * 1024, Number(process.env.AGENT_MAX_OUTPUT_BYTES || 5 * 1024 * 1024))); // 64KB..50MB
const STRIP_SECRETS = String(process.env.AGENT_STRIP_SECRETS || '1') !== '0';

function parseList(val) {
  if (!val) return [];
  const s = String(val).trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try { return (JSON.parse(s) || []).map(x => String(x)); } catch { return []; }
  }
  return s.split(/[;,\n]/).map(x => x.trim()).filter(Boolean);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function toMatcher(pat) {
  const p = String(pat).trim();
  if (!p) return () => false;
  if (p.startsWith('re:')) {
    const rx = new RegExp(p.slice(3), 'i');
    return (cmd) => rx.test(cmd);
  }
  const low = p.toLowerCase();
  if (low.includes('*')) {
    const rx = new RegExp(low.split('*').map(escapeRe).join('.*'), 'i');
    return (cmd) => rx.test(cmd.toLowerCase());
  }
  return (cmd) => cmd.toLowerCase().includes(low);
}

const DEFAULT_DENY = [
  're:\\brm\\s+-rf\\s+(/|~)\\b',
  're:\\b(sudo|mkfs|fdisk|mount|umount|shutdown|reboot|poweroff|halt)\\b',
  're:\\bdd\\s+if=\\/dev\\/',
  're:\\b(format\\s+c:|del\\s+/s\\s+/q\\s+c:\\\\|rd\\s+/s\\s+/q\\s+c:\\\\)\\b',
  're:\\|\\s*sh\\b',
  're:\\|\\s*powershell\\b',
  're:>\\s*\\/dev\\/(sda|nvme\\w+n\\d+)',
  're:\\bnc\\b.*-e',
  're:>&\\s*\\/dev\\/tcp',
  're::\\(\\)\\{:\\|:&\\};:',
  're:\\buseradd\\b|\\badduser\\b|\\bgroupadd\\b',
  're:\\biptables\\b|\\bpfctl\\b|\\broute\\b\\s+add'
];

const EXTRA_DENY = parseList(process.env.AGENT_DENY);
const ALLOW      = parseList(process.env.AGENT_ALLOW); // se não-vazio, exige match

const denyFns = [...DEFAULT_DENY, ...EXTRA_DENY].map(toMatcher);
const allowFns = ALLOW.map(toMatcher);

// ====== Workspaces permitidos
function getAllowedDirs() {
  let list = [];
  try {
    const raw = process.env.AGENT_WORKSPACES;
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        list = arr
          .filter(x => x && x.path)
          .map(x => path.resolve(String(x.path)));
      }
    }
  } catch { /* ignore */ }
  // incluir sempre REPO_DIR e AGENT_ROOT
  const set = new Set([REPO_DIR, AGENT_ROOT, ...list].map(p => path.resolve(p)));
  return Array.from(set);
}
function insideAllowed(abs, bases = getAllowedDirs()) {
  const p = path.resolve(abs);
  for (const base of bases) {
    const b = path.resolve(base) + path.sep;
    if (p === path.resolve(base) || p.startsWith(b)) return true;
  }
  return false;
}

// ====== Utilitários de ambiente para o processo filho
function buildExecEnv(extra = {}) {
  const env = { ...process.env };
  if (STRIP_SECRETS) {
    for (const k of Object.keys(env)) {
      if (/^(AWS_|GCP_|GOOGLE_|AZURE_|OPENAI_|SUPABASE_|POSTGRES_|NEON_|TURSO_|MONGO_|MYSQL_|SENTRY_|NEWRELIC_)/i.test(k)) {
        delete env[k];
      }
    }
  }
  return {
    PATH: env.PATH,
    HOME: env.HOME,
    LANG: env.LANG || 'en_US.UTF-8',
    TERM: env.TERM || 'xterm-256color',
    ...extra
  };
}

// ====== Inspeções de segurança
function extractRmRfTargets(command) {
  const m = [];
  const rx = /rm\s+-rf\s+([^;&|]+)/gi;
  let r;
  while ((r = rx.exec(command)) !== null) {
    const raw = String(r[1]).trim().replace(/^['"]|['"]$/g, '');
    if (raw) m.push(raw);
  }
  return m;
}

function checkAllowed(command, cwd) {
  const cmd = String(command || '').trim();
  if (!cmd) return { ok: false, reason: 'empty-command' };
  if (!SAFE_MODE) return { ok: true };

  // padrões proibidos
  for (const fn of denyFns) {
    if (fn(cmd)) return { ok: false, reason: 'denied-by-pattern', details: 'match in denylist' };
  }

  // rm -rf fora das pastas permitidas
  const targets = extractRmRfTargets(cmd);
  for (const t of targets) {
    const isWinAbs = /^[a-zA-Z]:\\/.test(t);
    const isPosixAbs = t.startsWith('/');
    const targetAbs = isWinAbs || isPosixAbs ? path.resolve(t) : path.resolve(cwd, t);
    if (!insideAllowed(targetAbs)) {
      return { ok: false, reason: 'rmrf-outside-allowed', details: targetAbs };
    }
  }

  // allowlist (se houver)
  if (allowFns.length > 0) {
    const allowed = allowFns.some(fn => fn(cmd));
    if (!allowed) return { ok: false, reason: 'blocked-by-allowlist' };
  }

  // cd foo && ... não pode sair das pastas permitidas
  const cdRx = /(?:^|[;&|])\s*cd\s+([^;&|]+)/gi;
  let m;
  while ((m = cdRx.exec(cmd)) !== null) {
    const raw = String(m[1]).trim().replace(/^['"]|['"]$/g, '');
    const abs = path.resolve(cwd, raw);
    if (!insideAllowed(abs)) return { ok: false, reason: 'cd-outside-allowed', details: abs };
  }

  return { ok: true };
}

// ====== Policy para debug
export function getPolicy() {
  return {
    SAFE_MODE, DRY_RUN,
    REPO_DIR, AGENT_ROOT,
    MAX_TIMEOUT_MS, MAX_OUTPUT_BYTES, STRIP_SECRETS,
    allow: ALLOW,
    deny: [...DEFAULT_DENY, ...EXTRA_DENY],
    ALLOWED_DIRS: getAllowedDirs()
  };
}

// ====== Execução segura
export async function runShellSecure(command, opts = {}) {
  // Aceita opts.cwd (antigo) e opts.cwdDir (novo)
  const wantedCwd = path.resolve(opts.cwd || opts.cwdDir || REPO_DIR);

  if (!insideAllowed(wantedCwd)) {
    if (opts.onStderr) opts.onStderr(`[denied] cwd-outside-allowed :: ${wantedCwd}\n`);
    return { ok: false, denied: true, reason: 'cwd-outside-allowed', details: wantedCwd, exitCode: 126, stdout: '', stderr: '' };
  }

  const check = checkAllowed(command, wantedCwd);
  if (!check.ok) {
    const msg = `[denied] ${check.reason}${check.details ? ' :: ' + check.details : ''}\n`;
    if (opts.onStderr) opts.onStderr(msg);
    return { ok: false, denied: true, reason: check.reason, details: check.details, exitCode: 126, stdout: '', stderr: msg };
  }

  if (DRY_RUN || opts.dryRun) {
    if (opts.onStdout) opts.onStdout(`[dry-run] ${command}\n`);
    return { ok: true, dryRun: true, exitCode: 0, stdout: '', stderr: '' };
  }

  const timeout   = Math.max(1_000, Math.min(10 * 60_000, Number(opts.timeoutMs || MAX_TIMEOUT_MS)));
  const maxBuffer = Math.max(64 * 1024, Math.min(50 * 1024 * 1024, Number(opts.maxBuffer || MAX_OUTPUT_BYTES)));

  const child = execaCommand(command, {
    cwd: wantedCwd,
    shell: true,
    reject: false,
    timeout,
    killSignal: 'SIGKILL',
    maxBuffer,
    env: buildExecEnv(opts.env),
    windowsHide: true
  });

  if (opts.onStdout && child.stdout) child.stdout.on('data', (c) => opts.onStdout(String(c)));
  if (opts.onStderr && child.stderr) child.stderr.on('data', (c) => opts.onStderr(String(c)));

  const res = await child;
  const { exitCode, stdout, stderr, timedOut } = res;
  return { ok: exitCode === 0, exitCode, stdout, stderr, timedOut: !!timedOut };
}

// ====== File helpers (intencionalmente restritos ao REPO_DIR)
export async function writeFileSafe(relPath, content, { createDirs = true, mode } = {}) {
  const abs = path.resolve(REPO_DIR, relPath);
  // mantemos file helpers restritos ao repo principal
  if (!abs.startsWith(REPO_DIR + path.sep) && abs !== REPO_DIR) {
    throw Object.assign(new Error('path-outside-repo'), { code: 'PATH_OUTSIDE_REPO', abs });
  }
  if (createDirs) await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, { encoding: 'utf8', mode });
  return abs;
}

export async function readFileSafe(relPath, encoding = 'utf8') {
  const abs = path.resolve(REPO_DIR, relPath);
  if (!abs.startsWith(REPO_DIR + path.sep) && abs !== REPO_DIR) {
    throw Object.assign(new Error('path-outside-repo'), { code: 'PATH_OUTSIDE_REPO', abs });
  }
  return fs.readFile(abs, encoding);
}

export async function pathExists(relPath) {
  const abs = path.resolve(REPO_DIR, relPath);
  if (!abs.startsWith(REPO_DIR + path.sep) && abs !== REPO_DIR) return false;
  try { await fs.access(abs); return true; } catch { return false; }
}

// Pequeno util para comandos seguros padrão
export const DEFAULT_ALLOW_SNIPPETS = [
  'git ', 'npm ', 'pnpm ', 'yarn ', 'node ',
  'ls', 'cat ', 'echo ', 'find ', 'sed ', 'awk ', 'grep ', 'mv ', 'cp ', 'mkdir ', 'rmdir '
];
