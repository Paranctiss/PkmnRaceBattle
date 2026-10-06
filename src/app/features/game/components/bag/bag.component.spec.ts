import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BagComponent} from './bag.component';
import {defaultItems} from '../../../../../testing/test-data';

describe('BagComponent (sac)', () => {
  let fixture: ComponentFixture<BagComponent>;

  beforeEach(() => BagComponent.lastPocket = 'potion');

  function render(selectable = true) {
    TestBed.configureTestingModule({imports: [BagComponent]});
    fixture = TestBed.createComponent(BagComponent);
    fixture.componentRef.setInput('items', defaultItems());
    fixture.componentRef.setInput('selectable', selectable);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('poches avec le nombre d’objets', () => {
    const el = render();
    const counts = Array.from(el.querySelectorAll('.bag__tab-count')).map(c => c.textContent);
    expect(counts).toEqual(['21', '30', '1', '1']);
  });

  it('n’affiche que les objets de la poche active', () => {
    const el = render();
    expect(el.querySelectorAll('app-bag-item').length).toBe(3);
    (el.querySelectorAll('.bag__tab')[3] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-bag-item').length).toBe(3);
  });

  it('rouvert, le sac affiche la dernière poche consultée', () => {
    let el = render();
    (el.querySelectorAll('.bag__tab')[2] as HTMLButtonElement).click();
    fixture.detectChanges();

    TestBed.resetTestingModule();
    el = render();
    expect(el.querySelectorAll('.bag__tab')[2].classList).toContain('is-active');
    expect(fixture.componentInstance.activePocket).toBe(fixture.componentInstance.pockets[2].key);
  });

  it('choisir un objet l’envoie', () => {
    const el = render();
    const spy = spyOn(fixture.componentInstance.itemSelected, 'emit');
    (el.querySelector('.bag__cell') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({name: 'Potion'}));
  });

  it('en consultation seule, aucun objet n’est utilisable', () => {
    const el = render(false);
    const spy = spyOn(fixture.componentInstance.itemSelected, 'emit');
    (el.querySelector('.bag__cell') as HTMLButtonElement).click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('description au survol', () => {
    const el = render();
    el.querySelector('.bag__cell')!.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.bag__desc')?.textContent).toContain('Restaure 20 PV');
  });
});
