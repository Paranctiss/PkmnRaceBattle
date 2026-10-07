// PP restants / PP max (« 12/35 »), ou seulement les PP restants si le max est inconnu
export function ppLabel(move: {pp: number, maxPp?: number | null}): string {
  return move.maxPp ? `${move.pp}/${move.maxPp}` : `${move.pp}`;
}
