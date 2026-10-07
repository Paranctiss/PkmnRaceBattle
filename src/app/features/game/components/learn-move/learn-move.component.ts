import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PokemonTypeService} from '../../../../core/services/PokemonType/pokemon-type.service';
import {GameModalComponent} from '../../../../shared/components/game-modal/game-modal.component';
import {PokemonTeamModel} from '../../../../shared/models/player.model';
import {PokemonMoveBaseModel} from '../../../../shared/models/pokemon-base.model';
import {ppLabel} from '../../../../shared/utils/pp';

// Capacité affichée dans le choix : une capacité connue ou celle à apprendre
export interface LearnableMove {
  id: number;
  nameFr: string;
  type: string;
  pp: number;
  maxPp?: number | null;
  power?: number | null;
  accuracy?: number | null;
  damageType?: string | null;
  flavorText?: string | null;
}

interface PendingLearn {
  pokemon: PokemonTeamModel;
  moves: PokemonMoveBaseModel[];
}

const DAMAGE_TYPE_LABELS: Record<string, string> = {
  physical: 'Physique',
  special: 'Spéciale',
  status: 'Statut',
};

// Choix de la capacité à oublier quand un Pokémon qui en connaît déjà quatre veut en apprendre une.
// Placé dans l'écran de jeu (et pas dans le combat) : il survit au changement d'écran qui suit la fin
// du combat (annonce du dresseur, Centre, Boutique…), sinon la nouvelle capacité serait perdue.
@Component({
  selector: 'app-learn-move',
  imports: [NgForOf, NgIf, GameModalComponent],
  templateUrl: './learn-move.component.html',
  styleUrl: './learn-move.component.css'
})
export class LearnMoveComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  queue: PendingLearn[] = [];
  // Capacité connue dont la fiche est affichée (survol / focus) ; sinon celle à apprendre
  inspected: LearnableMove | null = null;

  constructor(public hubService: HubService, private typeService: PokemonTypeService) {}

  ngOnInit(): void {
    this.destroyRef.onDestroy(this.hubService.onPokemonLevelUp((_message, pokemon, movesToLearn) => {
      if (!movesToLearn?.length) return;
      this.queue.push({pokemon, moves: [...movesToLearn]});
      this.sync();
    }));
    this.destroyRef.onDestroy(this.hubService.onLearnedMove(player => {
      this.hubService.Player = player;
      this.next();
    }));
  }

  get current(): PendingLearn | undefined {
    return this.queue[0];
  }

  get newMove(): LearnableMove | undefined {
    return this.current?.moves[0];
  }

  get shownMove(): LearnableMove | undefined {
    return this.inspected ?? this.newMove;
  }

  inspect(move: LearnableMove | null) {
    this.inspected = move;
  }

  forget(oldMove: LearnableMove) {
    if (!this.current || !this.newMove) return;
    this.hubService.learnMove(oldMove.id, this.newMove.id, this.current.pokemon.id);
  }

  // Refus (ou capacité apprise) : capacité suivante du même Pokémon, puis Pokémon suivant
  next() {
    const current = this.current;
    if (!current) return;
    current.moves.shift();
    if (current.moves.length === 0) this.queue.shift();
    this.inspected = null;
    this.sync();
  }

  typeColor(move: LearnableMove): string {
    return this.typeService.getColorByType(move.type);
  }

  typeText(move: LearnableMove): string {
    return this.typeService.getTextColorByType(move.type);
  }

  typeLabel(move: LearnableMove): string {
    return this.typeService.getLabelByType(move.type);
  }

  // La capacité à apprendre arrive avec tous ses PP (PP de base de la capacité)
  pp(move: LearnableMove): string {
    return move === this.newMove ? `${move.pp}/${move.pp}` : ppLabel(move);
  }

  damageTypeLabel(move: LearnableMove): string {
    const key = move.damageType?.toLowerCase() ?? '';
    return DAMAGE_TYPE_LABELS[key] ?? move.damageType ?? '—';
  }

  // Tant qu'un choix est en attente, le joueur ne peut pas agir en combat
  private sync() {
    const learning = this.queue.length > 0;
    this.hubService.learningMove = learning;
    this.hubService.pending = learning;
  }
}
