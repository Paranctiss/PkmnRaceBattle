import {defineConfig} from '@playwright/test';
import * as os from 'node:os';
import * as path from 'node:path';

// Tests de bout en bout : vrai navigateur (Chrome installé) + vraie API + base MongoDB de test locale.
// L'API est lancée sur le port 5000 (port codé en dur dans le client et dans Program.cs) avec une base dédiée :
// jamais celle d'appsettings.json, qui peut pointer sur la production.
// Le port 5000 doit être libre : si une autre API tourne déjà, Playwright s'arrête avant le moindre test.
export const TEST_MONGO_URL = process.env['E2E_MONGO_URL'] ?? 'mongodb://localhost:27017';
export const TEST_DB_NAME = 'PkmnRaceBattle_Test';

const apiProject = path.resolve(__dirname, '..', 'PkmnRaceBattle.API', 'PkmnRaceBattle.API');
// Compilation dans un dossier temporaire : n'entre pas en conflit avec bin/ (verrouillé quand l'API tourne dans l'IDE)
const apiBuild = path.join(os.tmpdir(), 'pkmn-race-battle-e2e-api');

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  expect: {timeout: 15_000},
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', {open: 'never', outputFolder: 'e2e-report'}]],
  globalSetup: './e2e/support/global-setup.ts',
  use: {
    baseURL: 'http://localhost:4200',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `dotnet run --project "${apiProject}" --no-launch-profile --artifacts-path "${apiBuild}"`,
      url: 'http://localhost:5000/Pokemon/1',
      reuseExistingServer: false,
      timeout: 240_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        MongoSettings__ConnectionString: TEST_MONGO_URL,
        MongoSettings__DatabaseName: TEST_DB_NAME,
      },
    },
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 240_000,
    },
  ],
});
