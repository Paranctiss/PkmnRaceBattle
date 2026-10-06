import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {StarterSelectionComponent} from './starter-selection.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../testing/fake-signalr';
import {makeStarter} from '../../../testing/test-data';
import {HubService} from '../../core/services/Hub/hub.service';

describe('StarterSelectionComponent (choix du starter)', () => {
  let fixture: ComponentFixture<StarterSelectionComponent>;
  let component: StarterSelectionComponent;
  let fake: FakeSignalRService;
  let http: HttpTestingController;
  let router: Router;

  function create(host: boolean, room?: string, player?: {name: string, sprite: string}) {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({
      imports: [StarterSelectionComponent],
      providers: [
        ...provideTestingDefaults(fake),
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: room ? {host: String(host), room} : {host: String(host)}}}},
      ],
    });
    if (player) Object.assign(TestBed.inject(HubService).Player, player);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(StarterSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Réponses dans le désordre : l'affichage doit quand même être trié par numéro
    http.expectOne(r => r.url.endsWith('/Pokemon/7')).flush(makeStarter(7, 'Carapuce', 'water'));
    http.expectOne(r => r.url.endsWith('/Pokemon/1')).flush(makeStarter(1, 'Bulbizarre', 'grass'));
    http.expectOne(r => r.url.endsWith('/Pokemon/4')).flush(makeStarter(4, 'Salamèche', 'fire'));
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const submit = () => el().querySelector('.cta .btn--primary') as HTMLButtonElement;
  const cards = () => Array.from(el().querySelectorAll('app-starter-card')) as HTMLElement[];

  async function type(selector: string, value: string) {
    const input = el().querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('affiche les trois starters triés par numéro', () => {
    create(true);
    expect(cards().map(c => c.querySelector('.starter__name')?.textContent?.trim())).toEqual(['Bulbizarre', 'Salamèche', 'Carapuce']);
  });

  it('Rejouer : nom, apparence et code de la salle sont pré-remplis', () => {
    create(false, 'ABC123', {name: 'Sacha', sprite: 'red'});
    expect(component.roomCode).toBe('ABC123');
    expect(component.username).toBe('Sacha');
    expect(component.trainerSprite).toBe('red');
    expect(component.missingHint).toBe('Choisis un Pokémon de départ.');
  });

  it('mode hôte : pas de champ de code de salle', () => {
    create(true);
    expect(el().querySelector('.input--code')).toBeNull();
    expect(submit().textContent).toContain('Créer la partie');
  });

  it('mode invité : champ de code de salle', () => {
    create(false);
    expect(el().querySelector('.input--code')).not.toBeNull();
    expect(submit().textContent).toContain('Rejoindre la partie');
  });

  it('cliquer sur un starter le sélectionne et l’affiche comme partenaire', () => {
    create(true);
    cards()[1].click();
    fixture.detectChanges();
    expect(component.selectedPokemonId).toBe(4);
    expect(el().querySelector('.trainer-card__partner b')?.textContent).toBe('Salamèche');
    expect(cards()[1].querySelector('.starter')?.classList).toContain('is-selected');
    expect(cards()[0].querySelector('.starter')?.classList).not.toContain('is-selected');
  });

  it('le bouton reste désactivé tant qu’il manque une information', async () => {
    create(false);
    expect(submit().disabled).toBeTrue();
    expect(el().querySelector('.cta__hint')?.textContent).toContain('Pokémon de départ');

    cards()[0].click();
    fixture.detectChanges();
    expect(el().querySelector('.cta__hint')?.textContent).toContain('nom de dresseur');

    await type('input[placeholder="Ton pseudo"]', '   ');
    expect(submit().disabled).toBeTrue();

    await type('input[placeholder="Ton pseudo"]', 'Pierre');
    expect(el().querySelector('.cta__hint')?.textContent).toContain('code de la salle');

    await type('.input--code', 'abc123');
    expect(submit().disabled).toBeFalse();
  });

  it('hôte : crée la partie avec le starter sélectionné', async () => {
    create(true);
    cards()[2].click();
    await type('input[placeholder="Ton pseudo"]', '  Ondine  ');

    submit().click();

    expect(fake.connection.lastInvocation('CreateGame')?.args).toEqual(['Ondine', 7, component.trainerSprite]);
    expect(fake.connection.invoked('JoinGame').length).toBe(0);
  });

  it('invité : rejoint la partie avec le code en majuscules', async () => {
    create(false);
    cards()[0].click();
    await type('input[placeholder="Ton pseudo"]', 'Pierre');
    await type('.input--code', ' ab12cd ');

    submit().click();

    expect(fake.connection.lastInvocation('JoinGame')?.args).toEqual(['Pierre', 1, component.trainerSprite, 'AB12CD']);
  });

  it('partie créée : mémorise le joueur et va dans la salle d’attente', () => {
    create(true);
    const hub = TestBed.inject(HubService);
    fake.connection.emit('GameCreated', 'ABC123', 'user-42');
    expect(hub.userId).toBe('user-42');
    expect(hub.gameCode).toBe('ABC123');
    expect(router.navigate).toHaveBeenCalledWith(['/room']);
  });

  it('partie rejointe : mémorise le joueur et va dans la salle d’attente', () => {
    create(false);
    const hub = TestBed.inject(HubService);
    fake.connection.emit('JoinSuccess', 'ABC123', 'user-7');
    expect(hub.userId).toBe('user-7');
    expect(router.navigate).toHaveBeenCalledWith(['/room']);
  });

  it('change l’apparence du dresseur', () => {
    create(true);
    const sprites = new Set<string>();
    for (let i = 0; i < 30; i++) {
      component.changeTrainerSprite();
      sprites.add(component.trainerSprite);
      expect(component.TrainerSprites).toContain(component.trainerSprite);
    }
    expect(sprites.size).toBeGreaterThan(1);
  });
});
