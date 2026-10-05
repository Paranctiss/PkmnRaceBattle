import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {HomeComponent} from './home.component';
import {provideTestingDefaults} from '../../../testing/fake-signalr';
import {EnvironmentService} from '../../core/services/Environment/environment.service';

describe('HomeComponent (page d’accueil)', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: provideTestingDefaults(),
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('affiche le titre du jeu', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Race');
    expect(el.querySelector('h1')?.textContent).toContain('Battle');
  });

  it('propose de créer ou rejoindre une partie', () => {
    const labels = Array.from(el.querySelectorAll('.menu__label')).map(e => e.textContent?.trim());
    expect(labels).toEqual(['Créer une partie', 'Rejoindre une partie']);
  });

  it('« Créer une partie » ouvre le choix du starter en tant qu’hôte', () => {
    (el.querySelectorAll('.menu__item')[0] as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/starter'], {queryParams: {host: true}});
  });

  it('« Rejoindre une partie » ouvre le choix du starter en tant qu’invité', () => {
    (el.querySelectorAll('.menu__item')[1] as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/starter'], {queryParams: {host: false}});
  });

  it('remet le décor de la Plaine', () => {
    const env = TestBed.inject(EnvironmentService);
    env.setEnvironment('Volcan');
    TestBed.createComponent(HomeComponent);
    expect(env.environment()).toBe('Plaine');
  });
});
