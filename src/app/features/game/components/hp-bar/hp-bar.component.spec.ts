import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpBarComponent } from './hp-bar.component';

describe('HpBarComponent', () => {
  let component: HpBarComponent;
  let fixture: ComponentFixture<HpBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HpBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HpBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
