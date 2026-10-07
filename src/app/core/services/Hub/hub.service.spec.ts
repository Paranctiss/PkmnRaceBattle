import {TestBed} from '@angular/core/testing';
import {HubService} from './hub.service';
import {FakeSignalRService, provideTestingDefaults} from '../../../../testing/fake-signalr';

// HubService est le contrat client -> serveur : chaque méthode doit appeler la bonne méthode du GameHub avec les bons arguments
describe('HubService', () => {
  let service: HubService;
  let fake: FakeSignalRService;

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({providers: provideTestingDefaults(fake)});
    service = TestBed.inject(HubService);
    service.userId = 'user-1';
    service.gameCode = 'ABC123';
  });

  const last = (method: string) => fake.connection.lastInvocation(method)?.args;

  it('est un singleton partagé par toute l’application', () => {
    expect(TestBed.inject(HubService)).toBe(service);
  });

  describe('appels au serveur', () => {
    it('createGame -> CreateGame(nom, starter, sprite)', () => {
      service.createGame('Sacha', 4, 'red');
      expect(last('CreateGame')).toEqual(['Sacha', 4, 'red']);
    });

    it('joinGame -> JoinGame(nom, starter, sprite, code)', () => {
      service.joinGame('Pierre', 1, 'brock', 'ABC123');
      expect(last('JoinGame')).toEqual(['Pierre', 1, 'brock', 'ABC123']);
    });

    it('leaveGame -> LeaveGame(salle, joueur)', () => {
      service.leaveGame('ABC123', 'user-1');
      expect(last('LeaveGame')).toEqual(['ABC123', 'user-1']);
    });

    it('getAllUsersByRoomID -> GetPlayersInRoom(code)', () => {
      service.getAllUsersByRoomID('ABC123');
      expect(last('GetPlayersInRoom')).toEqual(['ABC123']);
    });

    it('getCurrentUser -> GetPlayer(userId)', () => {
      service.getCurrentUser();
      expect(last('GetPlayer')).toEqual(['user-1']);
    });

    it('startGame -> StartGame(code, minuteur, durée, multiExp, multiplicateur d’XP)', () => {
      service.startGame('ABC123', true, 10);
      expect(last('StartGame')).toEqual(['ABC123', true, 10, true, 1]);
      service.startGame('ABC123', false, 5, false, 5);
      expect(last('StartGame')).toEqual(['ABC123', false, 5, false, 5]);
    });

    it('getNewTurn et getWildFight -> GetNewTurn(userId)', () => {
      service.getNewTurn();
      service.getWildFight();
      expect(fake.connection.invoked('GetNewTurn').map(i => i.args)).toEqual([['user-1'], ['user-1']]);
    });

    it('chooseNextPath -> ChooseNextPath(userId, x, y)', () => {
      service.chooseNextPath(3, 2);
      expect(last('ChooseNextPath')).toEqual(['user-1', 3, 2]);
    });

    it('getPvpFight -> GetPvpFight(code, userId)', () => {
      service.getPvpFight();
      expect(last('GetPvpFight')).toEqual(['ABC123', 'user-1']);
    });

    it('buildTournament / launchTournament', () => {
      service.buildTournament();
      service.launchTournament();
      expect(last('BuildTournament')).toEqual(['ABC123']);
      expect(last('LaunchTournament')).toEqual(['ABC123']);
    });

    it('usePokeCenter -> UsePokeCenter(userId)', () => {
      service.usePokeCenter();
      expect(last('UsePokeCenter')).toEqual(['user-1']);
    });

    it('buyItem -> BuyItem(userId, objet)', () => {
      service.buyItem('Potion');
      expect(last('BuyItem')).toEqual(['user-1', 'Potion']);
    });

    it('useMove -> HandleMove(userId, pokémon, capacité, adversaire, pokémon adverse, attaque, pvp, index, skipTurn)', () => {
      service.useMove('P1', 'Charge', 'W1', 'WP1', true, false);
      expect(last('HandleMove')).toEqual(['user-1', 'P1', 'Charge', 'W1', 'WP1', true, false, 0, false]);
      service.useMove('P1', 'item:Potion:potion', 'W1', 'WP1', true, true, 2, true);
      expect(last('HandleMove')).toEqual(['user-1', 'P1', 'item:Potion:potion', 'W1', 'WP1', true, true, 2, true]);
    });

    it('addPokemonToTeam -> AddPokemonToTeam(userId, adversaire, index)', () => {
      service.addPokemonToTeam('W1');
      expect(last('AddPokemonToTeam')).toEqual(['user-1', 'W1', 0]);
      service.addPokemonToTeam('W1', -1);
      expect(last('AddPokemonToTeam')).toEqual(['user-1', 'W1', -1]);
    });

    it('replacePokemon -> ReplacePokemon(userId, pokémon, adversaire, pvp)', () => {
      service.replacePokemon('P2', 'W1', false);
      expect(last('ReplacePokemon')).toEqual(['user-1', 'P2', 'W1', false]);
    });

    it('learnMove -> LearnMove(ancienne, nouvelle, pokémon, userId)', () => {
      service.learnMove(33, 52, 'P1');
      expect(last('LearnMove')).toEqual([33, 52, 'P1', 'user-1']);
    });
  });

  describe('écoute des événements du serveur', () => {
    const cases: [string, (s: HubService, cb: any) => void][] = [
      ['GameCreated', (s, cb) => s.onGameCreated(cb)],
      ['JoinSuccess', (s, cb) => s.onJoinSuccess(cb)],
      ['UserJoined', (s, cb) => s.onUserJoined(cb)],
      ['UserLeft', (s, cb) => s.onUserLeft(cb)],
      ['GetPlayerResponse', (s, cb) => s.onGetPlayerResponse(cb)],
      ['ResponsePlayersInRoom', (s, cb) => s.onResponsePlayersInRoom(cb)],
      ['GameStarted', (s, cb) => s.onStartedGame(cb)],
      ['chooseNextPath', (s, cb) => s.onChooseNextPath(cb)],
      ['triggerTournament', (s, cb) => s.onTriggerTournament(cb)],
      ['bracketCreated', (s, cb) => s.onBracketCreated(cb)],
      ['onTrainerSwitchPokemon', (s, cb) => s.onTrainerSwitchPokemon(cb)],
      ['responseWildFight', (s, cb) => s.responseWildFight(cb)],
      ['responseTrainerFight', (s, cb) => s.responseTrainerFight(cb)],
      ['responsePvpFight', (s, cb) => s.responsePvpFight(cb)],
      ['responsePokeCenter', (s, cb) => s.responsePokeCenter(cb)],
      ['responsePokeShop', (s, cb) => s.responsePokeShop(cb)],
      ['healedPokeCenter', (s, cb) => s.healedPokeCenter(cb)],
      ['onBuyItemResponse', (s, cb) => s.onBuyItemResponse(cb)],
      ['waitingOpponent', (s, cb) => s.onWaitingOpponent(cb)],
      ['useMoveResult', (s, cb) => s.onUseMoveResponse(cb)],
      ['useItemResult', (s, cb) => s.onUseItemResponse(cb)],
      ['turnFinished', (s, cb) => s.onTurnFinished(cb)],
      ['launchBall', (s, cb) => s.onLaunchBall(cb)],
      ['catchResult', (s, cb) => s.onCatchResult(cb)],
      ['caughtPokemon', (s, cb) => s.onCaughtPokemon(cb)],
      ['playerPokemonDeath', (s, cb) => s.onPlayerPokemonDeath(cb)],
      ['playerLooseFight', (s, cb) => s.onPlayerLooseFight(cb)],
      ['pokemonLevelUp', (s, cb) => s.onPokemonLevelUp(cb)],
      ['swapPokemon', (s, cb) => s.onReplacePokemon(cb)],
      ['moveLearned', (s, cb) => s.onLearnedMove(cb)],
    ];

    cases.forEach(([eventName, register]) => {
      it(`${eventName} déclenche le callback`, () => {
        const callback = jasmine.createSpy(eventName);
        register(service, callback);
        fake.connection.emit(eventName, 'a', 'b');
        expect(callback).toHaveBeenCalledWith('a', 'b');
      });
    });
  });

  describe('minuteur', () => {
    it('TimerUpdate met à jour le temps restant', () => {
      service.onTimerUpdate(() => {});
      fake.connection.emit('TimerUpdate', 125.6);
      expect(service.remainingSeconds).toBe(125.6);
      expect(service.timerActive).toBeTrue();
    });

    it('TimerEnded remet le temps à zéro', () => {
      service.onTimerUpdate(() => {});
      service.onTimerEnded(() => {});
      fake.connection.emit('TimerUpdate', 30);
      fake.connection.emit('TimerEnded', 'ABC123');
      expect(service.remainingSeconds).toBe(0);
      expect(service.timerActive).toBeFalse();
    });

    it('formate le temps en MM:SS', () => {
      service.remainingSeconds = 0;
      expect(service.formatRemainingTime()).toBe('00:00');
      service.remainingSeconds = 65.9;
      expect(service.formatRemainingTime()).toBe('01:05');
      service.remainingSeconds = 600;
      expect(service.formatRemainingTime()).toBe('10:00');
    });
  });
});
