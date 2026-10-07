import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LearnMoveComponent} from './learn-move.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {makeMove, makePlayer, makePokemon} from '../../../../../testing/test-data';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PokemonTeamModel} from '../../../../shared/models/player.model';

describe('LearnMoveComponent (nouvelle capacité)', () => {
  let fixture: ComponentFixture<LearnMoveComponent>;
  let component: LearnMoveComponent;
  let fake: FakeSignalRService;
  let hub: HubService;
  let four: PokemonTeamModel;

  const flammeche = {id: 52, nameFr: 'Flammèche', type: 'fire', pp: 25, power: 40, accuracy: 100,
    damageType: 'special', flavorText: 'Une petite flamme qui peut brûler la cible.'};

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [LearnMoveComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = 'player-1';
    four = makePokemon({id: 'MINE', nameFr: 'Salamèche', moves: [
      makeMove({id: 1, nameFr: 'Griffe'}), makeMove({id: 2, nameFr: 'Rugissement', damageType: 'status', power: 0}),
      makeMove({id: 3, nameFr: 'Brouillard'}), makeMove({id: 4, nameFr: 'Charge', flavorText: 'Charge la cible.'}),
    ]});
    hub.Player = makePlayer({team: [four]});
    fixture = TestBed.createComponent(LearnMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const levelUp = (moves: any[] = [flammeche]) => {
    fake.connection.emit('pokemonLevelUp', 'Salamèche monte niveau 9', four, moves);
    fixture.detectChanges();
  };

  it('rien à afficher pour une montée de niveau sans nouvelle capacité', () => {
    levelUp([]);
    expect(el().querySelector('app-game-modal')).toBeNull();
    expect(hub.learningMove).toBeFalse();
  });

  it('choix de la capacité à oublier : le joueur ne peut plus agir en attendant', () => {
    levelUp();
    expect(el().querySelector('app-game-modal')?.textContent).toContain('veut apprendre Flammèche');
    expect(hub.learningMove).toBeTrue();
    expect(hub.pending).toBeTrue();

    (el().querySelectorAll('.learn-move')[2] as HTMLButtonElement).click();
    expect(fake.connection.lastInvocation('LearnMove')?.args).toEqual([3, 52, 'MINE', 'player-1']);

    fake.connection.emit('moveLearned', hub.Player);
    fixture.detectChanges();
    expect(el().querySelector('app-game-modal')).toBeNull();
    expect(hub.learningMove).toBeFalse();
    expect(hub.pending).toBeFalse();
  });

  it('fiche de la nouvelle capacité affichée par défaut', () => {
    levelUp();
    const card = el().querySelector('.move-card')!.textContent!;
    expect(card).toContain('Nouvelle capacité');
    expect(card).toContain('Flammèche');
    expect(card).toContain('Une petite flamme');
    expect(card).toContain('Spéciale');
    expect(card).toContain('40');
    expect(card).toContain('100 %');
    expect(card).toContain('25/25');
  });

  it('PP restants / PP max des capacités connues', () => {
    four.moves[0] = {...four.moves[0], pp: 7, maxPp: 35};
    levelUp();
    expect(el().querySelectorAll('.learn-move')[0].textContent).toContain('PP 7/35');
  });

  it('fiche d’une capacité connue au survol, retour à la nouvelle en sortant', () => {
    levelUp();
    const charge = el().querySelectorAll('.learn-move')[3] as HTMLButtonElement;
    charge.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el().querySelector('.move-card__title')?.textContent).toBe('Charge');
    expect(el().querySelector('.move-card')?.textContent).toContain('Charge la cible.');
    expect(el().querySelector('.move-card__badge')?.textContent).toContain('oublier');

    charge.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(el().querySelector('.move-card__title')?.textContent).toBe('Flammèche');
  });

  it('le joueur peut refuser la nouvelle capacité', () => {
    levelUp();
    (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Ne pas apprendre')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('app-game-modal')).toBeNull();
    expect(fake.connection.invoked('LearnMove').length).toBe(0);
    expect(hub.learningMove).toBeFalse();
  });

  it('plusieurs capacités en attente : proposées l’une après l’autre', () => {
    levelUp([flammeche, {...flammeche, id: 99, nameFr: 'Groz’Yeux'}]);
    (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Ne pas apprendre')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('app-game-modal')?.textContent).toContain('veut apprendre Groz’Yeux');
    expect(hub.learningMove).toBeTrue();
  });
});
