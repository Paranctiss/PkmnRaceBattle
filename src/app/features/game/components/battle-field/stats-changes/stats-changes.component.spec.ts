import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsChangesComponent } from './stats-changes.component';

describe('StatsChangesComponent', () => {
  let component: StatsChangesComponent;
  let fixture: ComponentFixture<StatsChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsChangesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
