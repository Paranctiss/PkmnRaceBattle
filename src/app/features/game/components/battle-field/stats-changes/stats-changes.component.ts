import {Component, Input} from '@angular/core';
import {PokemonTeamModel} from '../../../../../shared/models/player.model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-stats-changes',
  imports: [
    NgIf
  ],
  templateUrl: './stats-changes.component.html',
  styleUrl: './stats-changes.component.css'
})
export class StatsChangesComponent {
  @Input() Pokemon!: PokemonTeamModel;

}
