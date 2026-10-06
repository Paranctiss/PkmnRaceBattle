import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {BagItemModel} from '../../../../shared/models/player.model';
import {ItemPocket} from '../../../../shared/models/item.model';
import {ITEM_POCKETS, getItemDescription} from '../../../../shared/utils/items';
import {BagItemComponent} from '../battle-field/bag-item/bag-item.component';

// Sac du joueur, rangé par poches comme dans les jeux
@Component({
  selector: 'app-bag',
  imports: [NgForOf, NgIf, BagItemComponent],
  templateUrl: './bag.component.html',
  styleUrl: './bag.component.css'
})
export class BagComponent {
  // Dernière poche consultée : le sac se rouvre dessus (le composant est recréé à chaque ouverture)
  static lastPocket: ItemPocket = 'potion';

  @Input() items: BagItemModel[] = [];
  // false : consultation seule (ex. depuis la boutique)
  @Input() selectable: boolean = true;
  @Output() itemSelected = new EventEmitter<BagItemModel>();

  readonly pockets = ITEM_POCKETS;
  activePocket: ItemPocket = BagComponent.lastPocket;
  hovered?: BagItemModel;

  get pocketItems(): BagItemModel[] {
    return this.items.filter(item => item.type === this.activePocket);
  }

  countIn(pocket: ItemPocket): number {
    return this.items
      .filter(item => item.type === pocket)
      .reduce((total, item) => total + Math.max(0, item.number), 0);
  }

  selectPocket(pocket: ItemPocket) {
    this.activePocket = BagComponent.lastPocket = pocket;
    this.hovered = undefined;
  }

  description(item: BagItemModel): string {
    return getItemDescription(item.name);
  }

  select(item: BagItemModel) {
    if (this.selectable) this.itemSelected.emit(item);
  }
}
