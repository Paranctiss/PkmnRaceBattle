import {Component, Input} from '@angular/core';
import {PlayerModel} from '../../../shared/models/player.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-trainer-card',
  imports: [
    NgStyle
  ],
  templateUrl: './trainer-card.component.html',
  styleUrl: './trainer-card.component.css'
})
export class TrainerCardComponent {

  @Input() Player!:PlayerModel
  cardColor!: string;
  hovered: boolean = false;
  constructor(private typeService: PokemonTypeService) {
  }

  ngOnInit(): void {
    this.cardColor = this.typeService.getColorByType(this.Player.team[0].types[0].name);
  }
}
