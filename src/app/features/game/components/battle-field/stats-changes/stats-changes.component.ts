import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {PokemonTeamModel} from '../../../../../shared/models/player.model';

interface StatChange {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stats-changes',
  imports: [NgForOf],
  templateUrl: './stats-changes.component.html',
  styleUrl: './stats-changes.component.css'
})
export class StatsChangesComponent {
  @Input() Pokemon!: PokemonTeamModel;

  // Le Pokémon est modifié sur place pendant le combat : on recalcule à chaque vérification,
  // mais on renvoie le même tableau tant que les valeurs sont identiques. Un nouveau tableau
  // à chaque passage ferait recréer les éléments du *ngFor en boucle et figerait la page.
  private cacheKey = '';
  private cache: StatChange[] = [];

  get changes(): StatChange[] {
    const p = this.Pokemon;
    const values = [p.atkChanges, p.atkSpeChanges, p.defChanges, p.defSpeChanges, p.speedChanges];
    const key = values.join('|');
    if (key !== this.cacheKey) {
      const labels = ['Atq', 'Atq.S', 'Déf', 'Déf.S', 'Vit'];
      this.cacheKey = key;
      this.cache = values
        .map((value, i) => ({label: labels[i], value}))
        .filter(change => change.value);
    }
    return this.cache;
  }
}
