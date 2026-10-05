import {Browser, expect, Page, test as base} from '@playwright/test';

export type Starter = 'Bulbizarre' | 'Salamèche' | 'Carapuce';

// Garde-fou : avant chaque fichier de tests, l'API doit répondre avec les données de la base de test fraîchement créée
export const test = base.extend<{}, {testDatabaseGuard: void}>({
  testDatabaseGuard: [async ({}, use) => {
    const response = await fetch('http://localhost:5000/Pokemon/1');
    const pokemon = await response.json();
    if (pokemon?._id !== process.env['E2E_MARKER_ID']) {
      throw new Error('L’API sur le port 5000 n’utilise pas la base de test : arrêt des tests pour ne rien écrire ailleurs.');
    }
    await use();
  }, {scope: 'worker', auto: true}],
});

export {expect};

export async function newPlayer(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return context.newPage();
}

async function pickStarterAndName(page: Page, starter: Starter, name: string) {
  await expect(page.locator('app-starter-card')).toHaveCount(3);
  await page.locator('app-starter-card', {hasText: starter}).click();
  await page.getByPlaceholder('Ton pseudo').fill(name);
}

// L'hôte crée une partie et renvoie le code de la salle
export async function createGame(page: Page, name: string, starter: Starter): Promise<string> {
  await page.goto('/');
  await page.getByRole('button', {name: /Créer une partie/}).click();
  await pickStarterAndName(page, starter, name);
  await page.getByRole('button', {name: /Créer la partie/}).click();
  await expect(page).toHaveURL(/\/room$/);
  const code = page.locator('.room-code__value');
  await expect(code).toHaveText(/^[0-9A-F]{6}$/);
  return (await code.textContent())!.trim();
}

export async function joinGame(page: Page, name: string, starter: Starter, code: string) {
  await page.goto('/');
  await page.getByRole('button', {name: /Rejoindre une partie/}).click();
  await pickStarterAndName(page, starter, name);
  await page.getByPlaceholder('A1B2C3').fill(code.toLowerCase());
  await page.getByRole('button', {name: /Rejoindre la partie/}).click();
  await expect(page).toHaveURL(/\/room$/);
}

export async function startGame(host: Page, withTimer: boolean) {
  const timer = host.locator('.switch input[type=checkbox]');
  if ((await timer.isChecked()) !== withTimer) await host.locator('.switch').click();
  await host.getByRole('button', {name: /Lancer la partie/}).click();
}

// Réécrit à la volée la durée du minuteur envoyée par StartGame (protocole JSON de SignalR, messages terminés par \x1e)
export async function forceTimerMinutes(page: Page, minutes: number) {
  await page.routeWebSocket(/gameHub/, ws => {
    const server = ws.connectToServer();
    ws.onMessage(message => {
      if (typeof message === 'string' && message.includes('"target":"StartGame"')) {
        message = message.split('\x1e').filter(Boolean).map(frame => {
          const json = JSON.parse(frame);
          if (json.target === 'StartGame') json.arguments[2] = minutes;
          return JSON.stringify(json);
        }).join('\x1e') + '\x1e';
      }
      server.send(message);
    });
    server.onMessage(message => ws.send(message));
  });
}

export const dialog = (page: Page) => page.locator('.dialog__text');
export const moveButtons = (page: Page) => page.locator('app-pokemon-moves .move');
