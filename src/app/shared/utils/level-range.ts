import {PathPoint} from '../models/player.model';

// Fourchette de niveaux d'une map de combat (palier de zone calculé par le serveur au lancement)
export function levelRangeLabel(point?: PathPoint | null): string {
  if (point?.minLevel == null || point.maxLevel == null) return '';
  return point.minLevel === point.maxLevel ? `Niv. ${point.minLevel}` : `Niv. ${point.minLevel} – ${point.maxLevel}`;
}
