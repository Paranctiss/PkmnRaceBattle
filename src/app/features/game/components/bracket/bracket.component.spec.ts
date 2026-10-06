import {TestBed} from '@angular/core/testing';
import {BracketComponent} from './bracket.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {makePlayer, makePokemon} from '../../../../../testing/test-data';
import {BracketModel} from '../../../../shared/models/bracket.model';

describe('BracketComponent (tableau du tournoi)', () => {
  const bracket: BracketModel = {
    _id: 'b1', nbTurn: 1,
    players: [
      makePlayer({_id: 'a', name: 'Red', sprite: 'red', team: [makePokemon(), makePokemon()]}),
      makePlayer({_id: 'b', name: 'Blue', sprite: 'blue'}),
      makePlayer({_id: 'c', name: 'Ondine', sprite: 'misty'}),
      makePlayer({_id: 'd', name: 'Pierre', sprite: 'brock'}),
    ],
    rounds: [
      {roundNumber: 2, playersInRace: ['?', '?']},
      {roundNumber: 1, playersInRace: ['a', 'b', 'c', 'd']},
    ],
  };

  function render(isHost: boolean, data: BracketModel = bracket) {
    const fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [BracketComponent], providers: provideTestingDefaults(fake)});
    const hub = TestBed.inject(HubService);
    hub.gameCode = 'ABC123';
    hub.Player = makePlayer({isHost});
    const fixture = TestBed.createComponent(BracketComponent);
    fixture.componentRef.setInput('bracket', data);
    fixture.detectChanges();
    return {fixture, fake, el: fixture.nativeElement as HTMLElement};
  }

  it('regroupe les joueurs par duels', () => {
    const {fixture} = render(true);
    expect(fixture.componentInstance.rounds).toEqual([[['?', '?']], [['a', 'b'], ['c', 'd']]]);
  });

  it('affiche les dresseurs, leur équipe et les places à déterminer', () => {
    const {el} = render(true);
    const names = Array.from(el.querySelectorAll('.duelist__name')).map(n => n.textContent);
    expect(names).toEqual(['Red', 'Blue', 'Ondine', 'Pierre']);
    expect(el.querySelectorAll('.duelist.is-unknown').length).toBe(2);
    expect(el.querySelectorAll('.duelist')[2].querySelectorAll('.duelist__team img').length).toBe(2);
  });

  it('l’hôte lance le tournoi', () => {
    const {el, fake} = render(true);
    (el.querySelector('.bracket__actions button') as HTMLButtonElement).click();
    expect(fake.connection.lastInvocation('LaunchTournament')?.args).toEqual(['ABC123']);
  });

  it('les invités attendent', () => {
    const {el} = render(false);
    expect(el.querySelector('.bracket__actions button')).toBeNull();
    expect(el.querySelector('.bracket__wait')).not.toBeNull();
  });

  it('tour suivant : l’hôte relance le tour', () => {
    const {el} = render(true, {...bracket, nbTurn: 2, rounds: [{roundNumber: 2, playersInRace: ['a', 'c']}, bracket.rounds[1]]});
    expect(el.querySelector('.bracket__actions button')?.textContent).toContain('tour suivant');
  });

  it('finale jouée : le champion est affiché et il n’y a plus rien à lancer', () => {
    const {el} = render(true, {...bracket, nbTurn: 3, champion: 'c', rounds: [{roundNumber: 2, playersInRace: ['a', 'c']}, bracket.rounds[1]]});
    expect(el.querySelector('.champion__name')?.textContent).toBe('Ondine');
    expect(el.querySelector('.champion__slot')).toBeNull();
    expect(el.querySelector('.bracket__actions')).toBeNull();
    expect(el.querySelector('.bracket__end')?.textContent).toContain('Ondine');
  });
});
