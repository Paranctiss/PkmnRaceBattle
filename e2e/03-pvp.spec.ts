import {Page} from '@playwright/test';
import {createGame, dialog, expect, forceTimerMinutes, joinGame, moveButtons, newPlayer, startGame, test} from './support/game';

// Fin du minuteur -> tournoi -> combat PvP entre les deux joueurs
test.describe('Combat PvP', () => {
  test.setTimeout(6 * 60_000);

  async function waitCanAct(page: Page) {
    await expect(moveButtons(page).first()).toBeEnabled({timeout: 60_000});
  }

  test('tournoi : attente du tour de l’adversaire puis résolution, jusqu’au vainqueur', async ({browser}) => {
    const host = await newPlayer(browser);
    const guest = await newPlayer(browser);
    await forceTimerMinutes(host, 1);

    const code = await createGame(host, 'Red', 'Salamèche');
    await joinGame(guest, 'Blue', 'Carapuce', code);
    await expect(host.locator('app-trainer-card')).toHaveCount(2);
    await startGame(host, true);

    // Fin de la course après 1 minute
    for (const page of [host, guest]) await expect(page.locator('.timer')).toBeVisible({timeout: 20_000});
    for (const page of [host, guest]) await expect(page.getByText('Temps écoulé !')).toBeVisible({timeout: 120_000});

    await host.getByRole('button', {name: /Créer le tournoi/}).click();
    for (const page of [host, guest]) {
      await expect(page.locator('app-bracket .duelist__name', {hasText: 'Red'})).toBeVisible();
      await expect(page.locator('app-bracket .duelist__name', {hasText: 'Blue'})).toBeVisible();
    }
    await expect(guest.locator('.bracket__wait')).toBeVisible();
    await host.getByRole('button', {name: /Lancer le tournoi/}).click();

    for (const page of [host, guest]) await expect(page.locator('app-battle-field')).toBeVisible({timeout: 20_000});
    await expect(host.locator('.hud--foe .hud__name')).toHaveText('Carapuce');
    await expect(guest.locator('.hud--foe .hud__name')).toHaveText('Salamèche');

    let finished = false;
    for (let turn = 0; turn < 40 && !finished; turn++) {
      await waitCanAct(host);
      await waitCanAct(guest);

      // Le premier à choisir attend l'adversaire
      await moveButtons(host).first().click();
      await expect(dialog(host)).toHaveText('En attente de l’adversaire…');
      await expect(moveButtons(host)).toHaveCount(0);
      await expect(dialog(guest)).not.toHaveText('En attente de l’adversaire…');

      await moveButtons(guest).first().click();
      await expect(dialog(host)).not.toHaveText('En attente de l’adversaire…', {timeout: 30_000});

      const outcome = await Promise.race([
        host.getByText(/qualifié|éliminé/).first().waitFor({timeout: 30_000}).then(() => 'fin'),
        expect(moveButtons(host).first()).toBeEnabled({timeout: 30_000}).then(() => 'suite'),
      ]).catch(() => 'suite');
      finished = outcome === 'fin';
    }

    expect(finished).toBeTruthy();
    const hostLog = await host.locator('.log li').allTextContents().catch(() => []);
    const hostWon = (await host.getByText(/qualifié/).count()) > 0 || hostLog.some(l => l.includes('qualifié'));
    const winner = hostWon ? host : guest;
    const loser = hostWon ? guest : host;
    await expect(winner.getByText(/qualifié/).first()).toBeVisible({timeout: 15_000});
    await expect(loser.getByText(/éliminé|plus de pokémon en forme/).first()).toBeVisible({timeout: 15_000});
  });
});
