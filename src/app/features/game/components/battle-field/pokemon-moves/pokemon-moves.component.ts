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

  bagHovered: boolean = false;
  private hoverTimeout: any;

  constructor(private hubService: HubService) {}

  typeConfig: { [key: string]: {
      color: string;
      colorHover: string;
      colorText: string;
      colorBorder: string;
      colorBorderHover: string;
      icon: string;
    }} = {
    'fire': {
      color: 'rgba(251, 146, 60, 0.1)',
      colorHover: 'rgba(251, 146, 60, 0.15)',
      colorText: '#fed7aa',
      colorBorder: 'rgba(251, 146, 60, 0.1)',
      colorBorderHover: 'rgba(251, 146, 60, 0.3)',
      icon: '🔥'
    },
    'flying': {
      color: 'rgba(14, 165, 233, 0.1)',
      colorHover: 'rgba(14, 165, 233, 0.15)',
      colorText: '#bae6fd',
      colorBorder: 'rgba(14, 165, 233, 0.1)',
      colorBorderHover: 'rgba(14, 165, 233, 0.3)',
      icon: '💨'
    },
    'dragon': {
      color: 'rgba(99, 102, 241, 0.1)',
      colorHover: 'rgba(99, 102, 241, 0.15)',
      colorText: '#c7d2fe',
      colorBorder: 'rgba(99, 102, 241, 0.1)',
      colorBorderHover: 'rgba(99, 102, 241, 0.3)',
      icon: '✨'
    },
    'water': {
      color: 'rgba(59, 130, 246, 0.1)',
      colorHover: 'rgba(59, 130, 246, 0.15)',
      colorText: '#bfdbfe',
      colorBorder: 'rgba(59, 130, 246, 0.1)',
      colorBorderHover: 'rgba(59, 130, 246, 0.3)',
      icon: '💧'
    },
    'grass': {
      color: 'rgba(34, 197, 94, 0.1)',
      colorHover: 'rgba(34, 197, 94, 0.15)',
      colorText: '#bbf7d0',
      colorBorder: 'rgba(34, 197, 94, 0.1)',
      colorBorderHover: 'rgba(34, 197, 94, 0.3)',
      icon: '🌿'
    },
    'electric': {
      color: 'rgba(234, 179, 8, 0.1)',
      colorHover: 'rgba(234, 179, 8, 0.15)',
      colorText: '#fef08a',
      colorBorder: 'rgba(234, 179, 8, 0.1)',
      colorBorderHover: 'rgba(234, 179, 8, 0.3)',
      icon: '⚡'
    },
    'psychic': {
      color: 'rgba(236, 72, 153, 0.1)',
      colorHover: 'rgba(236, 72, 153, 0.15)',
      colorText: '#fbcfe8',
      colorBorder: 'rgba(236, 72, 153, 0.1)',
      colorBorderHover: 'rgba(236, 72, 153, 0.3)',
      icon: '🔮'
    },
    'fighting': {
      color: 'rgba(239, 68, 68, 0.1)',
      colorHover: 'rgba(239, 68, 68, 0.15)',
      colorText: '#fecaca',
      colorBorder: 'rgba(239, 68, 68, 0.1)',
      colorBorderHover: 'rgba(239, 68, 68, 0.3)',
      icon: '👊'
    },
    'ice': {
      color: 'rgba(96, 165, 250, 0.1)',
      colorHover: 'rgba(96, 165, 250, 0.15)',
      colorText: '#dbeafe',
      colorBorder: 'rgba(96, 165, 250, 0.1)',
      colorBorderHover: 'rgba(96, 165, 250, 0.3)',
      icon: '❄️'
    },
    'poison': {
      color: 'rgba(168, 85, 247, 0.1)',
      colorHover: 'rgba(168, 85, 247, 0.15)',
      colorText: '#e9d5ff',
      colorBorder: 'rgba(168, 85, 247, 0.1)',
      colorBorderHover: 'rgba(168, 85, 247, 0.3)',
      icon: '☠️'
    },
    'ground': {
      color: 'rgba(217, 119, 6, 0.1)',
      colorHover: 'rgba(217, 119, 6, 0.15)',
      colorText: '#fed7aa',
      colorBorder: 'rgba(217, 119, 6, 0.1)',
      colorBorderHover: 'rgba(217, 119, 6, 0.3)',
      icon: '⛰️'
    },
    'rock': {
      color: 'rgba(120, 113, 108, 0.1)',
      colorHover: 'rgba(120, 113, 108, 0.15)',
      colorText: '#d6d3d1',
      colorBorder: 'rgba(120, 113, 108, 0.1)',
      colorBorderHover: 'rgba(120, 113, 108, 0.3)',
      icon: '🪨'
    },
    'bug': {
      color: 'rgba(132, 204, 22, 0.1)',
      colorHover: 'rgba(132, 204, 22, 0.15)',
      colorText: '#d9f99d',
      colorBorder: 'rgba(132, 204, 22, 0.1)',
      colorBorderHover: 'rgba(132, 204, 22, 0.3)',
      icon: '🐛'
    },
    'ghost': {
      color: 'rgba(139, 92, 246, 0.1)',
      colorHover: 'rgba(139, 92, 246, 0.15)',
      colorText: '#ddd6fe',
      colorBorder: 'rgba(139, 92, 246, 0.1)',
      colorBorderHover: 'rgba(139, 92, 246, 0.3)',
      icon: '👻'
    },
    'steel': {
      color: 'rgba(148, 163, 184, 0.1)',
      colorHover: 'rgba(148, 163, 184, 0.15)',
      colorText: '#e2e8f0',
      colorBorder: 'rgba(148, 163, 184, 0.1)',
      colorBorderHover: 'rgba(148, 163, 184, 0.3)',
      icon: '⚙️'
    },
    'dark': {
      color: 'rgba(71, 85, 105, 0.1)',
      colorHover: 'rgba(71, 85, 105, 0.15)',
      colorText: '#cbd5e1',
      colorBorder: 'rgba(71, 85, 105, 0.1)',
      colorBorderHover: 'rgba(71, 85, 105, 0.3)',
      icon: '🌑'
    },
    'fairy': {
      color: 'rgba(244, 114, 182, 0.1)',
      colorHover: 'rgba(244, 114, 182, 0.15)',
      colorText: '#fbcfe8',
      colorBorder: 'rgba(244, 114, 182, 0.1)',
      colorBorderHover: 'rgba(244, 114, 182, 0.3)',
      icon: '🧚'
    },
    'normal': {
      color: 'rgba(163, 163, 163, 0.1)',
      colorHover: 'rgba(163, 163, 163, 0.15)',
      colorText: '#e5e5e5',
      colorBorder: 'rgba(163, 163, 163, 0.1)',
      colorBorderHover: 'rgba(163, 163, 163, 0.3)',
      icon: '⭐'
    },
    'statut': {
      color: 'rgba(64, 64, 64, 0.3)',
      colorHover: 'rgba(115, 115, 115, 0.3)',
      colorText: '#ffffff',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
      colorBorderHover: 'rgba(255, 255, 255, 0.2)',
      icon: '🔄'
    }
  };
  @Output() OpenedBag = new EventEmitter<unknown>();
  @Output() ChangePokemon = new EventEmitter<unknown>();

  getMoveStyles(type: string, isHover: boolean = false) {
    const config = this.typeConfig[type.toLowerCase()] || this.typeConfig['normal'];
    return {
      'background': isHover ? config.colorHover : config.color,
      'border-color': isHover ? config.colorBorderHover : config.colorBorder
    };
  }

  getTypeIcon(type: string): string {
    const config = this.typeConfig[type.toLowerCase()];
    return config ? config.icon : '⚫';
  }

  getTypeColor(type: string): string {
    const config = this.typeConfig[type.toLowerCase()];
    return config ? config.colorText : '#d4d4d4';
  }

  onMouseEnter(move: PokemonTeamMoveModel) {
    move.hover = true; // Pour l'effet hover immédiat
    this.hoverTimeout = setTimeout(() => {
      move.isHovered = true; // Pour l'info-box après 500ms
    }, 500);
  }

  onMouseLeave(move: PokemonTeamMoveModel) {
    move.hover = false;
    clearTimeout(this.hoverTimeout);
    move.isHovered = false;
  }

  useMove(PokemonMove: PokemonTeamMoveModel) {
    this.PokemonMovesChange.emit(PokemonMove);
  }

  openBagDialog(){
    this.OpenedBag.emit(true);
  }

  delete(id: number) {
    this.hubService.deleteMove(id);
  }

  openReplacePokemon() {
    this.ChangePokemon.emit(true);
  }
}
