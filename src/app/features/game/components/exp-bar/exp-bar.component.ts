import {Component, Input} from '@angular/core';
import {DecimalPipe, NgStyle, PercentPipe} from "@angular/common";

@Component({
  selector: 'app-exp-bar',
  imports: [
    PercentPipe,
    NgStyle
  ],
  templateUrl: './exp-bar.component.html',
  styleUrl: './exp-bar.component.css'
})
export class ExpBarComponent {

  @Input() BaseExp!: number;
  @Input() CurrExp!: number;
  @Input() NextLevelExp!: number;

  getExpPercentage(): number {
    // Vérifier si les données sont valides
    if (this.NextLevelExp <= this.BaseExp) {
      return 0;
    }

    // Calculer le pourcentage d'expérience actuelle par rapport à l'intervalle total
    const expRange = this.NextLevelExp - this.BaseExp;
    const currentProgress = this.CurrExp - this.BaseExp;

    // Limiter entre 0 et 1 pour des valeurs aberrantes
    return Math.max(0, Math.min(1, currentProgress / expRange));
  }
}
