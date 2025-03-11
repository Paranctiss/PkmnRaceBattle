import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterSelectionComponent } from './starter-selection.component';

describe('StarterSelectionComponent', () => {
  let component: StarterSelectionComponent;
  let fixture: ComponentFixture<StarterSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarterSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarterSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
