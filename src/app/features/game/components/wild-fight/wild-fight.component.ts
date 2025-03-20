import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {PlayerModel, PokemonTeamModel, PokemonTeamMoveModel} from '../../../../shared/models/player.model';
import {BattleFieldComponent} from '../battle-field/battle-field.component';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {NgForOf} from '@angular/common';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';
import {resolve} from '@angular/compiler-cli';

@Component({
  selector: 'app-wild-fight',
  imports: [
    BattleFieldComponent
  ],
  templateUrl: './wild-fight.component.html',
  styleUrl: './wild-fight.component.css'
})
export class WildFightComponent {
  @Input() Foe!: PlayerModel;
  TurnConext!:TurnContextModel;
  OnBoardPokemon!:PokemonTeamModel;
  constructor(private hubService: HubService) {
  }

  ngOnInit() {
    this.OnBoardPokemon = this.hubService.Player.team[0]
    this.hubService.onGetPlayerResponse(response => {
      this.OnBoardPokemon = response.team[0]
    })
    this.hubService.onUseMoveResponse((turnContext:TurnContextModel) => {
      console.log(turnContext);
      this.TurnConext = turnContext;
      this.TurnConext.player.index = 0;
    });
    this.hubService.onUseItemResponse((turnContext:TurnContextModel, index) => {
      this.TurnConext = turnContext;
      this.TurnConext.player.index = index;
    });
    this.hubService.onTurnFinished((updatedPlayer:PlayerModel, updatedOpponent:PlayerModel) => {
      this.hubService.Player = updatedPlayer;
      this.OnBoardPokemon = updatedPlayer.team[0]
      this.Foe = updatedOpponent;
      this.hubService.pending=false;
    })
    this.hubService.onTrainerSwitchPokemon(response => {
      this.Foe = response;
      this.hubService.pending = false;
    })
  }

  onPkmnChanged(newValue:PokemonTeamModel) {
    this.hubService.Player.team[0] = newValue;
    this.OnBoardPokemon = newValue;
  }

  useMove(move: PokemonTeamMoveModel) {
    this.hubService.pending = true;
    console.log(this.Foe.team[0].nameFr)
    this.hubService.useMove(this.OnBoardPokemon.id, move.nameFr, this.Foe._id, this.Foe.team[0].id, true)
  }

}
