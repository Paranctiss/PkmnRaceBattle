import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PokemonTeamMoveModel} from '../../../../../shared/models/player.model';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {HubService} from '../../../../../core/services/Hub/hub.service';

@Component({
  selector: 'app-pokemon-moves',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './pokemon-moves.component.html',
  styleUrl: './pokemon-moves.component.css'
})
export class PokemonMovesComponent {
  @Input() PokemonMoves!: PokemonTeamMoveModel[];
  @Input() DisabledMoves!: string[];
  @Output() PokemonMovesChange: EventEmitter<PokemonTeamMoveModel> = new EventEmitter();

  private hoverTimeout: any;

  constructor(private hubService: HubService) {}

  onMouseEnter(move: PokemonTeamMoveModel) {
    console.log("Mouse Enter");
    this.hoverTimeout = setTimeout(() => {
      console.log("hovered true");
      move.isHovered = true;
    }, 500);
  }

  onMouseLeave(move: PokemonTeamMoveModel) {
    console.log("Mouse leave");
    clearTimeout(this.hoverTimeout);
    move.isHovered = false;
  }

  useMove(PokemonMove: PokemonTeamMoveModel) {
    this.PokemonMovesChange.emit(PokemonMove);
  }

  delete(id: number) {
    this.hubService.deleteMove(id);
  }
}
