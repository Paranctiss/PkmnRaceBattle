import {Component, Input} from '@angular/core';
import {PokemonTeamModel} from '../../../../shared/models/player.model';
import {NgForOf, NgStyle} from '@angular/common';
import {TypeCardComponent} from '../../../../shared/components/type-card/type-card.component';
import {PokemonTypeService} from '../../../../core/services/PokemonType/pokemon-type.service';
import {HpBarComponent} from '../hp-bar/hp-bar.component';

@Component({
  selector: 'app-my-team',
  imports: [
    NgStyle,
    NgForOf,
    TypeCardComponent,
    HpBarComponent
  ],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css'
})
export class MyTeamComponent {
  @Input() Team!: PokemonTeamModel[];
  hovered: boolean = false;
  cardColor: string = "white";
    constructor(private typeService:PokemonTypeService) {
    }

  getColor(typeName:string): string {
      return this.typeService.getColorByType(typeName)
  }


}
