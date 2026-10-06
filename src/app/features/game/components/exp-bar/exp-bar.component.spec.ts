import {TestBed} from '@angular/core/testing';
import {ExpBarComponent} from './exp-bar.component';

describe('ExpBarComponent (barre d’expérience)', () => {
  function create(base: number, curr: number, next: number) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [ExpBarComponent]});
    const fixture = TestBed.createComponent(ExpBarComponent);
    fixture.componentInstance.BaseExp = base;
    fixture.componentInstance.CurrExp = curr;
    fixture.componentInstance.NextLevelExp = next;
    fixture.detectChanges();
    return fixture;
  }

  it('progression dans le niveau courant', () => {
    const fixture = create(135, 157, 179);
    expect(fixture.componentInstance.getExpPercentage()).toBeCloseTo(0.5);
    expect((fixture.nativeElement.querySelector('.exp__fill') as HTMLElement).style.width).toBe('50%');
  });

  it('début et fin de niveau', () => {
    expect(create(100, 100, 200).componentInstance.getExpPercentage()).toBe(0);
    expect(create(100, 200, 200).componentInstance.getExpPercentage()).toBe(1);
  });

  it('bornée entre 0 et 1', () => {
    expect(create(100, 50, 200).componentInstance.getExpPercentage()).toBe(0);
    expect(create(100, 500, 200).componentInstance.getExpPercentage()).toBe(1);
  });

  it('intervalle invalide', () => {
    expect(create(200, 200, 200).componentInstance.getExpPercentage()).toBe(0);
  });
});
