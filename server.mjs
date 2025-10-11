import express from "express";
import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runShellSecure, getPolicy } from "./agent.mjs";

// ====== CONFIG ======
const PORT = Number(process.env.AGENT_PORT || process.env.PORT || 7777);
const REPO_DIR = process.env.REPO_DIR || process.cwd();
const TOKEN = (process.env.AGENT_TOKEN || "").trim();

// Caminho raiz do AGENTE (pasta onde está este arquivo)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_ROOT = __dirname;

// ====== APP ======
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

// ====== UTILS ======
const nowISO = () => new Date().toISOString();
const okJson = (res, obj = {}) => res.status(200).json(obj);

class LogList {
  constructor() { this._items = []; }
  push(s) { this._items.push(String(s)); }
  length() { return this._items.length; }
  sliceFrom(cursor) {
    const c = Number(cursor || 0);
    const items = this._items.slice(c);
    const nextCursor = this._items.length;
    return { items, nextCursor };
  }
}

const tasks = new Map(); // id -> { id, status, pid, startedAt, endedAt, exitCode, logs }

// ====== AUTH (Bearer ou X-Agent-Token) ======
function auth(req, res, next) {
  const want = TOKEN;
  if (!want) return res.status(500).json({ error: "missing-agent-token" });

  const a = req.headers.authorization || "";
  const x = req.headers["x-agent-token"];
  let got = "";
  if (a && typeof a === "string" && a.toLowerCase().startsWith("bearer ")) {
    got = a.slice(7).trim();
  } else if (typeof x === "string") {
    got = String(x).trim();
  }

  if (got !== want) {
    return res.status(401).json({
      error: "unauthorized",
      gotLen: got.length, wantLen: want.length,
      gotPrefix: got.slice(0, 12), wantPrefix: want.slice(0, 12)
    });
  }
  next();
}

// ====== WORKSPACES ======
function parseWorkspaces() {
  // 1) lidos do .env (lista branca)
  let list = [];
  try {
    const raw = process.env.AGENT_WORKSPACES;
    const arr = raw ? JSON.parse(raw) : [];
    list = arr
      .filter(x => x && x.key && x.path)
      .map(x => ({ key: String(x.key), path: path.resolve(String(x.path)) }));
  } catch {
    list = [];
  }

  // 2) garantir 'repo' (REPO_DIR)
  const repo = process.env.REPO_DIR ? path.resolve(process.env.REPO_DIR) : null;
  if (repo && !list.some(w => w.path === repo || w.key === "repo")) {
    list.push({ key: "repo", path: repo });
  }

  // 3) garantir 'agent' (pasta do servidor)
  if (!list.some(w => w.path === AGENT_ROOT || w.key === "agent")) {
    list.push({ key: "agent", path: AGENT_ROOT });
  }

  return list;
}

function getWorkspaceByKey(key) {
  const list = parseWorkspaces();
  if (!key) return list[0];                     // default = primeiro
  const found = list.find(w => w.key === key);
  return found || list[0];
}

function shQuote(p) {
  return `'${String(p).replace(/'/g, `'\\''`)}'`;
}

// ====== DEBUG (sem auth, pra diagnosticar token/headers) ======
app.get("/__debug-token", (req, res) => {
  const want = TOKEN;
  const a = req.headers.authorization || "";
  const got = (a && a.toLowerCase().startsWith("bearer ")) ? a.slice(7).trim() : "";
  return okJson(res, {
    len: want.length,
    prefix: want ? want.slice(0, 12) : "",
    gotPrefix: got ? got.slice(0, 12) : ""
  });
});

app.get("/__echo-auth", (req, res) => {
  okJson(res, {
    authorization: req.headers.authorization || null,
    xAgentToken: req.headers["x-agent-token"] || null
  });
});

// ====== HEALTH ======
app.get("/health", (req, res) => {
  okJson(res, { ok: true, ts: nowISO(), pid: process.pid, cwd: REPO_DIR });
});

// ====== LISTAR WORKSPACES ======
app.get("/workspaces", auth, (_req, res) => {
  okJson(res, { workspaces: parseWorkspaces() });
});

// ====== RUN (assíncrono, com workspace) ======
app.post("/run-async", auth, (req, res) => {
  const task = (req?.body?.task ?? "").toString();
  const wsKey = (req?.body?.workspace ?? "").toString().trim();
  const ws = getWorkspaceByKey(wsKey);
  const cmdPrefixed = `cd ${shQuote(ws.path)} && ${task}`;

  if (!task.trim()) return res.status(400).json({ error: "missing task" });

  const id = crypto.randomUUID();
  const logs = new LogList();
  const tag = `[task:${id.slice(0, 8)}]`;
  const push = (s) => logs.push(`${tag} ${s}`);

  const rec = {
    id,
    status: "running",
    pid: null,
    startedAt: nowISO(),
    endedAt: null,
    exitCode: null,
    logs
  };
  tasks.set(id, rec);

  (async () => {
    try {
      const pre = getPolicy?.() || {};
      push(`[policy] safeMode=${pre.SAFE_MODE} workspace.key=${ws.key} cwd=${ws.path}`);

      const r = await runShellSecure(cmdPrefixed, {
        onStdout: (c) => push(String(c).replace(/\r?\n$/, "")),
        onStderr: (c) => push(String(c).replace(/\r?\n$/, "")),
        cwdDir: ws.path,
      });

      rec.exitCode = r.exitCode ?? (r.ok ? 0 : 1);
      rec.status = "finished";
      rec.endedAt = nowISO();
      if (r.timedOut) push("[timeout] processo atingiu limite");
      push(`[exit ${rec.exitCode}]`);
    } catch (err) {
      push(`[error] ${err?.message || err}`);
      rec.status = "finished";
      rec.exitCode = 1;
      rec.endedAt = nowISO();
    }
  })();

  okJson(res, { taskId: id, status: rec.status, pid: rec.pid, startedAt: rec.startedAt });
});

// ====== STATUS ======
app.get("/tasks/:id/status", auth, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  okJson(res, {
    id: t.id, status: t.status, pid: t.pid,
    startedAt: t.startedAt, endedAt: t.endedAt, exitCode: t.exitCode
  });
});

// ====== LOGS ======
app.get("/tasks/:id/logs-json", auth, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  const cursor = Number(req.query.cursor || 0);
  const { items, nextCursor } = t.logs.sliceFrom(cursor);
  okJson(res, { items, nextCursor, status: t.status });
});

app.get("/tasks/:id/logs-plain", auth, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).end();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(`# status: ${t.status}\n`);
  const { items } = t.logs.sliceFrom(0);
  for (const line of items) res.write(String(line) + "\n");
  res.end();
});

