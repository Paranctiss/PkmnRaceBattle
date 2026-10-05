import {Component, Input, OnChanges} from '@angular/core';
import {PokemonTypeModel} from '../../models/pokemon-base.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';

@Component({
  selector: 'app-type-card',
  imports: [],
  templateUrl: './type-card.component.html',
  styleUrl: './type-card.component.css'
})
export class TypeCardComponent implements OnChanges {
  @Input() Type!: PokemonTypeModel;
  // Largeur minimale du badge (ex. '90px'), en dessous de 70px le badge passe en petit format
  @Input() Size: string = '90px';

  label = '';
  color = '';
  textColor = '';
  small = false;

  constructor(private typeService: PokemonTypeService) {}

  ngOnChanges(): void {
    this.label = this.typeService.getLabelByType(this.Type.name);
    this.color = this.typeService.getColorByType(this.Type.name);
    this.textColor = this.typeService.getTextColorByType(this.Type.name);
    this.small = parseInt(this.Size, 10) < 70;
  }
}
