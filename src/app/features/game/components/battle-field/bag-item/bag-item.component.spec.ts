import {TestBed} from '@angular/core/testing';
import {BagItemComponent} from './bag-item.component';

describe('BagItemComponent', () => {
  it('affiche l’objet et son sprite', () => {
    TestBed.configureTestingModule({imports: [BagItemComponent]});
    const fixture = TestBed.createComponent(BagItemComponent);
    fixture.componentRef.setInput('item', {name: 'Super Potion', number: 3, type: 'potion'});
    fixture.detectChanges();
    expect(fixture.componentInstance.sprite).toBe('assets/items-sprites/Super_Potion.png');
    expect(fixture.nativeElement.textContent).toContain('Super Potion');
    expect(fixture.nativeElement.textContent).toContain('3');
  });
});
