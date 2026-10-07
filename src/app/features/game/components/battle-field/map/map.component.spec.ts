import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapComponent} from './map.component';
import {PathPoint} from '../../../../../shared/models/player.model';

describe('MapComponent (carte du parcours)', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;

  const path = (): PathPoint[] => [
    {x: 1, y: 1, environmentName: 'Plaine'},
    {x: 2, y: 1, environmentName: 'Foret'},
    {x: 3, y: 1, environmentName: 'Volcan', isSkipped: true},
    {x: 3, y: 2, environmentName: 'Eau'},
    {x: 4, y: 1, environmentName: 'Centre'},
    {x: 5, y: 1, environmentName: 'Grotte'},
    {x: 5, y: 2, environmentName: 'Centrale'},
  ];

  function render(current: PathPoint, points = path()) {
    TestBed.configureTestingModule({imports: [MapComponent]});
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('PathNodes', points);
    fixture.componentRef.setInput('CurrentNode', current);
    fixture.componentRef.setInput('TrainerSprite', 'red');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const state = (env: string) => component.nodes.find(n => n.point.environmentName === env)?.state;

  it('affiche toutes les étapes plus le point de départ', () => {
    const el = render({x: 3, y: 2, environmentName: 'Eau'});
    expect(component.nodes.length).toBe(8);
    expect(el.querySelectorAll('.place').length).toBe(8);
    expect(Array.from(el.querySelectorAll('.place__label')).map(l => l.textContent)).toContain('Centre Pokémon');
  });

  it('états : visité, actuel, non choisi, à venir', () => {
    render({x: 3, y: 2, environmentName: 'Eau'});
    expect(state('Default')).toBe('visited');
    expect(state('Plaine')).toBe('visited');
    expect(state('Foret')).toBe('visited');
    expect(state('Eau')).toBe('current');
    expect(state('Volcan')).toBe('skipped');
    expect(state('Centre')).toBe('upcoming');
    expect(state('Grotte')).toBe('upcoming');
    expect(state('Centrale')).toBe('upcoming');
  });

  it('le dresseur est dessiné sur la map actuelle', () => {
    const el = render({x: 2, y: 1, environmentName: 'Foret'});
    const trainer = el.querySelector('.place--current .place__trainer');
    expect(trainer?.getAttribute('src')).toBe('/assets/trainers-sprites/red.png');
    expect(el.querySelectorAll('.place__trainer').length).toBe(1);
  });

  it('avant la première map, le joueur est au départ', () => {
    render({x: 0, y: 0, environmentName: 'Default'});
    expect(state('Default')).toBe('current');
    expect(state('Plaine')).toBe('upcoming');
  });

  it('les deux branches d’un embranchement sont décalées verticalement', () => {
    render({x: 1, y: 1, environmentName: 'Plaine'});
    const top = component.nodes.find(n => n.point.environmentName === 'Grotte')!.top;
    const bottom = component.nodes.find(n => n.point.environmentName === 'Centrale')!.top;
    expect(top).toBeLessThan(bottom);
  });

  it('routes entre étapes consécutives, celles vers une branche non choisie sont grisées', () => {
    render({x: 3, y: 2, environmentName: 'Eau'});
    // 0-1, 1-2, 2-3(x2), 3(x2)-4, 4-5(x2)
    expect(component.links.length).toBe(1 + 1 + 2 + 2 + 2);
    expect(component.links.filter(l => l.state === 'skipped').length).toBe(2);
    expect(component.links.filter(l => l.state === 'travelled').length).toBe(3);
  });

  it('infobulle au survol', () => {
    const el = render({x: 1, y: 1, environmentName: 'Plaine'});
    el.querySelectorAll('.place')[1].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.place-tip')?.textContent).toContain('Vous êtes ici');
  });

  it('infobulle : palier de niveaux des maps de combat', () => {
    const points = path();
    points[1] = {...points[1], minLevel: 9, maxLevel: 14};
    const el = render({x: 1, y: 1, environmentName: 'Plaine'}, points);
    el.querySelectorAll('.place')[2].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.place-tip')?.textContent).toContain('Niv. 9 – 14');
    el.querySelectorAll('.place')[5].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.place-tip')?.textContent).not.toContain('Niv.');
  });

  it('infobulle de la position actuelle : palier à jour (tours de boucle en fin de chemin)', () => {
    const points = path();
    points[0] = {...points[0], minLevel: 2, maxLevel: 9};
    const el = render({x: 1, y: 1, environmentName: 'Plaine', minLevel: 25, maxLevel: 31}, points);
    el.querySelectorAll('.place')[1].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.place-tip')?.textContent).toContain('Niv. 25 – 31');
  });
});
