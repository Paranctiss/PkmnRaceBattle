import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {PokemonBaseModel} from '../../../shared/models/pokemon-base.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';
import {DecimalPipe, NgForOf} from '@angular/common';
import {TypeCardComponent} from '../../../shared/components/type-card/type-card.component';

@Component({
  selector: 'app-starter-card',
  imports: [
    TypeCardComponent,
    NgForOf,
    DecimalPipe
  ],
  templateUrl: './starter-card.component.html',
  styleUrl: './starter-card.component.css'
})
export class StarterCardComponent implements OnInit {
  @Input() Pokemon!: PokemonBaseModel;
  @Input() selectedPokemonId!: number;

  @HostBinding('style.--type-color') cardColor = '';
  @HostBinding('style.--type-text') textColor = '';

  constructor(private pokemonTypeService: PokemonTypeService) {}

  get selected(): boolean {
    return this.selectedPokemonId === this.Pokemon.id;
  }

  ngOnInit() {
    this.cardColor = this.pokemonTypeService.getColorByType(this.Pokemon.types[0].name);
    this.textColor = this.pokemonTypeService.getTextColorByType(this.Pokemon.types[0].name);
  }
}
