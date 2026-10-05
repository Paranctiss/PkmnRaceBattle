import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {PokemonTeamModel} from '../../../../shared/models/player.model';
import {PokemonSlotComponent} from '../../../../shared/components/pokemon-slot/pokemon-slot.component';

const TEAM_SIZE = 6;

@Component({
  selector: 'app-my-team',
  imports: [
    NgForOf,
    PokemonSlotComponent
  ],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css'
})
export class MyTeamComponent {
  @Input() Team!: PokemonTeamModel[];

  // Emplacements libres affichés en pointillés
  get emptySlots(): number[] {
    return Array.from({length: Math.max(0, TEAM_SIZE - (this.Team?.length ?? 0))}, (_, i) => i);
  }
}
