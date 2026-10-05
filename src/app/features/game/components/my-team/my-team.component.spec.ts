import {TestBed} from '@angular/core/testing';
import {MyTeamComponent} from './my-team.component';
import {makePokemon} from '../../../../../testing/test-data';

describe('MyTeamComponent (équipe)', () => {
  function render(size: number) {
    TestBed.configureTestingModule({imports: [MyTeamComponent]});
    const fixture = TestBed.createComponent(MyTeamComponent);
    fixture.componentRef.setInput('Team', Array.from({length: size}, (_, i) => makePokemon({nameFr: 'P' + i})));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche les Pokémon et les places libres', () => {
    const el = render(2);
    expect(el.querySelector('.frame-title')?.textContent).toContain('2/6');
    expect(el.querySelectorAll('app-pokemon-slot').length).toBe(2);
    expect(el.querySelectorAll('.team__empty').length).toBe(4);
  });

  it('équipe complète', () => {
    const el = render(6);
    expect(el.querySelectorAll('.team__empty').length).toBe(0);
  });

  it('le premier Pokémon est celui au combat', () => {
    const el = render(3);
    expect(el.querySelectorAll('.slot--lead').length).toBe(1);
    expect(el.querySelector('.slot--lead .slot__name')?.textContent).toBe('P0');
  });
});
