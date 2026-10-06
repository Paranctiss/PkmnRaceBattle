import {TestBed} from '@angular/core/testing';
import {StarterCardComponent} from './starter-card.component';
import {makeStarter} from '../../../../testing/test-data';

describe('StarterCardComponent', () => {
  function render(selectedId: number) {
    TestBed.configureTestingModule({imports: [StarterCardComponent]});
    const fixture = TestBed.createComponent(StarterCardComponent);
    fixture.componentInstance.Pokemon = makeStarter(4, 'Salamèche', 'fire');
    fixture.componentInstance.selectedPokemonId = selectedId;
    fixture.detectChanges();
    return fixture;
  }

  it('affiche numéro, nom, sprite et type', () => {
    const el: HTMLElement = render(0).nativeElement;
    expect(el.querySelector('.starter__dex')?.textContent).toContain('004');
    expect(el.querySelector('.starter__name')?.textContent).toBe('Salamèche');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('front-4.png');
    expect(el.querySelectorAll('app-type-card').length).toBe(1);
  });

  it('indique la sélection', () => {
    const el: HTMLElement = render(4).nativeElement;
    expect(el.querySelector('.starter')?.getAttribute('aria-checked')).toBe('true');
    expect(el.querySelector('.starter__ribbon')).not.toBeNull();
  });

  it('non sélectionné', () => {
    const el: HTMLElement = render(1).nativeElement;
    expect(el.querySelector('.starter__ribbon')).toBeNull();
  });

  it('prend la couleur de son type', () => {
    const fixture = render(0);
    expect(fixture.componentInstance.cardColor).toBe('#f08030');
  });
});
