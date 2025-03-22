import { Component } from '@angular/core';
import {NgClass} from '@angular/common';
import {HubService} from '../../../../core/services/Hub/hub.service';

@Component({
  selector: 'app-timer',
  imports: [
    NgClass
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent {
  constructor(public hubService: HubService) { }

  ngOnInit(): void {
    this.setupTimerListeners();
  }

  ngOnDestroy(): void {
    // Nettoyage des listeners si nécessaire
  }

  setupTimerListeners(): void {
    this.hubService.onTimerUpdate((seconds: number) => {
      // La mise à jour de remainingSeconds est déjà gérée dans le service
      // Cette fonction peut être utilisée pour des logiques supplémentaires
    });

    this.hubService.onTimerEnded((gameCode: string) => {
      // Actions à effectuer lorsque le timer est terminé
      console.log('Le temps est écoulé!');
      // Par exemple, afficher une notification ou changer l'état du jeu
    });
  }

  isWarning(): boolean {
    // Afficher en jaune quand il reste moins de 2 minutes
    return this.hubService.remainingSeconds > 0 && this.hubService.remainingSeconds <= 120;
  }

  isDanger(): boolean {
    // Afficher en rouge quand il reste moins de 30 secondes
    return this.hubService.remainingSeconds > 0 && this.hubService.remainingSeconds <= 30;
  }
}
