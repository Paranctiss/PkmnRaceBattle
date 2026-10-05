import {TestBed} from '@angular/core/testing';
import {AilmentBadgesComponent} from './ailment-badges/ailment-badges.component';
import {PokemonSlotComponent} from './pokemon-slot/pokemon-slot.component';
import {GameModalComponent} from './game-modal/game-modal.component';
import {EnvironmentBackgroundComponent} from './environment-background/environment-background.component';
import {BattleHudComponent} from '../../features/game/components/battle-field/battle-hud/battle-hud.component';
import {EnvironmentService} from '../../core/services/Environment/environment.service';
import {makePokemon} from '../../../testing/test-data';
import {PokemonTeamModel} from '../models/player.model';

describe('AilmentBadgesComponent (badges de statut)', () => {
  function badges(overrides: Partial<PokemonTeamModel>) {
    TestBed.configureTestingModule({imports: [AilmentBadgesComponent]});
    const fixture = TestBed.createComponent(AilmentBadgesComponent);
    fixture.componentRef.setInput('pokemon', makePokemon(overrides));
    fixture.detectChanges();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.status')).map(s => s.textContent);
  }

  it('aucun badge sans statut', () => expect(badges({})).toEqual([]));
  it('paralysie', () => expect(badges({isParalyzed: true})).toEqual(['PAR']));
  it('brûlure', () => expect(badges({isBurning: true})).toEqual(['BRU']));
  it('poison (le serveur envoie 1 ou 2)', () => expect(badges({isPoisoned: 2 as unknown as boolean})).toEqual(['PSN']));
  it('gel', () => expect(badges({isFrozen: true})).toEqual(['GEL']));
  it('sommeil', () => expect(badges({isSleeping: 3})).toEqual(['DOR']));
});

describe('PokemonSlotComponent (emplacement d’équipe)', () => {
  function render(overrides: Partial<PokemonTeamModel>, inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({imports: [PokemonSlotComponent]});
    const fixture = TestBed.createComponent(PokemonSlotComponent);
    fixture.componentRef.setInput('pokemon', makePokemon(overrides));
    Object.entries(inputs).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('nom, niveau et PV', () => {
    const el = render({nameFr: 'Reptincel', level: 16, currHp: 30, baseHp: 50});
    expect(el.querySelector('.slot__name')?.textContent).toBe('Reptincel');
    expect(el.querySelector('.slot__level')?.textContent).toBe('N.16');
    expect(el.querySelector('.hp__value')?.textContent?.replace(/\s/g, '')).toBe('30/50');
  });

  it('Pokémon K.O.', () => {
    const el = render({currHp: 0, isParalyzed: true});
    expect(el.querySelector('.status--ko')).not.toBeNull();
    expect(el.querySelector('app-ailment-badges')).toBeNull();
    expect(el.querySelector('.slot')?.classList).toContain('slot--fainted');
  });

  it('grisé et types', () => {
    const el = render({types: [{slot: 1, name: 'grass'}, {slot: 2, name: 'poison'}]}, {dimmed: true, showTypes: true});
    expect(el.querySelector('.slot')?.classList).toContain('slot--dimmed');
    expect(el.querySelectorAll('app-type-card').length).toBe(2);
  });
});

describe('BattleHudComponent (encadré du combattant)', () => {
  function render(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({imports: [BattleHudComponent]});
    const fixture = TestBed.createComponent(BattleHudComponent);
    Object.entries(inputs).forEach(([k, v]) => fixture.componentRef.setInput(k, v));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('joueur : PV chiffrés et barre d’EXP', () => {
    const pokemon = makePokemon({nameFr: 'Salamèche', level: 7});
    const el = render({battler: pokemon, level: 7, side: 'ally', expPokemon: pokemon});
    expect(el.querySelector('.hud__name')?.textContent).toBe('Salamèche');
    expect(el.querySelector('.hud__level')?.textContent).toBe('N.7');
    expect(el.querySelector('app-exp-bar')).not.toBeNull();
    expect(el.querySelector('.hp__value')).not.toBeNull();
  });

  it('adversaire sauvage : ni PV chiffrés ni EXP', () => {
    const el = render({battler: makePokemon(), level: 3, side: 'foe'});
    expect(el.querySelector('app-exp-bar')).toBeNull();
    expect(el.querySelector('.hp__value')).toBeNull();
    expect(el.querySelector('.hud__balls')).toBeNull();
  });
});

describe('GameModalComponent (fenêtre)', () => {
  function render(closable: boolean) {
    TestBed.configureTestingModule({imports: [GameModalComponent]});
    const fixture = TestBed.createComponent(GameModalComponent);
    fixture.componentRef.setInput('title', 'Sac');
    fixture.componentRef.setInput('closable', closable);
    fixture.detectChanges();
    return fixture;
  }

  it('Échap ferme une fenêtre fermable', () => {
    const fixture = render(true);
    const spy = spyOn(fixture.componentInstance.closed, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(spy).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Sac');
  });

  it('Échap ne ferme pas une fenêtre obligatoire', () => {
    const fixture = render(false);
    const spy = spyOn(fixture.componentInstance.closed, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('EnvironmentBackgroundComponent (fond de la zone)', () => {
  it('le décor suit l’environnement courant', () => {
    TestBed.configureTestingModule({imports: [EnvironmentBackgroundComponent]});
    const env = TestBed.inject(EnvironmentService);
    const fixture = TestBed.createComponent(EnvironmentBackgroundComponent);
    fixture.detectChanges();
    const world = fixture.nativeElement.querySelector('.world') as HTMLElement;
    expect(world.dataset['env']).toBe('Plaine');

    env.setEnvironment('Volcan');
    fixture.detectChanges();
    expect(world.dataset['env']).toBe('Volcan');
    expect(document.documentElement.dataset['env']).toBe('Volcan');
  });
});
