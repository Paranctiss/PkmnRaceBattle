import { Component } from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {NgForOf, NgIf} from '@angular/common';
import {WildFightComponent} from './components/wild-fight/wild-fight.component';
import {PlayerModel, PokemonTeamModel} from '../../shared/models/player.model';
import {MyTeamComponent} from './components/my-team/my-team.component';
import {TrainerFightComponent} from './components/trainer-fight/trainer-fight.component';
import {PokeCenterComponent} from './components/poke-center/poke-center.component';
import {PokeShopComponent} from './components/poke-shop/poke-shop.component';
import {TimerComponent} from './components/timer/timer.component';
import {RouterLink} from '@angular/router';
import {BracketComponent} from './components/bracket/bracket.component';
import {BracketModel} from '../../shared/models/bracket.model';

@Component({
  selector: 'app-game',
  imports: [
    NgIf,
    WildFightComponent,
    MyTeamComponent,
    TrainerFightComponent,
    PokeCenterComponent,
    PokeShopComponent,
    TimerComponent,
    NgForOf,
    RouterLink,
    BracketComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  TrainerContinue: boolean = false;

  constructor(public hubService:HubService) {
  }

  turnType:string="";
  opponent!:PlayerModel;
  bracket!:BracketModel;

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
      this.TrainerContinue = false;
      this.turnType = "TrainerFight";
      this.opponent = trainerOpponent;
      this.TrainerContinue = false;
      this.hubService.pending = false;
    });
    this.hubService.responsePokeCenter((player) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeCenter";
      this.hubService.pending = false;
    });
    this.hubService.responsePokeShop(() => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeShop";
      this.hubService.pending = false;
    });
    this.hubService.onTimerEnded((gameCode: string) => {
      this.turnType = "Finito";
    });
    this.hubService.responsePvpFight((opponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PvpFight";
      this.opponent = opponent;
      this.hubService.pending = false;
    });
    this.hubService.onBracketCreated((bracket) => {
      this.turnType = "Bracket";
      this.bracket = bracket;
    })
    this.hubService.onTriggerTournament(() => {
      this.hubService.getPvpFight();
    })
    this.hubService.getWildFight();
  }

  newTurn() {
    this.hubService.getWildFight();
  }

  BackToMenu() {

  }
}
