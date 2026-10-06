import {TestBed} from '@angular/core/testing';
import {TypeCardComponent} from './type-card.component';

describe('TypeCardComponent (badge de type)', () => {
  function render(name: string, size = '90px') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [TypeCardComponent]});
    const fixture = TestBed.createComponent(TypeCardComponent);
    fixture.componentRef.setInput('Type', {slot: 1, name});
    fixture.componentRef.setInput('Size', size);
    fixture.detectChanges();
    return fixture;
  }

  it('libellé français et couleur du type', () => {
    const fixture = render('water');
    expect(fixture.componentInstance.label).toBe('Eau');
    expect(fixture.componentInstance.color).toBe('#6890f0');
    expect(fixture.nativeElement.textContent).toContain('Eau');
  });

  it('petit format sous 70px', () => {
    expect(render('fire', '50px').componentInstance.small).toBeTrue();
    expect(render('fire', '76px').componentInstance.small).toBeFalse();
  });
});
