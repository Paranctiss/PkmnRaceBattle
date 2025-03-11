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
  @Input() PokemonFoe!: PokemonTeamModel;
  @Output() FoeIsDead = new EventEmitter<void>();
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
        this.TurnConext = turnContext;
    });
    this.hubService.onTurnFinished((updatedPlayer:PlayerModel, wildPokemon:PokemonTeamModel) => {
      this.hubService.Player = updatedPlayer;
      console.log(this.hubService.Player);
      this.OnBoardPokemon = updatedPlayer.team[0]
      this.PokemonFoe = wildPokemon;
      this.hubService.pending=false;
    })
  }

  onPkmnChanged(newValue:PokemonTeamModel) {
    this.hubService.Player.team[0] = newValue;
    this.OnBoardPokemon = newValue;
  }

  useMove(move: PokemonTeamMoveModel) {
    this.hubService.pending = true;
    this.hubService.useMove(this.OnBoardPokemon.id, move.nameFr, this.PokemonFoe.id, true)
  }

}
