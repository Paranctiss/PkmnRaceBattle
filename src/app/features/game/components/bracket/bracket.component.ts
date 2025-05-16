import {Component, Input} from '@angular/core';
import {BracketModel} from '../../../../shared/models/bracket.model';
import {NgForOf, NgIf} from '@angular/common';
import {using} from 'rxjs';
import {HubService} from '../../../../core/services/Hub/hub.service';

@Component({
  selector: 'app-bracket',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './bracket.component.html',
  styleUrl: './bracket.component.css'
})
export class BracketComponent {
  constructor(public hubService:HubService) {}
  @Input() bracket!: BracketModel;


  getSprite(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.sprite
  }

  getName(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.name
  }

  getTeam(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.team
  }

  protected readonly using = using;

  startTournament() {
    this.hubService.launchTournament();
  }
}
