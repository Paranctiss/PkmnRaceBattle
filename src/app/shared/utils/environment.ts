// Informations d'affichage des maps du chemin (noms envoyés par le serveur : PlayerPathHelper)

export interface EnvironmentInfo {
  key: string;
  label: string;
  flavor: string;
  color: string;
}

const ENVIRONMENTS: Record<string, EnvironmentInfo> = {
  Plaine: { key: 'Plaine', label: 'Plaine', flavor: 'Hautes herbes à perte de vue.', color: '#7ec850' },
  Foret: { key: 'Foret', label: 'Forêt', flavor: 'Sous-bois touffus et feuillages épais.', color: '#3f9a4a' },
  Volcan: { key: 'Volcan', label: 'Volcan', flavor: 'Roche brûlante et coulées de lave.', color: '#e0603a' },
  Grotte: { key: 'Grotte', label: 'Grotte', flavor: 'Galeries sombres et éboulis.', color: '#8a7360' },
  Centrale: { key: 'Centrale', label: 'Centrale', flavor: 'Machines qui grésillent d’électricité.', color: '#e2b51f' },
  Eau: { key: 'Eau', label: 'Eau', flavor: 'Rivages et courants marins.', color: '#3a8fd8' },
  Shop: { key: 'Shop', label: 'Boutique', flavor: 'De quoi remplir ton sac.', color: '#3d7fd6' },
  Centre: { key: 'Centre', label: 'Centre Pokémon', flavor: 'Une pause pour soigner l’équipe.', color: '#f06c8f' },
};

const UNKNOWN: EnvironmentInfo = { key: 'Default', label: 'Départ', flavor: '', color: '#9a9a9a' };

// Tolère les variantes accentuées / anglaises ("Forêt", "Center")
export function normalizeEnvironmentName(name: string): string {
  const plain = (name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (plain.toLowerCase() === 'center') return 'Centre';
  return Object.keys(ENVIRONMENTS).find(k => k.toLowerCase() === plain.toLowerCase()) ?? plain;
}

export function getEnvironmentInfo(name: string): EnvironmentInfo {
  return ENVIRONMENTS[normalizeEnvironmentName(name)] ?? UNKNOWN;
}

export function isFightEnvironment(name: string): boolean {
  const key = normalizeEnvironmentName(name);
  return key !== 'Shop' && key !== 'Centre' && key in ENVIRONMENTS;
}
