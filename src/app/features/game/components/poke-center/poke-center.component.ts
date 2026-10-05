import {Component} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PokemonSlotComponent} from '../../../../shared/components/pokemon-slot/pokemon-slot.component';
import {PixelIconComponent} from '../../../../shared/components/pixel-icon/pixel-icon.component';

@Component({
  selector: 'app-poke-center',
  imports: [
    NgForOf,
    NgIf,
    PokemonSlotComponent,
    PixelIconComponent
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
    this.hubService.pending = true;
    this.hubService.getNewTurn()
  }
}
