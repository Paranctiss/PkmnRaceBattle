import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TimerComponent} from './timer.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';

describe('TimerComponent (minuteur)', () => {
  let fixture: ComponentFixture<TimerComponent>;
  let fake: FakeSignalRService;

  beforeEach(() => {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [TimerComponent], providers: provideTestingDefaults(fake)});
    fixture = TestBed.createComponent(TimerComponent);
    fixture.detectChanges();
  });

  const chip = () => fixture.nativeElement.querySelector('.timer') as HTMLElement | null;

  it('caché sans minuteur', () => {
    expect(chip()).toBeNull();
  });

  it('affiche le temps restant envoyé par le serveur', () => {
    fake.connection.emit('TimerUpdate', 299.4);
    fixture.detectChanges();
    expect(chip()?.querySelector('.timer__value')?.textContent).toBe('04:59');
    expect(chip()?.classList).not.toContain('timer--warning');
  });

  it('alerte sous 2 minutes puis sous 30 secondes', () => {
    fake.connection.emit('TimerUpdate', 100);
    fixture.detectChanges();
    expect(chip()?.classList).toContain('timer--warning');
    expect(chip()?.classList).not.toContain('timer--danger');
    fake.connection.emit('TimerUpdate', 20);
    fixture.detectChanges();
    expect(chip()?.classList).toContain('timer--danger');
  });

  it('disparaît à la fin du temps', () => {
    fake.connection.emit('TimerUpdate', 20);
    fake.connection.emit('TimerEnded', 'ABC123');
    fixture.detectChanges();
    expect(chip()).toBeNull();
  });
});
