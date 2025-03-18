import {booleanAttribute, Component} from '@angular/core';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {MyTeamComponent} from '../my-team/my-team.component';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {HpBarComponent} from '../hp-bar/hp-bar.component';

@Component({
  selector: 'app-poke-center',
  imports: [
    NgForOf,
    HpBarComponent,
    NgIf,
    NgStyle
  ],
  templateUrl: './poke-center.component.html',
  styleUrl: './poke-center.component.css'
})

export class PokeCenterComponent {
  constructor(public hubService: HubService) {
  }

  healed:boolean = false;

  ngOnInit() {
    this.hubService.healedPokeCenter((player) => {
      this.hubService.Player = player;
      this.healed = true;
      this.hubService.pending = false;
    })
  }

  usePokeCenter() {
    this.hubService.usePokeCenter();
    this.hubService.pending = true;
  }

  nextTurn() {
    this.hubService.getNewTurn()
  }
}
