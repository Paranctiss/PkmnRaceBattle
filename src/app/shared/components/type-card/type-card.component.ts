import {Component, Input} from '@angular/core';
import {PokemonTypeModel} from '../../models/pokemon-base.model';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-type-card',
  imports: [
    NgStyle
  ],
  templateUrl: './type-card.component.html',
  styleUrl: './type-card.component.css'
})
export class TypeCardComponent {
  @Input() Type!:PokemonTypeModel
  @Input() Size: string = '90px';

  ngOnInit(): void {

  }
}
