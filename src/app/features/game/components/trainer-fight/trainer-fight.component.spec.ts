import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerFightComponent } from './trainer-fight.component';

describe('TrainerFightComponent', () => {
  let component: TrainerFightComponent;
  let fixture: ComponentFixture<TrainerFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerFightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
