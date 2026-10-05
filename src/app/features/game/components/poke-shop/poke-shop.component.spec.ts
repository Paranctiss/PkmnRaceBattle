import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {PokeShopComponent} from './poke-shop.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {makePlayer} from '../../../../../testing/test-data';
import {ITEM_CATALOG} from '../../../../shared/utils/items';

describe('PokeShopComponent (boutique)', () => {
  let fixture: ComponentFixture<PokeShopComponent>;
  let component: PokeShopComponent;
  let fake: FakeSignalRService;
  let hub: HubService;

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [PokeShopComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = 'player-1';
    hub.Player = makePlayer({credits: 1000});
    fixture = TestBed.createComponent(PokeShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const wares = () => Array.from(el().querySelectorAll('.ware')) as HTMLButtonElement[];
  const ware = (name: string) => wares().find(w => w.querySelector('.ware__name')?.textContent === name)!;
  const tab = (label: string) => (Array.from(el().querySelectorAll('.mart__tab')).find(t => t.textContent?.includes(label)) as HTMLButtonElement);

  it('rayon Soins par défaut avec les prix', () => {
    expect(wares().map(w => w.querySelector('.ware__name')?.textContent)).toEqual(ITEM_CATALOG.filter(i => i.pocket === 'potion').map(i => i.name));
    expect(ware('Potion').querySelector('.ware__price')?.textContent).toContain('300');
  });

  it('change de rayon', () => {
    tab('Poké Balls').click();
    fixture.detectChanges();
    expect(wares().map(w => w.querySelector('.ware__name')?.textContent)).toEqual(['Pokeball', 'Superball', 'Hyperball', 'Masterball']);
  });

  it('affiche le nombre d’exemplaires possédés', () => {
    expect(ware('Potion').querySelector('.ware__owned')?.textContent).toBe('×10');
    expect(ware('Potion Max').querySelector('.ware__owned')).toBeNull();
  });

  it('acheter : envoie BuyItem et débite tout de suite l’argent affiché', () => {
    ware('Potion').click();
    fixture.detectChanges();
    expect(fake.connection.lastInvocation('BuyItem')?.args).toEqual(['player-1', 'Potion']);
    expect(hub.Player.credits).toBe(700);
    expect(hub.pending).toBeTrue();
    expect(el().querySelector('.mart__sign .wallet')?.textContent).toContain('700');
  });

  it('pas assez d’argent : objet grisé et achat impossible', () => {
    expect(ware('Hyper Potion').classList).toContain('is-unaffordable');
    ware('Hyper Potion').click();
    expect(fake.connection.invoked('BuyItem').length).toBe(0);
    expect(hub.Player.credits).toBe(1000);
  });

  it('un seul achat à la fois tant que le serveur n’a pas répondu', () => {
    ware('Potion').click();
    ware('Potion').click();
    expect(fake.connection.invoked('BuyItem').length).toBe(1);
  });

  it('réponse du serveur : joueur mis à jour et message du vendeur', fakeAsync(() => {
    ware('Potion').click();
    fake.connection.emit('onBuyItemResponse', 'Potion', makePlayer({credits: 700}));
    fixture.detectChanges();
    expect(hub.pending).toBeFalse();
    expect(hub.Player.credits).toBe(700);
    expect(el().querySelector('.mart__clerk')?.textContent).toContain('Achat : Potion ×1');

    ware('Potion').click();
    fake.connection.emit('onBuyItemResponse', 'Potion', makePlayer({credits: 400}));
    fixture.detectChanges();
    expect(el().querySelector('.mart__clerk')?.textContent).toContain('Achat : Potion ×2');

    tick(2000);
    fixture.detectChanges();
    expect(el().querySelector('.mart__clerk')?.textContent).toContain('Bienvenue');
  }));

  it('description de l’objet survolé', () => {
    ware('Rappel').dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(el().querySelector('.mart__clerk')?.textContent).toContain('Ranime un Pokémon K.O.');
  });

  it('consulter le sac sans pouvoir utiliser d’objet', () => {
    (Array.from(el().querySelectorAll('button')).find(b => b.textContent?.includes('Sac')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('app-bag')).not.toBeNull();
  });

  it('quitter la boutique demande le tour suivant', () => {
    component.nextTurn();
    expect(fake.connection.lastInvocation('GetNewTurn')?.args).toEqual(['player-1']);
    expect(component.leaving).toBeTrue();
  });
});
