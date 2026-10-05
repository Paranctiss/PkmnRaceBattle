import {Component, HostBinding, Input, OnChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {PokemonTeamModel} from '../../models/player.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';
import {HpBarComponent} from '../../../features/game/components/hp-bar/hp-bar.component';
import {AilmentBadgesComponent} from '../ailment-badges/ailment-badges.component';
import {TypeCardComponent} from '../type-card/type-card.component';

// Emplacement d'équipe façon écran "Pokémon" des jeux. Au survol, le fond prend la couleur du type principal.
@Component({
  selector: 'app-pokemon-slot',
  imports: [NgIf, NgForOf, HpBarComponent, AilmentBadgesComponent, TypeCardComponent],
  templateUrl: './pokemon-slot.component.html',
  styleUrl: './pokemon-slot.component.css'
})
export class PokemonSlotComponent implements OnChanges {
  @Input() pokemon!: PokemonTeamModel;
  // Pokémon actuellement au combat
  @Input() lead: boolean = false;
  // Grisé (ex. objet non utilisable sur ce Pokémon)
  @Input() dimmed: boolean = false;
  @Input() compact: boolean = false;
  @Input() showTypes: boolean = false;

  @HostBinding('style.--type-color') typeColor = '';
  @HostBinding('style.--type-text') typeText = '';

  constructor(private typeService: PokemonTypeService) {}

  get fainted(): boolean {
    return this.pokemon.currHp <= 0;
  }

  ngOnChanges(): void {
    const mainType = this.pokemon?.types?.[0]?.name ?? 'normal';
    this.typeColor = this.typeService.getColorByType(mainType);
    this.typeText = this.typeService.getTextColorByType(mainType);
  }
}
