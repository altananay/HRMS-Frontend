/**
 * Prepares the infrastructure the E2E suite runs against. Invoked by `npm run e2e` **before**
 * Playwright starts.
 *
 * The ordering is the whole reason this is a separate step rather than `globalSetup`: Playwright
 * launches `webServer` first and only then runs `globalSetup`. Dropping the database from
 * globalSetup therefore pulls it out from under an API that had already migrated and seeded it,
 * leaving the suite pointed at an empty schema — every request 500s and it looks like a broken
 * feature rather than a broken harness.
 *
 * Dropping rather than truncating: the API applies migrations on startup in Development, so a cold
 * drop gives every run an identical schema and seed for about two seconds, and the developer's own
 * `hrms` database is never touched.
 */
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
