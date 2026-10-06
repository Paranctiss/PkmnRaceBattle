import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HpBarComponent} from './hp-bar.component';

describe('HpBarComponent (barre de vie)', () => {
  let fixture: ComponentFixture<HpBarComponent>;

  function render(curr: number, base: number, showValue = true) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [HpBarComponent]});
    fixture = TestBed.createComponent(HpBarComponent);
    fixture.componentRef.setInput('CurrHP', curr);
    fixture.componentRef.setInput('BaseHP', base);
    fixture.componentRef.setInput('ShowValue', showValue);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const fill = (el: HTMLElement) => el.querySelector('.hp__fill') as HTMLElement;

  it('largeur proportionnelle aux PV restants', () => {
    expect(fill(render(30, 40)).style.width).toBe('75%');
    expect(fill(render(1, 3)).style.width).toMatch(/^33\.33/);
  });

  it('pleine et vide', () => {
    expect(fill(render(40, 40)).style.width).toBe('100%');
    expect(fill(render(0, 40)).style.width).toBe('0%');
  });

  it('ne déborde jamais (PV négatifs ou au-delà du max)', () => {
    expect(fill(render(-15, 40)).style.width).toBe('0%');
    expect(fill(render(60, 40)).style.width).toBe('100%');
  });

  it('couleur verte, jaune puis rouge', () => {
    expect(fill(render(21, 40)).classList).toContain('hp__fill--high');
    expect(fill(render(20, 40)).classList).toContain('hp__fill--mid');
    expect(fill(render(9, 40)).classList).toContain('hp__fill--mid');
    expect(fill(render(8, 40)).classList).toContain('hp__fill--low');
  });

  it('affiche les PV chiffrés (jamais négatifs) pour le joueur', () => {
    const el = render(-3, 40);
    expect(el.querySelector('.hp__value')?.textContent?.replace(/\s/g, '')).toBe('0/40');
  });

  it('cache les PV chiffrés de l’adversaire', () => {
    expect(render(10, 40, false).querySelector('.hp__value')).toBeNull();
  });

  it('PV max à 0 : barre vide sans erreur', () => {
    expect(fill(render(0, 0)).style.width).toBe('0%');
  });

  it('suit les variations de PV', () => {
    const el = render(40, 40);
    fixture.componentRef.setInput('CurrHP', 10);
    fixture.detectChanges();
    expect(fill(el).style.width).toBe('25%');
  });
});
