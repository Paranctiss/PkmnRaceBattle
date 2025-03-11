import {Component, Input, numberAttribute} from '@angular/core';
import {PokemonBaseModel} from '../../../shared/models/pokemon-base.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';
import {NgForOf, NgStyle} from '@angular/common';
import {TypeCardComponent} from '../../../shared/components/type-card/type-card.component';

@Component({
  selector: 'app-starter-card',
  imports: [
    NgStyle,
    TypeCardComponent,
    NgForOf
  ],
  templateUrl: './starter-card.component.html',
  styleUrl: './starter-card.component.css'
})
export class StarterCardComponent {
  @Input() Pokemon!: PokemonBaseModel;
  @Input() selectedPokemonId!:number
  cardColor!: string;
  hovered: boolean = false;

  constructor(private pokemonTypeService: PokemonTypeService) {}

  ngOnInit() {
    this.cardColor = this.pokemonTypeService.getColorByType(this.Pokemon.types[0].name)
  }
}