// ====== SSE ======
app.get("/tasks/:id/sse", auth, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).end();

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.flushHeaders && res.flushHeaders();

  let cursor = Number(req.query.cursor || 0);
  const keepAlive = setInterval(() => { try { res.write(":\n\n") } catch {} }, 15000);

  const send = () => {
    const { items, nextCursor } = t.logs.sliceFrom(cursor);
    for (const line of items) {
      const b64 = Buffer.from(String(line), "utf8").toString("base64");
      res.write("event: log\n");
      res.write("data: " + JSON.stringify({ b64 }) + "\n\n");
    }
    cursor = nextCursor;
    if (t.status !== "running") {
      res.write("event: done\n");
      res.write("data: " + JSON.stringify({ status: t.status }) + "\n\n");
      clearInterval(keepAlive);
      try { res.end() } catch {}
      return true;
    }
    return false;
  };

  try { send() } catch {}
  const poll = setInterval(() => {
    if (res.writableEnded) { clearInterval(poll); clearInterval(keepAlive); return }
    try {
      const hasNew = (t && t.logs) ? (t.logs.length() > cursor) : false;
      if (hasNew || t.status !== "running") { if (send()) clearInterval(poll); }
    } catch {}
  }, 500);

  req.on("close", () => { clearInterval(poll); clearInterval(keepAlive); });
});

// ====== RECIPES (dispatcher) ======
const RECIPES = {
  // receita existente
  "organize": ({ args = {}, dry = false }) =>
    `node src/organize.mjs${dry ? " --dry" : ""}`,
};

app.get("/recipes/list", auth, (_req, res) => {
  okJson(res, { recipes: Object.keys(RECIPES).sort() });
});

app.post("/recipes/run", auth, (req, res) => {
  const name = String(req?.body?.name || "").trim();
  const args = (req?.body?.args && typeof req.body.args === "object") ? req.body.args : {};
  const dry  = !!(req?.body?.dry);
  const wsKey = (req?.body?.workspace ?? "").toString().trim();
  const ws = getWorkspaceByKey(wsKey);

  if (!name || !RECIPES[name]) {
    return res.status(400).json({ error: "recipe_not_found", available: Object.keys(RECIPES).sort() });
  }

  let recipeCmd;
  try { recipeCmd = RECIPES[name]({ args, dry }); }
  catch (e) { return res.status(400).json({ error: "invalid_args", message: e?.message || String(e) }); }

  const cmdPrefixed = `cd ${shQuote(ws.path)} && ${recipeCmd}`;

  const id = crypto.randomUUID();
  const logs = new LogList();
  const tag = `[task:${id.slice(0, 8)}]`;
  const push = (s) => logs.push(`${tag} ${s}`);

  const rec = { id, status: "running", pid: null, startedAt: nowISO(), endedAt: null, exitCode: null, logs };
  tasks.set(id, rec);

  (async () => {
    try {
      const pre = getPolicy?.() || {};
      push(`[policy] safeMode=${pre.SAFE_MODE} workspace.key=${ws.key} cwd=${ws.path}`);

      const r = await runShellSecure(cmdPrefixed, {
        onStdout: c => push(String(c).replace(/\r?\n$/, "")),
        onStderr: c => push(String(c).replace(/\r?\n$/, "")),
        cwdDir: ws.path,
      });

      rec.exitCode = r.exitCode ?? (r.ok ? 0 : 1);
      rec.status = "finished";
      rec.endedAt = nowISO();
      if (r.timedOut) push("[timeout] processo atingiu limite");
      push(`[exit ${rec.exitCode}]`);
    } catch (err) {
      push(`[error] ${err?.message || err}`);
      rec.status = "finished"; rec.exitCode = 1; rec.endedAt = nowISO();
    }
  })();

  okJson(res, { taskId: id, status: rec.status, startedAt: rec.startedAt });
});

// ====== OPENAPI ======
app.get("/openapi.json", (_req, res) => {
  const p = path.resolve(AGENT_ROOT, "openapi.json"); // << garante servir do projeto do agente
  if (fs.existsSync(p)) {
    res.type("application/json").send(fs.readFileSync(p, "utf8"));
  } else {
    res.status(404).json({ error: "openapi.json not found" });
  }
});

// ====== EXPORT & START ======
export default app;

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[agent] listening on http://localhost:${PORT}  (cwd=${REPO_DIR}) pid=${process.pid}`);
    if (!TOKEN) console.warn("[agent] WARNING: AGENT_TOKEN ausente!");
  });
}
