import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from '@angular/common';
import {PlayerModel} from '../../../../shared/models/player.model';

// Écran d'introduction d'un combat de dresseur
@Component({
  selector: 'app-trainer-fight',
  imports: [
    NgForOf
  ],
  templateUrl: './trainer-fight.component.html',
  styleUrl: './trainer-fight.component.css'
})
export class TrainerFightComponent {
  @Input() Foe!: PlayerModel;
  @Output() TrainerContinue = new EventEmitter<void>();
}
