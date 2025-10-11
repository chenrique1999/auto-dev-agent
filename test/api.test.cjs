const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

test('GET /health returns 200 and body {status: "ok"} and Content-Type application/json', async (t) => {
  const res = await request(app)
    .get('/health')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(res.body, { status: 'ok' });
});

test('GET unknown route returns 404', async (t) => {
  await request(app)
    .get('/unknown-route-that-does-not-exist')
    .expect(404);
});
