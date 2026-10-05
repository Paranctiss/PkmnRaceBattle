import {ItemModel, ItemPocket} from '../models/item.model';

export const ITEM_POCKETS: { key: ItemPocket; label: string }[] = [
  { key: 'potion', label: 'Soins' },
  { key: 'ball', label: 'Poké Balls' },
  { key: 'ailment', label: 'Statut' },
  { key: 'special', label: 'Objets rares' },
];

// Catalogue de la boutique (prix identiques à PlayerMongo.Items côté serveur)
export const ITEM_CATALOG: ItemModel[] = [
  { name: 'Potion', description: 'Restaure 20 PV d’un Pokémon.', price: 300, pocket: 'potion' },
  { name: 'Super Potion', description: 'Restaure 50 PV d’un Pokémon.', price: 700, pocket: 'potion' },
  { name: 'Hyper Potion', description: 'Restaure 120 PV d’un Pokémon.', price: 1500, pocket: 'potion' },
  { name: 'Potion Max', description: 'Restaure tous les PV d’un Pokémon.', price: 2500, pocket: 'potion' },
  { name: 'Guérison', description: 'Restaure tous les PV et soigne les problèmes de statut.', price: 3000, pocket: 'potion' },
  { name: 'Rappel', description: 'Ranime un Pokémon K.O. avec la moitié de ses PV.', price: 1500, pocket: 'potion' },
  { name: 'Rappel Max', description: 'Ranime un Pokémon K.O. avec tous ses PV.', price: 5000, pocket: 'potion' },
  { name: 'Pokeball', description: 'Permet de capturer un Pokémon sauvage.', price: 200, pocket: 'ball' },
  { name: 'Superball', description: 'Meilleur taux de capture que la Poké Ball.', price: 600, pocket: 'ball' },
  { name: 'Hyperball', description: 'Meilleur taux de capture que la Super Ball.', price: 1200, pocket: 'ball' },
  { name: 'Masterball', description: 'Capture à coup sûr n’importe quel Pokémon sauvage.', price: 10000, pocket: 'ball' },
  { name: 'Anti-Brûle', description: 'Soigne la brûlure d’un Pokémon.', price: 250, pocket: 'ailment' },
  { name: 'Anti-Para', description: 'Soigne la paralysie d’un Pokémon.', price: 200, pocket: 'ailment' },
  { name: 'Antidote', description: 'Soigne l’empoisonnement d’un Pokémon.', price: 100, pocket: 'ailment' },
  { name: 'Antigel', description: 'Dégèle un Pokémon.', price: 200, pocket: 'ailment' },
  { name: 'Réveil', description: 'Réveille un Pokémon endormi.', price: 200, pocket: 'ailment' },
  { name: 'Total Soin', description: 'Soigne tous les problèmes de statut.', price: 600, pocket: 'ailment' },
  { name: 'Pierre Eau', description: 'Fait évoluer certains Pokémon.', price: 2100, pocket: 'special' },
  { name: 'Pierre Feu', description: 'Fait évoluer certains Pokémon.', price: 2100, pocket: 'special' },
  { name: 'Pierre Foudre', description: 'Fait évoluer certains Pokémon.', price: 2100, pocket: 'special' },
  { name: 'Pierre Lune', description: 'Fait évoluer certains Pokémon.', price: 2100, pocket: 'special' },
  { name: 'Pierre Plante', description: 'Fait évoluer certains Pokémon.', price: 2100, pocket: 'special' },
  { name: 'Super Bonbon', description: 'Fait monter un Pokémon d’un niveau.', price: 5000, pocket: 'special' },
];

export function getItemDescription(name: string): string {
  return ITEM_CATALOG.find(item => item.name === name)?.description ?? '';
}

export function getItemSprite(name: string): string {
  return `assets/items-sprites/${name.replaceAll(' ', '_')}.png`;
}
