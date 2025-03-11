import { Component } from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {NgForOf, NgIf} from '@angular/common';
import {WildFightComponent} from './components/wild-fight/wild-fight.component';
import {PlayerModel, PokemonTeamModel} from '../../shared/models/player.model';
import {MyTeamComponent} from './components/my-team/my-team.component';

@Component({
  selector: 'app-game',
  imports: [
    NgIf,
    WildFightComponent,
    MyTeamComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  constructor(public hubService:HubService) {
  }

  turnType:string="";
  wildPokemon!:PokemonTeamModel;


  ngOnInit() {
    this.hubService.onGetPlayerResponse((response:PlayerModel) => {
      this.hubService.Player = response;
    })
    this.hubService.getCurrentUser()
    this.hubService.responseWildFight((wildPokemon) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "WildFight";
      this.wildPokemon = wildPokemon;
      this.hubService.pending = false;
    });
    this.hubService.getWildFight();
  }

  newTurn() {
    this.hubService.getWildFight();
  }
}
