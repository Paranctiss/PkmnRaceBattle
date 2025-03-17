import { Component } from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {NgForOf, NgIf} from '@angular/common';
import {WildFightComponent} from './components/wild-fight/wild-fight.component';
import {PlayerModel, PokemonTeamModel} from '../../shared/models/player.model';
import {MyTeamComponent} from './components/my-team/my-team.component';
import {TrainerFightComponent} from './components/trainer-fight/trainer-fight.component';
import {PokeCenterComponent} from './components/poke-center/poke-center.component';

@Component({
  selector: 'app-game',
  imports: [
    NgIf,
    WildFightComponent,
    MyTeamComponent,
    TrainerFightComponent,
    PokeCenterComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  constructor(public hubService:HubService) {
  }

  turnType:string="";
  opponent!:PlayerModel;


  ngOnInit() {
    this.hubService.onGetPlayerResponse((response:PlayerModel) => {
      this.hubService.Player = response;
    })
    this.hubService.getCurrentUser()
    this.hubService.responseWildFight((wildOpponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "WildFight";
      this.opponent = wildOpponent;
      this.hubService.pending = false;
    });
    this.hubService.responseTrainerFight((trainerOpponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "TrainerFight";
      this.opponent = trainerOpponent;
      this.hubService.pending = false;
    });
    this.hubService.responsePokeCenter((player) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeCenter";
      this.hubService.pending = false;
    });
    this.hubService.getWildFight();
  }

  newTurn() {
    this.hubService.getWildFight();
  }
}
