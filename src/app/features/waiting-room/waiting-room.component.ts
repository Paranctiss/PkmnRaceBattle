import {Component, DestroyRef, inject} from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {PlayerModel} from '../../shared/models/player.model';
import {NgForOf, NgIf} from '@angular/common';
import {TrainerCardComponent} from './trainer-card/trainer-card.component';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-waiting-room',
  imports: [
    NgForOf,
    NgIf,
    TrainerCardComponent,
    FormsModule
  ],
  templateUrl: './waiting-room.component.html',
  styleUrl: './waiting-room.component.css'
})
export class WaitingRoomComponent {
  private readonly destroyRef = inject(DestroyRef);
  constructor(
    private hubService: HubService,
    private router: Router) {
  }
  players: PlayerModel[] = [];
  myPlayer?:PlayerModel;
  checkedTimer: boolean=true;
  timerTime: number=5;
  readonly timerChoices = [5, 10, 15];
  copied: boolean = false;

    ngOnInit() {
      this.destroyRef.onDestroy(this.hubService.onResponsePlayersInRoom((players) => {
        this.players = players;
        this.myPlayer = players.find(x => x._id === this.hubService.userId)
      }))
      this.destroyRef.onDestroy(this.hubService.onUserJoined((username: string) => {
        this.hubService.getAllUsersByRoomID(this.hubService.gameCode)
      }))
      this.destroyRef.onDestroy(this.hubService.onStartedGame((gameCode:string) => {
        this.router.navigate(["/game"]);
      }))
      this.hubService.getAllUsersByRoomID(this.hubService.gameCode)
    }

  copyCode() {
    const code = this.myPlayer?.roomId;
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 1500);
    });
  }

  StartGame() {
    this.hubService.startGame(this.hubService.gameCode, this.checkedTimer, this.timerTime);
  }
}
