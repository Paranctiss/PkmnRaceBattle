import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {PokemonMovesComponent} from './pokemon-moves.component';
import {makeMove} from '../../../../../../testing/test-data';

describe('PokemonMovesComponent (capacités et actions)', () => {
  let fixture: ComponentFixture<PokemonMovesComponent>;
  let component: PokemonMovesComponent;
  const moves = [
    makeMove({nameFr: 'Griffe', type: 'normal', pp: 35}),
    makeMove({nameFr: 'Flammèche', type: 'fire', pp: 25, damageType: 'special', power: 40, accuracy: 100}),
    makeMove({nameFr: 'Rugissement', type: 'normal', damageType: 'status', power: 0, accuracy: 100}),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [PokemonMovesComponent]});
    fixture = TestBed.createComponent(PokemonMovesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('PokemonMoves', moves);
    fixture.componentRef.setInput('DisabledMoves', ['Rugissement']);
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(el().querySelectorAll('.move')) as HTMLButtonElement[];

  it('affiche chaque capacité avec son type et ses PP', () => {
    expect(buttons().map(b => b.querySelector('.move__name')?.textContent)).toEqual(['Griffe', 'Flammèche', 'Rugissement']);
    expect(buttons()[1].querySelector('.move__type')?.textContent).toBe('Feu');
    expect(buttons()[1].querySelector('.move__pp')?.textContent).toBe('PP 25');
  });

  it('PP restants sur PP max quand le max est connu', () => {
    fixture.componentRef.setInput('PokemonMoves', [{...moves[1], pp: 12, maxPp: 25}]);
    fixture.detectChanges();
    expect(buttons()[0].querySelector('.move__pp')?.textContent).toBe('PP 12/25');
  });

  it('cliquer une capacité l’envoie', () => {
    const spy = spyOn(component.PokemonMovesChange, 'emit');
    buttons()[1].click();
    expect(spy).toHaveBeenCalledWith(moves[1]);
  });

  it('une capacité sous Entrave est désactivée et n’est jamais envoyée', () => {
    const spy = spyOn(component.PokemonMovesChange, 'emit');
    expect(buttons()[2].disabled).toBeTrue();
    component.useMove(moves[2]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('une capacité sans PP est désactivée', () => {
    fixture.componentRef.setInput('PokemonMoves', [makeMove({nameFr: 'Charge', pp: 0}), makeMove({nameFr: 'Griffe', pp: 3})]);
    fixture.componentRef.setInput('DisabledMoves', []);
    fixture.detectChanges();
    expect(buttons()[0].disabled).toBeTrue();
    expect(buttons()[1].disabled).toBeFalse();
  });

  it('plus aucun PP : les capacités restent utilisables (le serveur lance Lutte)', () => {
    fixture.componentRef.setInput('PokemonMoves', [makeMove({nameFr: 'Charge', pp: 0}), makeMove({nameFr: 'Griffe', pp: 0})]);
    fixture.componentRef.setInput('DisabledMoves', []);
    fixture.detectChanges();
    expect(buttons().every(b => !b.disabled)).toBeTrue();
  });

  it('fiche détaillée après un survol prolongé', fakeAsync(() => {
    const wrap = el().querySelectorAll('.move-wrap')[1];
    wrap.dispatchEvent(new Event('mouseenter'));
    tick(500);
    fixture.detectChanges();
    const info = el().querySelector('.move-info');
    expect(info?.textContent).toContain('Spéciale');
    expect(info?.textContent).toContain('40');
    expect(info?.textContent).toContain('100 %');
    wrap.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(el().querySelector('.move-info')).toBeNull();
  }));

  it('boutons Sac, Pokémon et Carte', () => {
    const bag = spyOn(component.OpenedBag, 'emit');
    const change = spyOn(component.ChangePokemon, 'emit');
    const map = spyOn(component.OpenMapEmitter, 'emit');
    const actions = el().querySelectorAll('.action') as NodeListOf<HTMLButtonElement>;
    actions[0].click();
    actions[1].click();
    actions[2].click();
    expect(bag).toHaveBeenCalled();
    expect(change).toHaveBeenCalled();
    expect(map).toHaveBeenCalled();
  });
});
