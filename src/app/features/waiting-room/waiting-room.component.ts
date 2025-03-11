import { Component } from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {PlayerModel} from '../../shared/models/player.model';
import {NgForOf, NgIf} from '@angular/common';
import {TrainerCardComponent} from './trainer-card/trainer-card.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game',
  imports: [
    NgForOf,
    NgIf,
    TrainerCardComponent
  ],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent {
  constructor(
    private hubService: HubService,
    private router: Router) {
  }
  players: PlayerModel[] = [];
  myPlayer?:PlayerModel;

    ngOnInit() {
      this.hubService.onResponsePlayersInRoom((players) => {
        this.players = players;
        this.myPlayer = players.find(x => x._id === this.hubService.userId)
        console.log(players);
      })
      this.hubService.onUserJoined((username: string) => {
        this.hubService.getAllUsersByRoomID(this.hubService.gameCode)
      })
      this.hubService.onStartedGame((gameCode:string) => {
        this.router.navigate(["/game"]);
      })
      this.hubService.getAllUsersByRoomID(this.hubService.gameCode)
    }

  StartGame() {
    this.hubService.startGame(this.hubService.gameCode);
  }
}
