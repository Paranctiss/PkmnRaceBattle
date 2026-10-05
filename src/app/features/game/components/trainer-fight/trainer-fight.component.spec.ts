import {TestBed} from '@angular/core/testing';
import {TrainerFightComponent} from './trainer-fight.component';
import {makeTrainer} from '../../../../../testing/test-data';

describe('TrainerFightComponent (introduction du combat de dresseur)', () => {
  it('présente le dresseur et son équipe, puis lance le combat', () => {
    TestBed.configureTestingModule({imports: [TrainerFightComponent]});
    const fixture = TestBed.createComponent(TrainerFightComponent);
    fixture.componentRef.setInput('Foe', makeTrainer());
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spy = spyOn(fixture.componentInstance.TrainerContinue, 'emit');

    expect(el.textContent).toContain('Pierre veut se battre !');
    expect(el.querySelector('.encounter__trainer')?.getAttribute('src')).toBe('assets/trainers-sprites/brock.png');
    expect(el.querySelectorAll('.encounter__balls img').length).toBe(3);

    (el.querySelector('button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });
});
