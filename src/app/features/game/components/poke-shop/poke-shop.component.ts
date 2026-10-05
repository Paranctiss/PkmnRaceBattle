import {Component} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {Subscription, take, timer} from 'rxjs';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {ItemModel, ItemPocket} from '../../../../shared/models/item.model';
import {PlayerModel} from '../../../../shared/models/player.model';
import {ITEM_CATALOG, ITEM_POCKETS, getItemSprite} from '../../../../shared/utils/items';
import {BagComponent} from '../bag/bag.component';
import {GameModalComponent} from '../../../../shared/components/game-modal/game-modal.component';
import {PixelIconComponent} from '../../../../shared/components/pixel-icon/pixel-icon.component';

@Component({
  selector: 'app-poke-shop',
  imports: [
    NgForOf,
    NgIf,
    BagComponent,
    GameModalComponent,
    PixelIconComponent,
  ],
  templateUrl: './poke-shop.component.html',
  styleUrl: './poke-shop.component.css'
})
export class PokeShopComponent {
  readonly pockets = ITEM_POCKETS;
  activePocket: ItemPocket = 'potion';
  hovered?: ItemModel;
  currentMessage: string | null = null;
  openBag: boolean = false;
  leaving: boolean = false;

  oldItem:string = "";
  count:number = 0;
  messageBoxSubscription!: Subscription;

  constructor(public hubService: HubService) {
  }

  ngOnInit() {
    this.hubService.onBuyItemResponse((item:string, player:PlayerModel) => {
      this.displayMessage(item)
      this.hubService.Player = player;
      this.hubService.pending = false;
    });
  }

  get shelfItems(): ItemModel[] {
    return ITEM_CATALOG.filter(item => item.pocket === this.activePocket);
  }

  // Texte du vendeur : achat récent, sinon description de l'objet survolé
  get clerkText(): string {
    if (this.currentMessage) return this.currentMessage;
    if (this.hovered) return `${this.hovered.name} — ${this.hovered.description}`;
    return 'Bienvenue ! Qu’est-ce qui vous ferait plaisir ?';
  }

  owned(name: string): number {
    return this.hubService.Player.items.find(item => item.name === name)?.number ?? 0;
  }

  sprite(name: string): string {
    return getItemSprite(name);
  }

  buyItem(item: ItemModel) {
    if(!this.hubService.pending && this.hubService.Player.credits >= item.price){
      this.hubService.pending = true;
      this.hubService.Player.credits -= item.price;
      this.hubService.buyItem(item.name);
    }
  }

  displayMessage(item: string) {
    if (item === this.oldItem) {
      this.count++;
    } else {
      this.count = 1;
      this.oldItem = item;
    }

    this.currentMessage = "Achat : " + item + " ×" + this.count + ". Merci beaucoup !";

    // Repart de zéro si un achat précédent est encore affiché
    if (this.messageBoxSubscription) {
      this.messageBoxSubscription.unsubscribe();
    }

    this.messageBoxSubscription = timer(2000).pipe(take(1)).subscribe(() => {
      this.currentMessage = null;
      this.count = 0;
      this.oldItem = "";
    });
  }

  nextTurn() {
    this.leaving = true;
    this.hubService.getNewTurn()
  }
}
