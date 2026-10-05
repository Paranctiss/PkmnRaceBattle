import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PokeCenterComponent} from './poke-center.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {makePlayer, makePokemon} from '../../../../../testing/test-data';

describe('PokeCenterComponent (Centre Pokémon)', () => {
  let fixture: ComponentFixture<PokeCenterComponent>;
  let fake: FakeSignalRService;
  let hub: HubService;

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [PokeCenterComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = 'player-1';
    hub.Player = makePlayer({team: [makePokemon({currHp: 0}), makePokemon({currHp: 3, isPoisoned: true})]});
    fixture = TestBed.createComponent(PokeCenterComponent);
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (text: string) => Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes(text)) as HTMLButtonElement;

  it('accueille le joueur et affiche son équipe', () => {
    expect(el().textContent).toContain('Voulez-vous que je soigne vos Pokémon');
    expect(el().querySelectorAll('app-pokemon-slot').length).toBe(2);
  });

  it('soigner envoie UsePokeCenter et bloque le bouton', () => {
    button('Soigner').click();
    fixture.detectChanges();
    expect(fake.connection.lastInvocation('UsePokeCenter')?.args).toEqual(['player-1']);
    expect(hub.pending).toBeTrue();
    expect(button('Soins en cours').disabled).toBeTrue();
  });

  it('équipe soignée : affichage mis à jour et retour sur la route', () => {
    button('Soigner').click();
    const healed = makePlayer({team: [makePokemon(), makePokemon()]});
    fake.connection.emit('healedPokeCenter', healed);
    fixture.detectChanges();

    expect(hub.Player).toBe(healed);
    expect(hub.pending).toBeFalse();
    expect(el().textContent).toContain('pleine forme');
    expect(el().querySelector('.status--ko')).toBeNull();

    button('Reprendre la route').click();
    expect(fake.connection.lastInvocation('GetNewTurn')?.args).toEqual(['player-1']);
  });
});
