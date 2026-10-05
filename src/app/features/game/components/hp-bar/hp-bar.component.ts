import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-hp-bar',
  imports: [NgIf],
  templateUrl: './hp-bar.component.html',
  styleUrl: './hp-bar.component.css'
})
export class HpBarComponent {
  @Input() BaseHP!: number;
  @Input() CurrHP!: number;
  @Input() ShowValue: boolean = false;

  get current(): number {
    return Math.max(0, this.CurrHP);
  }

  get percent(): number {
    if (!this.BaseHP) return 0;
    return Math.max(0, Math.min(100, (this.CurrHP / this.BaseHP) * 100));
  }

  get level(): 'high' | 'mid' | 'low' {
    if (this.percent > 50) return 'high';
    if (this.percent > 20) return 'mid';
    return 'low';
  }
}
