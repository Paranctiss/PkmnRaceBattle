import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {PlayerModel} from '../../../shared/models/player.model';
import {PokemonTypeService} from '../../../core/services/PokemonType/pokemon-type.service';

@Component({
  selector: 'app-trainer-card',
  imports: [NgIf],
  templateUrl: './trainer-card.component.html',
  styleUrl: './trainer-card.component.css'
})
export class TrainerCardComponent implements OnInit {
  @Input() Player!: PlayerModel;
  @Input() isMe: boolean = false;

  // Couleur du type du starter, utilisée au survol
  @HostBinding('style.--type-color') cardColor = '';
  @HostBinding('style.--type-text') textColor = '';

  constructor(private typeService: PokemonTypeService) {}

  ngOnInit(): void {
    const starterType = this.Player.team[0]?.types[0]?.name ?? 'normal';
    this.cardColor = this.typeService.getColorByType(starterType);
    this.textColor = this.typeService.getTextColorByType(starterType);
  }
}
