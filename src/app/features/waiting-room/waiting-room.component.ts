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
    if (!code) return;
    // navigator.clipboard n'existe qu'en contexte sécurisé (HTTPS / localhost) : repli sur execCommand sinon
    const copy = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(code).catch(() => this.copyWithSelection(code))
      : Promise.resolve(this.copyWithSelection(code));
    copy.then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 1500);
    });
  }

  private copyWithSelection(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  StartGame() {
    this.hubService.startGame(this.hubService.gameCode, this.checkedTimer, this.timerTime);
  }
}
