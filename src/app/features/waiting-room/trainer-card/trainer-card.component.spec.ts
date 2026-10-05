import {TestBed} from '@angular/core/testing';
import {TrainerCardComponent} from './trainer-card.component';
import {makePlayer, makePokemon} from '../../../../testing/test-data';

describe('TrainerCardComponent', () => {
  function render(isHost: boolean, isMe: boolean) {
    TestBed.configureTestingModule({imports: [TrainerCardComponent]});
    const fixture = TestBed.createComponent(TrainerCardComponent);
    fixture.componentInstance.Player = makePlayer({isHost, sprite: 'misty', name: 'Ondine', team: [makePokemon({nameFr: 'Carapuce', types: [{slot: 1, name: 'water'}]})]});
    fixture.componentInstance.isMe = isMe;
    fixture.detectChanges();
    return fixture;
  }

  it('affiche le dresseur et son starter', () => {
    const el: HTMLElement = render(false, false).nativeElement;
    expect(el.querySelector('.tcard__name')?.textContent).toBe('Ondine');
    expect(el.querySelector('.tcard__trainer img')?.getAttribute('src')).toBe('/assets/trainers-sprites/misty.png');
    expect(el.textContent).toContain('avec Carapuce');
  });

  it('badges Hôte et Toi', () => {
    const el: HTMLElement = render(true, true).nativeElement;
    expect(el.querySelector('.tag--host')).not.toBeNull();
    expect(el.textContent).toContain('Toi');
    expect(el.querySelector('.tcard')?.classList).toContain('is-me');
  });

  it('couleur du type du starter', () => {
    expect(render(false, false).componentInstance.cardColor).toBe('#6890f0');
  });
});
