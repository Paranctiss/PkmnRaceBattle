import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GameComponent} from './game.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../testing/fake-signalr';
import {makePlayer, makeTrainer, makeWildOpponent} from '../../../testing/test-data';
import {HubService} from '../../core/services/Hub/hub.service';
import {EnvironmentService} from '../../core/services/Environment/environment.service';
import {PathPoint} from '../../shared/models/player.model';

describe('GameComponent (écran de jeu)', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let fake: FakeSignalRService;
  let hub: HubService;
  let env: EnvironmentService;

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [GameComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    env = TestBed.inject(EnvironmentService);
    hub.userId = 'player-1';
    hub.gameCode = 'ABC123';
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const playerOn = (environmentName: string, x = 1, mapFightCount = 0) => {
    const player = makePlayer({mapFightCount});
    player.currentPath = {x, y: 1, environmentName};
    return player;
  };

  it('à l’ouverture : récupère le joueur et demande le premier tour', () => {
    expect(fake.connection.lastInvocation('GetPlayer')?.args).toEqual(['player-1']);
    expect(fake.connection.lastInvocation('GetNewTurn')?.args).toEqual(['player-1']);
    expect(el().querySelector('.turn__loading')).not.toBeNull();
  });

  it('combat sauvage : affiche le combat et le décor de la map', () => {
    const player = playerOn('Grotte');
    fake.connection.emit('GetPlayerResponse', player);
    fake.connection.emit('responseWildFight', makeWildOpponent(), player);
    fixture.detectChanges();

    expect(component.turnType).toBe('WildFight');
    expect(el().querySelector('app-wild-fight')).not.toBeNull();
    expect(env.environment()).toBe('Grotte');
    expect(hub.pending).toBeFalse();
  });

  it('premier combat : la position renvoyée par le serveur (première map) est prise en compte', () => {
    // GetPlayer est envoyé avant GetNewTurn : le joueur reçu est encore au point de départ
    fake.connection.emit('GetPlayerResponse', playerOn('Default', 0));
    const moved = playerOn('Plaine', 1);
    fake.connection.emit('responseWildFight', makeWildOpponent(), moved);
    fixture.detectChanges();

    expect(hub.Player.currentPath.environmentName).toBe('Plaine');
    expect(el().querySelector('.route-plate__name')?.textContent).toBe('Plaine');
  });

  it('combats suivants : le joueur renvoyé par le serveur remplace l’ancien', () => {
    fake.connection.emit('GetPlayerResponse', playerOn('Plaine'));
    fake.connection.emit('responseWildFight', makeWildOpponent(), playerOn('Plaine'));
    const next = playerOn('Foret', 2);
    fake.connection.emit('responseWildFight', makeWildOpponent(), next);
    expect(hub.Player).toBe(next);
    expect(env.environment()).toBe('Foret');
  });

  it('combat de dresseur : écran d’introduction puis combat', () => {
    fake.connection.emit('GetPlayerResponse', playerOn('Volcan', 1, 5));
    fake.connection.emit('responseTrainerFight', makeTrainer());
    fixture.detectChanges();
    expect(el().querySelector('app-trainer-fight')).not.toBeNull();
    expect(el().querySelector('app-wild-fight')).toBeNull();
    expect(el().textContent).toContain('Pierre veut se battre');

    (el().querySelector('app-trainer-fight button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('app-wild-fight')).not.toBeNull();
  });

  it('Centre Pokémon', () => {
    fake.connection.emit('GetPlayerResponse', playerOn('Centre', 4));
    fake.connection.emit('responsePokeCenter', playerOn('Centre', 4));
    fixture.detectChanges();
    expect(el().querySelector('app-poke-center')).not.toBeNull();
  });

  it('Boutique', () => {
    fake.connection.emit('GetPlayerResponse', playerOn('Shop', 4));
    fake.connection.emit('responsePokeShop');
    fixture.detectChanges();
    expect(el().querySelector('app-poke-shop')).not.toBeNull();
  });

  describe('choix de la prochaine destination', () => {
    const options: PathPoint[] = [{x: 3, y: 1, environmentName: 'Volcan'}, {x: 3, y: 2, environmentName: 'Eau'}];

    it('affiche les deux routes proposées par le serveur', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Foret', 2, 6));
      fake.connection.emit('chooseNextPath', options);
      fixture.detectChanges();
      const cards = el().querySelectorAll('.route-card__name');
      expect(Array.from(cards).map(c => c.textContent)).toEqual(['Volcan', 'Eau']);
      expect(hub.pending).toBeTrue();
    });

    it('envoie la route choisie et ferme le choix', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Foret', 2, 6));
      fake.connection.emit('chooseNextPath', options);
      fixture.detectChanges();
      (el().querySelectorAll('.route-card')[1] as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(fake.connection.lastInvocation('ChooseNextPath')?.args).toEqual(['player-1', 3, 2]);
      expect(el().querySelector('app-path-choice')).toBeNull();
    });
  });

  describe('bandeau de progression', () => {
    it('combat sauvage n sur 5', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Plaine', 1, 2));
      fixture.detectChanges();
      expect(el().querySelector('.route-plate__name')?.textContent).toBe('Plaine');
      expect(el().querySelector('.route-plate__step')?.textContent).toBe('Combat sauvage 3 / 5');
      expect(el().querySelectorAll('.pip.is-done').length).toBe(2);
    });

    it('combat de dresseur après 5 combats sauvages', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Plaine', 1, 5));
      fixture.detectChanges();
      expect(el().querySelector('.route-plate__step')?.textContent).toBe('Combat de dresseur');
      expect(el().querySelector('.pip--trainer')?.classList).toContain('is-current');
    });

    it('halte sur un Centre ou une Boutique', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Centre', 4));
      fixture.detectChanges();
      expect(el().querySelector('.route-plate__step')?.textContent).toBe('Halte');
      expect(el().querySelector('.pips')).toBeNull();
    });

    it('pas de bandeau avant la première map', () => {
      fake.connection.emit('GetPlayerResponse', playerOn('Default', 0));
      fixture.detectChanges();
      expect(el().querySelector('.route-plate')).toBeNull();
    });

    it('affiche l’argent du joueur', () => {
      fake.connection.emit('GetPlayerResponse', makePlayer({credits: 4321}));
      fixture.detectChanges();
      expect(el().querySelector('.wallet')?.textContent).toContain('4321');
    });
  });

  describe('fin de partie et tournoi', () => {
    it('fin du minuteur : écran de fin avec l’équipe', () => {
      fake.connection.emit('GetPlayerResponse', makePlayer({isHost: true}));
      fake.connection.emit('TimerEnded', 'ABC123');
      fixture.detectChanges();
      expect(el().querySelector('.ending')).not.toBeNull();
      expect(el().querySelectorAll('.ending__pokemon').length).toBe(1);
    });

    it('l’hôte crée le tournoi', () => {
      fake.connection.emit('GetPlayerResponse', makePlayer({isHost: true}));
      fake.connection.emit('TimerEnded', 'ABC123');
      fixture.detectChanges();
      (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Créer le tournoi')) as HTMLButtonElement).click();
      expect(fake.connection.lastInvocation('BuildTournament')?.args).toEqual(['ABC123']);
    });

    it('un invité attend l’hôte', () => {
      fake.connection.emit('GetPlayerResponse', makePlayer({isHost: false}));
      fake.connection.emit('TimerEnded', 'ABC123');
      fixture.detectChanges();
      expect(el().querySelector('.ending__wait')).not.toBeNull();
    });

    it('tableau du tournoi puis combat PvP', () => {
      fake.connection.emit('GetPlayerResponse', makePlayer());
      fake.connection.emit('bracketCreated', {_id: 'b', nbTurn: 1, rounds: [{roundNumber: 1, playersInRace: ['player-1', 'p2']}], players: [makePlayer(), makePlayer({_id: 'p2'})]});
      fixture.detectChanges();
      expect(el().querySelector('app-bracket')).not.toBeNull();

      fake.connection.emit('triggerTournament');
      expect(fake.connection.lastInvocation('GetPvpFight')?.args).toEqual(['ABC123', 'player-1']);

      fake.connection.emit('responsePvpFight', makePlayer({_id: 'p2', name: 'Blue'}));
      fixture.detectChanges();
      expect(component.turnType).toBe('PvpFight');
      expect(el().querySelector('app-wild-fight')).not.toBeNull();
    });
  });

  it('affiche l’équipe du joueur', () => {
    fake.connection.emit('GetPlayerResponse', makePlayer());
    fixture.detectChanges();
    expect(el().querySelector('app-my-team')).not.toBeNull();
  });
});
