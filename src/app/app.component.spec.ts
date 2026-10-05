import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {provideTestingDefaults} from '../testing/fake-signalr';
import {routes} from './app.routes';
import {HomeComponent} from './features/home/home.component';
import {StarterSelectionComponent} from './features/starter-selection/starter-selection.component';
import {WaitingRoomComponent} from './features/waiting-room/waiting-room.component';
import {GameComponent} from './features/game/game.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: provideTestingDefaults(),
    }).compileComponents();
  });

  it('affiche le fond d’environnement et le routeur', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-environment-background')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });

  it('routes : accueil -> starter -> salle -> partie', () => {
    const byPath = (path: string) => routes.find(r => r.path === path)?.component;
    expect(byPath('')).toBe(HomeComponent);
    expect(byPath('starter')).toBe(StarterSelectionComponent);
    expect(byPath('room')).toBe(WaitingRoomComponent);
    expect(byPath('game')).toBe(GameComponent);
    expect(routes.find(r => r.path === '**')?.redirectTo).toBe('');
  });
});
