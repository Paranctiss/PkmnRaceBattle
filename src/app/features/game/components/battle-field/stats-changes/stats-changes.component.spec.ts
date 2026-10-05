import {TestBed} from '@angular/core/testing';
import {StatsChangesComponent} from './stats-changes.component';
import {makePokemon} from '../../../../../../testing/test-data';

describe('StatsChangesComponent (changements de stats)', () => {
  it('n’affiche que les stats modifiées', () => {
    TestBed.configureTestingModule({imports: [StatsChangesComponent]});
    const fixture = TestBed.createComponent(StatsChangesComponent);
    const pokemon = makePokemon({atkChanges: 2, defChanges: -1});
    fixture.componentRef.setInput('Pokemon', pokemon);
    fixture.detectChanges();

    expect(fixture.componentInstance.changes).toEqual([{label: 'Atq', value: 2}, {label: 'Déf', value: -1}]);
    expect(fixture.nativeElement.textContent).toContain('Atq');
    expect(fixture.nativeElement.textContent).not.toContain('Vit');
  });

  it('suit les modifications faites pendant le combat', () => {
    TestBed.configureTestingModule({imports: [StatsChangesComponent]});
    const fixture = TestBed.createComponent(StatsChangesComponent);
    const pokemon = makePokemon();
    fixture.componentRef.setInput('Pokemon', pokemon);
    fixture.detectChanges();
    expect(fixture.componentInstance.changes).toEqual([]);

    pokemon.speedChanges = -2;
    pokemon.atkSpeChanges = 1;
    fixture.detectChanges();
    expect(fixture.componentInstance.changes).toEqual([{label: 'Atq.S', value: 1}, {label: 'Vit', value: -2}]);
  });

  it('renvoie le même tableau tant que rien ne change (sinon la page se fige)', () => {
    TestBed.configureTestingModule({imports: [StatsChangesComponent]});
    const fixture = TestBed.createComponent(StatsChangesComponent);
    fixture.componentRef.setInput('Pokemon', makePokemon({atkChanges: 1}));
    expect(fixture.componentInstance.changes).toBe(fixture.componentInstance.changes);
  });
});
