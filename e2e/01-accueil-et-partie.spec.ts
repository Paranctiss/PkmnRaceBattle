import {createGame, expect, joinGame, newPlayer, startGame, test} from './support/game';

test.describe('Page d’accueil', () => {
  test('affiche le jeu et ses deux entrées', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('RaceBattle');
    await expect(page.getByRole('button', {name: /Créer une partie/})).toBeVisible();
    await expect(page.getByRole('button', {name: /Rejoindre une partie/})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-env', 'Plaine');
  });

  test('les trois starters sont chargés depuis l’API', async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: /Créer une partie/}).click();
    await expect(page.locator('.starter__name')).toHaveText(['Bulbizarre', 'Salamèche', 'Carapuce']);
    await expect(page.getByRole('button', {name: /Créer la partie/})).toBeDisabled();
  });
});

test.describe('Créer et rejoindre une partie', () => {
  test('l’hôte crée, un invité rejoint, l’hôte lance : chacun a le starter choisi', async ({browser}) => {
    const host = await newPlayer(browser);
    const guest = await newPlayer(browser);

    const code = await createGame(host, 'Sacha', 'Salamèche');
    await joinGame(guest, 'Pierre', 'Carapuce', code);

    // Salle d'attente : les deux dresseurs et leur starter
    for (const page of [host, guest]) {
      await expect(page.locator('app-trainer-card')).toHaveCount(2);
      await expect(page.locator('.room-code__value')).toHaveText(code);
    }
    await expect(host.locator('app-trainer-card', {hasText: 'Sacha'})).toContainText('avec Salamèche');
    await expect(host.locator('app-trainer-card', {hasText: 'Pierre'})).toContainText('avec Carapuce');
    await expect(host.locator('app-trainer-card', {hasText: 'Sacha'}).locator('.tag--host')).toBeVisible();
    await expect(guest.getByText(/En attente du lancement/)).toBeVisible();
    await expect(guest.getByRole('button', {name: /Lancer la partie/})).toHaveCount(0);

    await startGame(host, false);

    for (const [page, starter] of [[host, 'Salamèche'], [guest, 'Carapuce']] as const) {
      await expect(page).toHaveURL(/\/game$/);
      const team = page.locator('app-my-team');
      await expect(team.locator('.slot__name')).toHaveText([starter]);
      // Les deux joueurs commencent avec un starter de niveau 5
      await expect(team.locator('.slot__level')).toHaveText(['N.5']);
    }
  });

  test('code de salle inconnu : le joueur reste sur le choix du starter', async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: /Rejoindre une partie/}).click();
    await expect(page.locator('app-starter-card')).toHaveCount(3);
    await page.locator('app-starter-card', {hasText: 'Bulbizarre'}).click();
    await page.getByPlaceholder('Ton pseudo').fill('Ondine');
    await page.getByPlaceholder('A1B2C3').fill('ZZZZZZ');
    await page.getByRole('button', {name: /Rejoindre la partie/}).click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/starter/);
  });
});
