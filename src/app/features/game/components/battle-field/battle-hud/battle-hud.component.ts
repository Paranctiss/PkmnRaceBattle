import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PokemonTeamModel} from '../../../../../shared/models/player.model';
import {HpBarComponent} from '../../hp-bar/hp-bar.component';
import {ExpBarComponent} from '../../exp-bar/exp-bar.component';
import {AilmentBadgesComponent} from '../../../../../shared/components/ailment-badges/ailment-badges.component';
import {StatsChangesComponent} from '../stats-changes/stats-changes.component';

// Encadré d'un combattant : nom, niveau, PV, statuts, et EXP (joueur) ou Poké Balls restantes (dresseur adverse)
@Component({
  selector: 'app-battle-hud',
  imports: [NgIf, NgForOf, HpBarComponent, ExpBarComponent, AilmentBadgesComponent, StatsChangesComponent],
  templateUrl: './battle-hud.component.html',
  styleUrl: './battle-hud.component.css'
})
export class BattleHudComponent {
  // Pokémon affiché au combat (éventuellement son clone)
  @Input() battler!: PokemonTeamModel;
  @Input() level!: number;
  @Input() side: 'foe' | 'ally' = 'foe';
  // Pokémon du joueur : affiche les PV chiffrés et l'expérience
  @Input() expPokemon?: PokemonTeamModel;
  // Équipe d'un dresseur adverse, pour les Poké Balls
  @Input() trainerTeam?: PokemonTeamModel[];
}
