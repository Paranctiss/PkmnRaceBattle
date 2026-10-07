import {TestBed} from '@angular/core/testing';
import {PathChoiceComponent} from './path-choice.component';

describe('PathChoiceComponent (embranchement)', () => {
  it('propose les routes avec leur description et renvoie le choix', () => {
    TestBed.configureTestingModule({imports: [PathChoiceComponent]});
    const fixture = TestBed.createComponent(PathChoiceComponent);
    const options = [{x: 3, y: 1, environmentName: 'Volcan'}, {x: 3, y: 2, environmentName: 'Foret'}];
    fixture.componentRef.setInput('Options', options);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spy = spyOn(fixture.componentInstance.PathChosen, 'emit');

    expect(Array.from(el.querySelectorAll('.route-card__name')).map(e => e.textContent)).toEqual(['Volcan', 'Forêt']);
    expect(el.querySelectorAll('.route-card__flavor')[0].textContent).toContain('lave');
    (el.querySelectorAll('.route-card')[1] as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledWith(options[1]);
  });

  it('affiche le palier de niveaux de chaque route', () => {
    TestBed.configureTestingModule({imports: [PathChoiceComponent]});
    const fixture = TestBed.createComponent(PathChoiceComponent);
    fixture.componentRef.setInput('Options', [
      {x: 3, y: 1, environmentName: 'Volcan', minLevel: 12, maxLevel: 19},
      {x: 3, y: 2, environmentName: 'Foret'},
    ]);
    fixture.detectChanges();
    const levels = fixture.nativeElement.querySelectorAll('.route-card__levels');
    expect(levels.length).toBe(1);
    expect(levels[0].textContent).toBe('Niv. 12 – 19');
  });

  it('ne peut pas être fermé sans choisir', () => {
    TestBed.configureTestingModule({imports: [PathChoiceComponent]});
    const fixture = TestBed.createComponent(PathChoiceComponent);
    fixture.componentRef.setInput('Options', [{x: 3, y: 1, environmentName: 'Volcan'}]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-game-modal')).not.toBeNull();
    const spy = spyOn(fixture.componentInstance.PathChosen, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(spy).not.toHaveBeenCalled();
  });
});
