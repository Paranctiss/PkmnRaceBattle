import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeShopComponent } from './poke-shop.component';

describe('PokeShopComponent', () => {
  let component: PokeShopComponent;
  let fixture: ComponentFixture<PokeShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
