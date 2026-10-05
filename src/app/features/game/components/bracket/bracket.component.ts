import {Component, Input, OnChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {BracketModel} from '../../../../shared/models/bracket.model';
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
export class BracketComponent implements OnChanges {
  constructor(public hubService:HubService) {}

  @Input() bracket!: BracketModel;

  // Duels de chaque tour, calculés une seule fois (un nouveau tableau à chaque
  // détection de changements ferait recréer les éléments du *ngFor en boucle)
  rounds: string[][][] = [];

  ngOnChanges(): void {
    this.rounds = (this.bracket?.rounds ?? []).map(round => {
      const matches: string[][] = [];
      for (let i = 0; i < round.playersInRace.length; i += 2) {
        matches.push(round.playersInRace.slice(i, i + 2));
      }
      return matches;
    });
  }

  getSprite(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.sprite
  }

  getName(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.name
  }

  getTeam(userId:string){
    return this.bracket.players.find(s => s._id === userId)?.team
  }

  startTournament() {
    this.hubService.launchTournament();
  }
}
