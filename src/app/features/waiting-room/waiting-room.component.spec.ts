import {ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {Router} from '@angular/router';
import {WaitingRoomComponent} from './waiting-room.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../testing/fake-signalr';
import {HubService} from '../../core/services/Hub/hub.service';
import {makePlayer, makePokemon} from '../../../testing/test-data';

describe('WaitingRoomComponent (salle d’attente)', () => {
  let fixture: ComponentFixture<WaitingRoomComponent>;
  let fake: FakeSignalRService;
  let router: Router;
  let hub: HubService;

  const host = makePlayer({_id: 'host', name: 'Sacha', isHost: true});
  const guest = makePlayer({_id: 'guest', name: 'Pierre', isHost: false, team: [makePokemon({nameFr: 'Bulbizarre'})]});

  function create(me: string) {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [WaitingRoomComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = me;
    hub.gameCode = 'ABC123';
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(WaitingRoomComponent);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;

  it('demande la liste des joueurs de la salle à l’ouverture', () => {
    create('host');
    expect(fake.connection.lastInvocation('GetPlayersInRoom')?.args).toEqual(['ABC123']);
    expect(el().querySelector('.loading')).not.toBeNull();
  });

  it('affiche les joueurs, le code de la salle et leur starter', () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();

    expect(el().querySelectorAll('app-trainer-card').length).toBe(2);
    expect(el().querySelector('.room-code__value')?.textContent).toBe('ABC123');
    expect(el().textContent).toContain('avec Bulbizarre');
    expect(el().querySelector('.frame-title')?.textContent).toContain('2');
  });

  it('le code de la salle est sélectionnable et hors du bouton Copier', () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();
    const value = el().querySelector('.room-code__value') as HTMLElement;
    expect(value.closest('button')).toBeNull();
    expect(getComputedStyle(value).userSelect).not.toBe('none');
  });

  it('le bouton Copier copie le code via le presse-papier', fakeAsync(() => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();
    const writeText = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

    (el().querySelector('.room-code__copy') as HTMLButtonElement).click();
    flushMicrotasks();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('ABC123');
    expect(el().querySelector('.room-code__copy')?.textContent).toContain('Copié');
    tick(1500);
  }));

  it('sans presse-papier (page en HTTP), le bouton Copier copie quand même le code', fakeAsync(() => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();
    const clipboard = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {value: undefined, configurable: true});
    let copiedText: string | undefined;
    spyOn(document, 'execCommand').and.callFake(() => {
      copiedText = (document.activeElement as HTMLTextAreaElement).value;
      return true;
    });

    try {
      (el().querySelector('.room-code__copy') as HTMLButtonElement).click();
      flushMicrotasks();
      fixture.detectChanges();
    } finally {
      delete (navigator as any).clipboard;
      if (clipboard) Object.defineProperty(Navigator.prototype, 'clipboard', clipboard);
    }

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(copiedText).toBe('ABC123');
    expect(el().querySelector('.room-code__copy')?.textContent).toContain('Copié');
    tick(1500);
  }));

  it('un nouveau joueur rafraîchit la liste', () => {
    create('host');
    fake.connection.emit('UserJoined', 'ABC123');
    expect(fake.connection.invoked('GetPlayersInRoom').length).toBe(2);
  });

  it('seul l’hôte voit les règles et le bouton de lancement', () => {
    create('guest');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();
    expect(el().querySelector('.settings--guest')).not.toBeNull();
    expect(el().textContent).not.toContain('Lancer la partie');
  });

  it('l’hôte lance la partie avec le minuteur choisi', async () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();
    await fixture.whenStable();

    const radios = el().querySelectorAll('input[name=timerTime]') as NodeListOf<HTMLInputElement>;
    expect(radios.length).toBe(3);
    radios[2].click();
    fixture.detectChanges();
    (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Lancer la partie')) as HTMLButtonElement).click();

    expect(fake.connection.lastInvocation('StartGame')?.args).toEqual(['ABC123', true, 15, true, 1]);
  });

  it('par défaut : Multi Exp activé et XP normale', async () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el().textContent).toContain('Multi Exp');
    expect(el().textContent).toContain('la moitié pour les Pokémon qui n’ont pas combattu');
    const xpRadios = el().querySelectorAll('input[name=xpMultiplier]') as NodeListOf<HTMLInputElement>;
    expect(Array.from(xpRadios).map(r => r.checked)).toEqual([true, false, false]);
  });

  it('l’hôte peut désactiver le Multi Exp et accélérer l’XP', async () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host]);
    fixture.detectChanges();
    await fixture.whenStable();
    const checkboxes = el().querySelectorAll('input[type=checkbox]') as NodeListOf<HTMLInputElement>;
    checkboxes[1].click();
    (el().querySelectorAll('input[name=xpMultiplier]')[2] as HTMLInputElement).click();
    fixture.detectChanges();
    expect(el().textContent).toContain('Seuls les Pokémon qui ont combattu');
    expect(Array.from(el().querySelectorAll('.segmented span')).map(s => s.textContent)).toContain('× 5');

    fixture.componentInstance.StartGame();
    expect(fake.connection.lastInvocation('StartGame')?.args).toEqual(['ABC123', true, 5, false, 5]);
  });

  it('l’hôte peut lancer sans minuteur', async () => {
    create('host');
    fake.connection.emit('ResponsePlayersInRoom', [host]);
    fixture.detectChanges();
    await fixture.whenStable();
    (el().querySelector('input[type=checkbox]') as HTMLInputElement).click();
    fixture.detectChanges();
    expect(el().textContent).toContain('pas de limite de temps');

    fixture.componentInstance.StartGame();
    expect(fake.connection.lastInvocation('StartGame')?.args[1]).toBeFalse();
  });

  it('le bouton Menu principal quitte la salle et revient à l’accueil', () => {
    create('guest');
    hub.userId = 'guest';
    fake.connection.emit('ResponsePlayersInRoom', [host, guest]);
    fixture.detectChanges();

    (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Menu principal')) as HTMLButtonElement).click();

    expect(fake.connection.lastInvocation('LeaveGame')?.args).toEqual(['ABC123', 'guest']);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(hub.gameCode).toBe('');
  });

  it('le départ d’un joueur rafraîchit la liste', () => {
    create('host');
    fake.connection.emit('UserLeft', 'guest');
    expect(fake.connection.invoked('GetPlayersInRoom').length).toBe(2);
  });

  it('partie lancée : tout le monde passe à l’écran de jeu', () => {
    create('guest');
    fake.connection.emit('GameStarted', 'ABC123');
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });
});
