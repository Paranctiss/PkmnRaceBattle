import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildFightComponent } from './wild-fight.component';

describe('WildFightComponent', () => {
  let component: WildFightComponent;
  let fixture: ComponentFixture<WildFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WildFightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WildFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
