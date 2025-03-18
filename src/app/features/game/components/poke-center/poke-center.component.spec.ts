import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeCenterComponent } from './poke-center.component';

describe('PokeCenterComponent', () => {
  let component: PokeCenterComponent;
  let fixture: ComponentFixture<PokeCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
