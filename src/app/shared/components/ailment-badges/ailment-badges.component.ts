import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {PokemonTeamModel} from '../../models/player.model';

// Badges de statut (paralysie, brûlure, poison, gel, sommeil)
@Component({
  selector: 'app-ailment-badges',
  imports: [NgIf],
  template: `
    <span *ngIf="pokemon.isParalyzed" class="status status--par" title="Paralysie">PAR</span>
    <span *ngIf="pokemon.isBurning" class="status status--brn" title="Brûlure">BRU</span>
    <span *ngIf="pokemon.isPoisoned" class="status status--psn" title="Poison">PSN</span>
    <span *ngIf="pokemon.isFrozen" class="status status--frz" title="Gel">GEL</span>
    <span *ngIf="pokemon.isSleeping > 0" class="status status--slp" title="Sommeil">DOR</span>
  `,
  styles: [`:host { display: inline-flex; gap: 4px; flex-wrap: wrap; }`]
})
export class AilmentBadgesComponent {
  @Input() pokemon!: PokemonTeamModel;
}
