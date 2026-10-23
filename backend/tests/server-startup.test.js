const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { once } = require('node:events');
const express = require('express');

function loadServer(connectDB) {
  const filename = path.join(__dirname, '../server.js');
  const realRequire = createRequire(filename);
  const serverModule = { exports: {} };
  const serverRequire = (name) => {
    if (name === './config/db') return connectDB;
    if (name === 'dotenv') return { config() {} };
    if (name.startsWith('./routes/')) return express.Router();
    return realRequire(name);
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    require: serverRequire,
    module: serverModule,
    console,
    process: { env: { JWT_SECRET: 'isolated-startup-test-secret', CLIENT_URL: 'https://frontend.example' } },
  }, { filename });
  return serverModule.exports;
}

async function serve(t, app) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}

test('serverless import exports immediately and shares database setup across requests', async (t) => {
  let attempts = 0;
  let release;
  const ready = new Promise((resolve) => { release = resolve; });
  const app = loadServer(() => { attempts++; return ready; });
  assert.equal(typeof app, 'function');
  assert.equal(attempts, 0);
  const origin = await serve(t, app);
  const requests = [fetch(origin), fetch(origin)];
  release();
  for (const response of await Promise.all(requests)) {
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'CropPilot API is running.');
  }
  assert.equal(attempts, 1);
});

test('database failure returns a CORS-enabled 503 and the next request retries', async (t) => {
  let attempts = 0;
  const app = loadServer(async () => {
    if (++attempts === 1) throw new Error('Simulated database unavailable');
  });
  const origin = await serve(t, app);
  const failed = await fetch(origin, { headers: { Origin: 'https://frontend.example' } });
  assert.equal(failed.status, 503);
  assert.equal(failed.headers.get('access-control-allow-origin'), 'https://frontend.example');
  assert.deepEqual(await failed.json(), { error: 'Account service temporarily unavailable. Please try again later.' });
  const retried = await fetch(origin);
  assert.equal(retried.status, 200);
  await retried.text();
  assert.equal(attempts, 2);
});
