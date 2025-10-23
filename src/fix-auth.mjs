import fs from 'fs';

let s = fs.readFileSync('server.mjs','utf8');

// 1) Remove BEARER estático (vamos ler do env por request)
s = s.replace(/const\s+BEARER\s*=\s*process\.env\.AGENT_TOKEN[^\n]*;\s*/g,
              '// const BEARER (removido); agora lemos do env por request\n');

// 2) Substitui a função auth inteira por uma versão robusta
const newAuth =
`function auth(req, res, next) {
  const want = (process.env.AGENT_TOKEN || '').trim();
  if (!want) return res.status(401).json({ error: 'no token configured' });

  const a = String(req.headers.authorization || '').trim();
  const x = String(req.headers['x-agent-token'] || '').trim();

  let got = '';
  if (a.toLowerCase().startsWith('bearer ')) got = a.slice(7).trim();
  else if (x) got = x;

  if (got !== want) {
    return res.status(401).json({
      error: 'unauthorized',
      gotLen: got.length, wantLen: want.length,
      gotPrefix: got.slice(0,12), wantPrefix: want.slice(0,12)
    });
  }
  next();
}
`;

if (s.match(/function\s+auth\s*\([^)]*\)\s*\{[\s\S]*?\n\}/)) {
  s = s.replace(/function\s+auth\s*\([^)]*\)\s*\{[\s\S]*?\n\}/, newAuth);
} else {
  console.error('!! não achei function auth() para substituir');
  process.exit(2);
}

// 3) (Opcional) Adiciona /__echo-auth antes do app.listen, se ainda não existir
if (!/app\.get\('\/__echo-auth'/.test(s)) {
  const idx = s.lastIndexOf('app.listen(');
  if (idx !== -1) {
    const insert =
`\n// --- DEBUG: echo dos headers (remova depois) ---
app.get('/__echo-auth', (req, res) => {
  const want = (process.env.AGENT_TOKEN || '').trim();
  res.json({
    wantLen: want.length,
    wantPrefix: want.slice(0,12),
    auth: req.headers.authorization || null,
    xAgentToken: req.headers['x-agent-token'] || null
  });
});
// --- END DEBUG ---
`;
    s = s.slice(0, idx) + insert + s.slice(idx);
  }
}

fs.writeFileSync('server.mjs', s);
console.log('auth atualizado ✅');
