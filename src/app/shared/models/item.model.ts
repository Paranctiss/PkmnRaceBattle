// Poches du sac (même valeurs que BagItem.Type côté serveur)
export type ItemPocket = 'potion' | 'ball' | 'ailment' | 'special';

export interface ItemModel {
  name: string;
  description: string;
  price: number;
  pocket: ItemPocket;
}
