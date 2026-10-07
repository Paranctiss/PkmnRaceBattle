import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PokemonTeamMoveModel} from '../../../../../shared/models/player.model';
import {NgForOf, NgIf} from '@angular/common';
import {PokemonTypeService} from '../../../../../core/services/PokemonType/pokemon-type.service';
import {PixelIconComponent} from '../../../../../shared/components/pixel-icon/pixel-icon.component';
import {ppLabel} from '../../../../../shared/utils/pp';

const DAMAGE_TYPE_LABELS: Record<string, string> = {
  physical: 'Physique',
  special: 'Spéciale',
  status: 'Statut',
};

@Component({
  selector: 'app-pokemon-moves',
  imports: [
    NgForOf,
    NgIf,
    PixelIconComponent
  ],
  templateUrl: './pokemon-moves.component.html',
  styleUrl: './pokemon-moves.component.css'
})
export class PokemonMovesComponent {
  @Input() PokemonMoves!: PokemonTeamMoveModel[];
  @Input() DisabledMoves!: string[];
  @Output() PokemonMovesChange: EventEmitter<PokemonTeamMoveModel> = new EventEmitter();
  @Output() OpenedBag = new EventEmitter<unknown>();
  @Output() ChangePokemon = new EventEmitter<unknown>();
  @Output() OpenMapEmitter = new EventEmitter<unknown>();

  bagHovered: boolean = false;
  private hoverTimeout: any;

  constructor(private typeService: PokemonTypeService) {}

  isDisabled(move: PokemonTeamMoveModel): boolean {
    if (this.DisabledMoves?.includes(move.nameFr)) return true;
    // Sans PP la capacité est bloquée, sauf si plus aucune n'en a : le serveur utilise alors Lutte
    return move.pp <= 0 && (this.PokemonMoves ?? []).some(m => m.pp > 0);
  }

  typeColor(move: PokemonTeamMoveModel): string {
    return this.typeService.getColorByType(move.type);
  }

  typeText(move: PokemonTeamMoveModel): string {
    return this.typeService.getTextColorByType(move.type);
  }

  typeLabel(move: PokemonTeamMoveModel): string {
    return this.typeService.getLabelByType(move.type);
  }

  pp(move: PokemonTeamMoveModel): string {
    return ppLabel(move);
  }

  damageTypeLabel(move: PokemonTeamMoveModel): string {
    return DAMAGE_TYPE_LABELS[move.damageType?.toLowerCase()] ?? move.damageType ?? '—';
  }

  onMouseEnter(move: PokemonTeamMoveModel) {
    move.hover = true;
    // Fiche de la capacité après un court survol
    this.hoverTimeout = setTimeout(() => {
      move.isHovered = true;
    }, 500);
  }

  onMouseLeave(move: PokemonTeamMoveModel) {
    move.hover = false;
    clearTimeout(this.hoverTimeout);
    move.isHovered = false;
  }

  useMove(move: PokemonTeamMoveModel) {
    if (this.isDisabled(move)) return;
    this.PokemonMovesChange.emit(move);
  }

  openBagDialog() {
    this.OpenedBag.emit(true);
  }

  openReplacePokemon() {
    this.ChangePokemon.emit(true);
  }

  OpenMap() {
    this.OpenMapEmitter.emit(true);
  }
}
