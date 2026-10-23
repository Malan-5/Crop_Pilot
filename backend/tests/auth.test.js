const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const net = require('node:net');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Scan = require('../models/Scan');

let mongoProcess, mongoDirectory, server, base, token, account;
const password = 'CollegeProject!2026';
process.env.JWT_SECRET = 'isolated-test-secret-never-used-by-the-app';

before(async () => {
  const listener = net.createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  mongoDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'croppilot-auth-test-'));
  mongoProcess = spawn(process.env.MONGOD_BINARY || 'mongod', [
    '--dbpath', mongoDirectory, '--bind_ip', '127.0.0.1', '--port', String(port),
    '--logpath', path.join(mongoDirectory, 'mongo.log'), '--quiet',
  ], { stdio: 'ignore', windowsHide: true });
  let startupError;
  mongoProcess.on('error', (error) => { startupError = error; });
  for (let attempt = 0; attempt < 50; attempt++) {
    if (startupError) throw new Error('Tests need mongod on PATH or MONGOD_BINARY. ' + startupError.message);
    if (mongoProcess.exitCode !== null) throw new Error('Isolated MongoDB failed to start.');
    try {
      await mongoose.connect('mongodb://127.0.0.1:' + port + '/croppilot_auth_test', { serverSelectionTimeoutMS: 500 });
      break;
    } catch { if (attempt === 49) throw new Error('Isolated MongoDB did not become ready.'); }
  }
  await User.init();
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/scan', require('../routes/scan'));
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
}, { timeout: 35000 });

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongoProcess && mongoProcess.exitCode === null && mongoProcess.pid) {
    const stopped = once(mongoProcess, 'exit');
    mongoProcess.kill();
    await stopped;
  }
  if (mongoDirectory) {
    const target = path.resolve(mongoDirectory);
    const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
    if (!target.startsWith(temporaryRoot) || !path.basename(target).startsWith('croppilot-auth-test-')) throw new Error('Invalid test cleanup path');
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});

async function request(route, body, bearer) {
  const response = await fetch(base + route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  return { status: response.status, data: text.startsWith('{') ? JSON.parse(text) : text };
}

test('registration needs only username/password and stores a bcrypt hash', async () => {
  const result = await request('/api/auth/register', { username: 'CollegeFarmer', password, confirmPassword: password });
  assert.equal(result.status, 201);
  assert.equal(result.data.user.password, undefined);
  account = await User.findOne({ usernameKey: 'collegefarmer' }).select('+password');
  assert.notEqual(account.password, password);
  assert.ok(await bcrypt.compare(password, account.password));
  assert.equal(account.phone, undefined);
  assert.equal(account.googleId, undefined);
});

test('case-insensitive duplicate usernames are rejected, including concurrent requests', async () => {
  assert.equal((await request('/api/auth/register', { username: 'collegefarmer', password })).status, 409);
  const results = await Promise.all([
    request('/api/auth/register', { username: 'RaceFarmer', password }),
    request('/api/auth/register', { username: 'racefarmer', password }),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
});

test('username login returns a verifiable token and private profile', async () => {
  const result = await request('/api/auth/login', { username: ' COLLEGEFARMER ', password });
  assert.equal(result.status, 200);
  token = result.data.token;
  assert.equal(jwt.verify(token, process.env.JWT_SECRET).id, String(account._id));
  const me = await request('/api/auth/me', undefined, token);
  assert.equal(me.status, 200);
  assert.equal(me.data.username, 'CollegeFarmer');
  assert.equal(me.data.password, undefined);
  assert.equal(me.data.phone, undefined);
});

test('wrong credentials and regex usernames fail; passwordless accounts cannot be claimed', async () => {
  for (const [username, value] of [['CollegeFarmer', 'wrong-password'], ['UnknownFarmer', password], ['.*', password]]) {
    assert.equal((await request('/api/auth/login', { username, password: value })).status, 401);
  }
  await User.create({ username: 'LegacyFarmer', phone: '+919876543210' });
  assert.equal((await request('/api/auth/login', { username: 'LegacyFarmer', password })).status, 401);
  assert.equal((await request('/api/auth/register', { username: 'LegacyFarmer', password })).status, 409);
});

test('existing password accounts work without a normalized username key', async () => {
  await User.create({ username: 'Existing Farmer', password: await bcrypt.hash(password, 12) });
  assert.equal((await request('/api/auth/login', { username: 'existing farmer', password })).status, 200);
});

test('phone and Google login routes and old identifiers are unavailable', async () => {
  assert.equal((await request('/api/auth/phone', { phone: '9876543210' })).status, 404);
  assert.equal((await request('/api/auth/google', { token: 'fake' })).status, 404);
  assert.equal((await request('/api/auth/login', { phone: '9876543210', password })).status, 400);
  assert.equal((await request('/api/auth/login', { identifier: 'CollegeFarmer', password })).status, 400);
});

test('registration validates username, password, input types and confirmation', async () => {
  for (const body of [
    { username: 'Bad user', password }, { username: 'ab', password },
    { username: 'ValidUser', password: 'short' }, { username: 'ValidUser', password: 'é'.repeat(40) },
    { username: 'ValidUser', password, confirmPassword: 'different' },
    { username: { $ne: null }, password }, { username: 'ValidUser', password: { $ne: null } },
  ]) assert.equal((await request('/api/auth/register', body)).status, 400);
});

test('protected routes reject bad sessions and accept lowercase bearer tokens', async () => {
  for (const bearer of [undefined, 'bad-token', jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: -1 })]) {
    assert.equal((await request('/api/auth/me', undefined, bearer)).status, 401);
    assert.equal((await request('/api/scan/history', undefined, bearer)).status, 401);
  }

  const lowercaseBearer = 'bearer ' + token;
  const profile = await fetch(base + '/api/auth/me', {
    method: 'GET',
    headers: { Authorization: lowercaseBearer },
  });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).username, 'CollegeFarmer');

  await Scan.create([
    { userId: account._id, cropName: 'Tomato', diseaseDetected: 'Healthy' },
    { userId: new mongoose.Types.ObjectId(), cropName: 'Another user crop' },
  ]);
  const history = await request('/api/scan/history', undefined, token);
  assert.equal(history.status, 200);
  assert.equal(history.data.total, 1);
  assert.equal(history.data.scans[0].cropName, 'Tomato');
  assert.equal((await request('/api/scan/stats', undefined, token)).data.cropsScanned, 1);
});

test('the frontend development proxy supports registration, login and protected account requests', async () => {
  const frontendRoot = path.resolve(__dirname, '../../frontend');
  const viteEntry = require.resolve('vite', { paths: [frontendRoot] });
  const { createServer } = await import(pathToFileURL(viteEntry).href);
  const frontend = await createServer({
    root: frontendRoot,
    configFile: path.join(frontendRoot, 'vite.config.js'),
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0, proxy: { '/api': { target: base, changeOrigin: true } } },
  });
  try {
    await frontend.listen();
    const origin = 'http://127.0.0.1:' + frontend.httpServer.address().port;
    const credentials = { username: 'ProxyFarmer', password };
    const registration = await fetch(origin + '/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(credentials),
    });
    assert.equal(registration.status, 201);
    const login = await fetch(origin + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(credentials),
    });
    assert.equal(login.status, 200);
    const session = await login.json();
    const profile = await fetch(origin + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + session.token, Origin: origin },
    });
    assert.equal(profile.status, 200);
    assert.equal((await profile.json()).username, credentials.username);
  } finally {
    await frontend.close();
  }
});
