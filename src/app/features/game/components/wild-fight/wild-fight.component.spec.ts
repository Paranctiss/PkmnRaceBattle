import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WildFightComponent} from './wild-fight.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {makeMove, makePlayer, makePokemon, makeTurnContext, makeWildOpponent} from '../../../../../testing/test-data';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PlayerModel} from '../../../../shared/models/player.model';

describe('WildFightComponent (combat contre un sauvage / dresseur / joueur)', () => {
  let fixture: ComponentFixture<WildFightComponent>;
  let component: WildFightComponent;
  let fake: FakeSignalRService;
  let hub: HubService;

  function create(foe: PlayerModel = makeWildOpponent()) {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [WildFightComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = 'player-1';
    hub.Player = makePlayer({team: [makePokemon({id: 'MINE'})]});
    fixture = TestBed.createComponent(WildFightComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('Foe', foe);
    fixture.detectChanges();
  }

  it('le Pokémon du joueur est le premier de son équipe', () => {
    create();
    expect(component.OnBoardPokemon.id).toBe('MINE');
  });

  it('utiliser une capacité envoie HandleMove contre le Pokémon adverse', () => {
    create();
    component.useMove(makeMove({nameFr: 'Griffe'}));
    expect(hub.pending).toBeTrue();
    expect(fake.connection.lastInvocation('HandleMove')?.args).toEqual(['player-1', 'MINE', 'Griffe', 'wild-1', 'WILD1', true, false, 0, false]);
  });

  it('contre un joueur, HandleMove est envoyé en mode PvP', () => {
    create(makePlayer({_id: 'blue', isPlayer: true, team: [makePokemon({id: 'BLUE1'})]}));
    component.useMove(makeMove({nameFr: 'Charge'}));
    expect(fake.connection.lastInvocation('HandleMove')?.args).toEqual(['player-1', 'MINE', 'Charge', 'blue', 'BLUE1', true, true, 0, false]);
  });

  it('résultat du tour transmis au combat (Pokémon actif)', () => {
    create();
    const ctx = makeTurnContext({messages: ['x']});
    fake.connection.emit('useMoveResult', ctx);
    expect(component.TurnContext).toBe(ctx);
    expect(component.TurnContext.player.index).toBe(0);
  });

  it('résultat d’un objet : l’index du Pokémon soigné est conservé', () => {
    create();
    fake.connection.emit('useItemResult', makeTurnContext(), 3);
    expect(component.TurnContext.player.index).toBe(3);
  });

  it('fin du tour : état du joueur et de l’adversaire mis à jour, le joueur peut rejouer', () => {
    create();
    hub.pending = true;
    const player = makePlayer({team: [makePokemon({id: 'MINE', currHp: 7})]});
    const foe = makeWildOpponent({currHp: 4});

    fake.connection.emit('turnFinished', player, foe);

    expect(hub.Player).toBe(player);
    expect(component.OnBoardPokemon.currHp).toBe(7);
    expect(component.Foe).toBe(foe);
    expect(hub.pending).toBeFalse();
  });

  it('fin du tour avec l’adversaire K.O. : pas de nouvelle action', () => {
    create();
    hub.pending = true;
    fake.connection.emit('turnFinished', makePlayer(), makeWildOpponent({currHp: 0}));
    expect(hub.pending).toBeTrue();
  });

  it('le dresseur envoie son Pokémon suivant', () => {
    create();
    hub.pending = true;
    const trainer = makeWildOpponent({nameFr: 'Onix'});
    fake.connection.emit('onTrainerSwitchPokemon', trainer);
    expect(component.Foe).toBe(trainer);
    expect(hub.pending).toBeFalse();
    expect(fake.connection.invoked('GetPlayer').length).toBe(1);
  });

  it('nouvel adversaire : on reprend le Pokémon du joueur remis à zéro par le serveur', () => {
    create();
    hub.Player = makePlayer({team: [makePokemon({id: 'NEXT'})]});
    fixture.componentRef.setInput('Foe', makeWildOpponent());
    fixture.detectChanges();
    expect(component.OnBoardPokemon.id).toBe('NEXT');
  });

  it('un composant détruit ne réagit plus aux événements du serveur', () => {
    create();
    const first = component;
    fixture.destroy();
    hub.Player = makePlayer();
    const stalePlayer = makePlayer({team: [makePokemon({id: 'STALE'})]});

    fake.connection.emit('turnFinished', stalePlayer, makeWildOpponent());

    // Un écouteur resté actif d'un ancien combat modifie encore l'état partagé
    expect(hub.Player).not.toBe(stalePlayer);
    expect(first.OnBoardPokemon.id).not.toBe('STALE');
  });
});
