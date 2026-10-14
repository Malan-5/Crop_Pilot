const { spawn } = require('node:child_process');
const path = require('node:path');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Start CropPilot with npm run dev.');
const processes = ['backend', 'frontend'].map((folder) => spawn(process.execPath, [npmCli, 'run', 'dev'], {
  cwd: path.resolve(__dirname, '..', folder), stdio: 'inherit', windowsHide: true,
}));
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (process.platform === 'win32' && child.pid) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGTERM');
  }
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const child of processes) {
  child.on('error', (error) => { console.error(error.message); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code || 0); });
}
