import { Injectable } from '@angular/core';

interface TypeStyle {
  color: string;
  label: string;
  // Types clairs : texte foncé pour rester lisible
  darkText?: boolean;
}

// Couleurs historiques des types dans les jeux
const TYPE_STYLES: Record<string, TypeStyle> = {
  normal: { color: '#a8a878', label: 'Normal', darkText: true },
  fire: { color: '#f08030', label: 'Feu' },
  water: { color: '#6890f0', label: 'Eau' },
  electric: { color: '#f8d030', label: 'Électrik', darkText: true },
  grass: { color: '#78c850', label: 'Plante', darkText: true },
  ice: { color: '#98d8d8', label: 'Glace', darkText: true },
  fighting: { color: '#c03028', label: 'Combat' },
  poison: { color: '#a040a0', label: 'Poison' },
  ground: { color: '#e0c068', label: 'Sol', darkText: true },
  flying: { color: '#a890f0', label: 'Vol' },
  psychic: { color: '#f85888', label: 'Psy' },
  bug: { color: '#a8b820', label: 'Insecte', darkText: true },
  rock: { color: '#b8a038', label: 'Roche' },
  ghost: { color: '#705898', label: 'Spectre' },
  dragon: { color: '#7038f8', label: 'Dragon' },
  dark: { color: '#705848', label: 'Ténèbres' },
  steel: { color: '#b8b8d0', label: 'Acier', darkText: true },
  fairy: { color: '#ee99ac', label: 'Fée', darkText: true },
};

const FALLBACK: TypeStyle = { color: '#9c9a8c', label: '???', darkText: true };

@Injectable({
  providedIn: 'root'
})
export class PokemonTypeService {

  private style(type: string): TypeStyle {
    return TYPE_STYLES[(type ?? '').toLowerCase()] ?? FALLBACK;
  }

  getColorByType(type: string): string {
    return this.style(type).color;
  }

  getTextColorByType(type: string): string {
    return this.style(type).darkText ? '#1d2236' : '#ffffff';
  }

  getLabelByType(type: string): string {
    return this.style(type).label;
  }
}
