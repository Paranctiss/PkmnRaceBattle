import {Page} from '@playwright/test';
import {createGame, dialog, expect, moveButtons, startGame, test} from './support/game';

// Partie solo : premier combat sauvage sur la Plaine
async function soloGame(page: Page) {
  await createGame(page, 'Sacha', 'Salamèche');
  await startGame(page, false);
  await expect(page).toHaveURL(/\/game$/);
  await expect(page.locator('app-battle-field')).toBeVisible({timeout: 30_000});
}

test.describe('Combat sauvage', () => {
  test('première map : Plaine, décor et progression', async ({page}) => {
    await soloGame(page);
    await expect(page.locator('.route-plate__name')).toHaveText('Plaine');
    await expect(page.locator('.route-plate__step')).toHaveText('Combat sauvage 1 / 5');
    await expect(page.locator('html')).toHaveAttribute('data-env', 'Plaine');
    await expect(page.locator('.wallet').first()).toContainText('3000');
  });

  test('le joueur voit son Pokémon, l’adversaire et ses capacités', async ({page}) => {
    await soloGame(page);
    await expect(page.locator('.hud--ally .hud__name')).toHaveText('Salamèche');
    await expect(page.locator('.hud--foe .hud__name')).not.toBeEmpty();
    await expect(dialog(page)).toHaveText('Que doit faire Salamèche ?');
    await expect(moveButtons(page).first()).toBeEnabled();
  });

  test('attaquer : message, barre de vie adverse, puis nouveau tour ou nouveau combat', async ({page}) => {
    await soloGame(page);
    const foeName = (await page.locator('.hud--foe .hud__name').textContent())!.trim();
    await moveButtons(page).first().click();

    await expect(page.locator('.dialog__text')).toContainText(/lance|rate|michou|paralysé|gelé/, {timeout: 10_000});
    // Le tour se termine : soit le joueur peut rejouer (PV adverses entamés ou attaque ratée), soit le sauvage est K.O.
    // et le combat suivant commence (progression 2 / 5)
    await expect(dialog(page)).toHaveText('Que doit faire Salamèche ?', {timeout: 30_000});
    const width = await page.locator('.hud--foe .hp__fill').evaluate(e => parseFloat((e as HTMLElement).style.width));
    const step = await page.locator('.route-plate__step').textContent();
    const journal = page.getByRole('button', {name: /Journal/});
    await journal.click();
    const log = (await page.locator('.log').textContent()) ?? '';
    const noDamage = /rate son attaque|aucun effet|michou|paralysé|gelé|rompiche|confusion/.test(log);
    expect(width < 100 || step === 'Combat sauvage 2 / 5' || noDamage, `PV adverses ${width} %, étape « ${step} », journal : ${log}`).toBeTruthy();

    await expect(page.locator('.log li').first()).not.toHaveText('Rien à signaler pour l’instant.');
    await expect(page.locator('.log')).toContainText('Salamèche lance');
    expect(foeName.length).toBeGreaterThan(0);
  });

  test('sac : poches et objets de départ', async ({page}) => {
    await soloGame(page);
    await page.locator('.action', {hasText: 'Sac'}).click();
    const bag = page.locator('app-bag');
    await expect(bag.locator('.bag__tab')).toHaveCount(4);
    await expect(bag.locator('app-bag-item', {hasText: 'Potion'}).first()).toContainText('10');
    await bag.locator('.bag__tab', {hasText: 'Poké Balls'}).click();
    await expect(bag.locator('app-bag-item', {hasText: 'Pokeball'})).toContainText('15');
  });

  test('carte : position actuelle sur la Plaine et étapes suivantes', async ({page}) => {
    await soloGame(page);
    await page.locator('.action', {hasText: 'Carte'}).click();
    const map = page.locator('app-map');
    await expect(map.locator('.place--current .place__label')).toHaveText('Plaine');
    await expect(map.locator('.place--upcoming').first()).toBeVisible();
    expect(await map.locator('.place').count()).toBeGreaterThan(10);
  });

  test('changer de Pokémon : l’équipe s’affiche', async ({page}) => {
    await soloGame(page);
    await page.locator('.action', {hasText: 'Pokémon'}).click();
    await expect(page.locator('app-game-modal .party-pick')).toHaveCount(1);
    await expect(page.locator('app-game-modal')).toContainText('Quel Pokémon envoyer au combat ?');
  });

  test('capturer : la Poké Ball part et le nombre de Poké Balls baisse', async ({page}) => {
    await soloGame(page);
    await page.locator('.action', {hasText: 'Sac'}).click();
    await page.locator('app-bag .bag__tab', {hasText: 'Poké Balls'}).click();
    await page.locator('app-bag .bag__cell', {hasText: 'Pokeball'}).click();
    await expect(page.locator('.ballImg')).toBeVisible({timeout: 10_000});

    await expect(async () => {
      await page.locator('.action', {hasText: 'Sac'}).click({timeout: 2000});
      await page.locator('app-bag .bag__tab', {hasText: 'Poké Balls'}).click();
      await expect(page.locator('app-bag app-bag-item', {hasText: 'Pokeball'})).toContainText('14');
    }).toPass({timeout: 40_000});
  });
});
