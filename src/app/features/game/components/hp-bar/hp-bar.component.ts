import {Component, Input} from '@angular/core';
import {DecimalPipe, NgStyle, PercentPipe} from '@angular/common';

@Component({
  selector: 'app-hp-bar',
  imports: [
    NgStyle,
    DecimalPipe,
    PercentPipe
  ],
  templateUrl: './hp-bar.component.html',
  styleUrl: './hp-bar.component.css'
})
export class HpBarComponent {
  @Input() BaseHP!: number;
  @Input() CurrHP!: number;

  getHpColor(currHP: number, baseHP: number): string {
    const percentage = (currHP / baseHP) * 100;
    if (percentage > 50) return 'green';
    if (percentage > 20) return 'orange';
    return 'red';
  }

}
