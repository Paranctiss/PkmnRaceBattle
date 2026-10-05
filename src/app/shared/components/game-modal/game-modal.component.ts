import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-game-modal',
  imports: [NgIf],
  templateUrl: './game-modal.component.html',
  styleUrl: './game-modal.component.css'
})
export class GameModalComponent {
  @Input() title: string = '';
  @Input() closable: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() accent: 'blue' | 'red' | 'gold' | 'center' | 'mart' = 'blue';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.closable) this.closed.emit();
  }

  onBackdrop(event: MouseEvent) {
    if (this.closable && event.target === event.currentTarget) this.closed.emit();
  }
}
