import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const COMPOSE_DIR = '../HRMS-Backend';
const DATABASE = 'hrms_e2e';

async function psql(sql) {
  await run('docker', [
    'exec', 'hrms-postgres',
    'psql', '-U', 'hrms', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', sql,
  ]);
}

console.log('e2e: bringing up docker (postgres, seq, mailpit)…');
await run('docker', ['compose', 'up', '-d', '--wait'], { cwd: COMPOSE_DIR });

console.log(`e2e: recreating ${DATABASE}…`);
await psql(`drop database if exists ${DATABASE} with (force)`);
await psql(`create database ${DATABASE}`);

console.log('e2e: clearing mailpit…');
await fetch('http://localhost:8025/api/v1/messages', { method: 'DELETE' }).catch(() => {
  console.warn('e2e: could not clear mailpit — continuing');
});

console.log('e2e: ready. The API will migrate and seed on startup.');
