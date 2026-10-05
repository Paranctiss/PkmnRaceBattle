import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-exp-bar',
  imports: [],
  templateUrl: './exp-bar.component.html',
  styleUrl: './exp-bar.component.css'
})
export class ExpBarComponent {
  @Input() BaseExp!: number;
  @Input() CurrExp!: number;
  @Input() NextLevelExp!: number;

  getExpPercentage(): number {
    if (this.NextLevelExp <= this.BaseExp) {
      return 0;
    }
    // Progression dans l'intervalle du niveau courant, bornée entre 0 et 1
    const expRange = this.NextLevelExp - this.BaseExp;
    const currentProgress = this.CurrExp - this.BaseExp;
    return Math.max(0, Math.min(1, currentProgress / expRange));
  }
}
