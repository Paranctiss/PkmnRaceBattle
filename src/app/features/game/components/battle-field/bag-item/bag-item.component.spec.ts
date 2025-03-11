import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BagItemComponent } from './bag-item.component';

describe('BagItemComponent', () => {
  let component: BagItemComponent;
  let fixture: ComponentFixture<BagItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BagItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BagItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
