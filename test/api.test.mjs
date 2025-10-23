import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../server.mjs';

const token = process.env.AGENT_TOKEN || 'token-incorreto';
console.log('[debug] usando token:', token);

const auth = (req) => req.set('Authorization', `Bearer ${token}`);

// Healthcheck

test('GET /health deve retornar 200 com status ok', async () => {
  const res = await request(app).get('/health').expect(200);
  assert.strictEqual(res.body.status, 'ok');
});

test('GET rota inexistente retorna 404', async () => {
 await request(app).get('/rota-inexistente').expect(404);
});

// Execução protegida

test('POST /run-async com token válido executa comando', async () => {
 const res = await auth(request(app).post('/run-async')).send({ task: 'echo ok', workspace: 'repo' });
 console.log('[res válido]', res.statusCode, res.body);
 assert.strictEqual(res.statusCode, 200);
 assert.ok(res.body && res.body.taskId);
});

test('POST /run-async com token inválido falha com 401', async () => {
 const res = await request(app).post('/run-async')
 .set('Authorization', 'Bearer token-errado')
 .send({ task: 'echo fail', workspace: 'repo' });
 console.log('[res inválido]', res.statusCode, res.body);
 assert.strictEqual(res.statusCode, 401);
});

// Tarefa inexistente

test('GET /tasks/naoexiste/status retorna 404 ou erro apropriado', async () => {
 await auth(request(app).get('/tasks/naoexiste/status')).expect(404);
});

