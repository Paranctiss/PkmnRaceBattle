import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BattleFieldComponent} from '../battle-field/battle-field.component';
import {PlayerModel, PokemonTeamModel} from '../../../../shared/models/player.model';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';
import {WildFightComponent} from '../wild-fight/wild-fight.component';
import {NgIf} from '@angular/common';
import {HubService} from '../../../../core/services/Hub/hub.service';

@Component({
  selector: 'app-trainer-fight',
  imports: [
    WildFightComponent,
    NgIf
  ],
  templateUrl: './trainer-fight.component.html',
  styleUrl: './trainer-fight.component.css'
})
export class TrainerFightComponent {

  @Input() Foe!: PlayerModel;
  continuer:boolean = false;

  constructor(private hubService: HubService) {

  }

  ngOnInit() {
    this.hubService.onTrainerSwitchPokemon(response => {
      this.Foe = response;
      this.hubService.pending = false;
    })
    this.hubService.responseTrainerFight(responsePokemon => {
      this.continuer = false;
    })

  }

  nextPkmn() {

  }
}
