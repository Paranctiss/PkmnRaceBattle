import {Component, SimpleChanges} from '@angular/core';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {HpBarComponent} from '../hp-bar/hp-bar.component';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {ItemModel} from '../../../../shared/models/item.model';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';
import {Subscription, take, timer} from 'rxjs';
import {BagItemModel, PlayerModel} from '../../../../shared/models/player.model';
import {BagItemComponent} from '../battle-field/bag-item/bag-item.component';

@Component({
  selector: 'app-poke-shop',
  imports: [
    NgForOf,
    NgIf,
    BagItemComponent,
    NgStyle,
  ],
  templateUrl: './poke-shop.component.html',
  styleUrl: './poke-shop.component.css'
})
export class PokeShopComponent {
  items:ItemModel[] = [
    { name: "Potion", description: "Redonne 20 PV au Pokémon", price: 300 },
    { name: "Super Potion", description: "Redonne 50 PV au Pokémon", price: 700 },
    { name: "Hyper Potion", description: "Redonne 120 PV au Pokémon", price: 1500 },
    { name: "Potion Max", description: "Redonne tous les PV au Pokémon", price: 2500 },
    { name: "Guérison", description: "Redonne tous les PV au Pokémon et soigne ses problèmes de status", price: 3000 },
    { name: "Rappel", description: "Redonne tous les PV au Pokémon et soigne ses problèmes de status", price: 1500 },
    { name: "Rappel Max", description: "Redonne tous les PV au Pokémon et soigne ses problèmes de status", price: 5000 },
    { name: "Pokeball", description: "Permet de capturer un Pokémon", price: 200 },
    { name: "Superball", description: "Ball au taux de réussite supérieur à la Poke Ball", price: 600 },
    { name: "Hyperball", description: "Ball au taux de réussite supérieur à la Super Ball", price: 1200 },
    { name: "Masterball", description: "Ball au taux de réussite supérieur à la Super Ball", price: 10000 },
    { name: "Anti-Brûle", description: "Soigne un Pokémon de la brûlure", price: 250 },
    { name: "Anti-Para", description: "Soigne un Pokémon de la paralysie", price: 200 },
    { name: "Antidote", description: "Soigne un Pokémon du poison", price: 100 },
    { name: "Antigel", description: "Soigne un Pokémon du gel", price: 200 },
    { name: "Réveil", description: "Réveil un Pokémon endormit", price: 200 },
    { name: "Total Soin", description: "Soigne tout problème de statut", price: 600 },
    { name: "Pierre Eau", description: "Fait évoluer certains Pokémon", price: 2100 },
    { name: "Pierre Feu", description: "Fait évoluer certains Pokémon", price: 2100 },
    { name: "Pierre Foudre", description: "Fait évoluer certains Pokémon", price: 2100 },
    { name: "Pierre Lune", description: "Fait évoluer certains Pokémon", price: 2100 },
    { name: "Pierre Plante", description: "Fait évoluer certains Pokémon", price: 2100 },
    { name: "Super Bonbon", description: "Donne un niveau supplémentaire au Pokémon", price: 5000 },
  ]

  currentMessage: string | null = null;
  openBag: boolean = false;
  balls!: BagItemModel[];
  potions!: BagItemModel[];
  ailments!: BagItemModel[];
  specials!: BagItemModel[];
  bagHovered: boolean = false;
  constructor(public hubService: HubService) {
  }

  ngOnInit() {
    this.hubService.onBuyItemResponse((item:string, player:PlayerModel) => {
      this.displayMessage(item)
      this.hubService.Player = player;
      this.hubService.pending = false;
    });
  }


  buyItem(item: ItemModel) {
    console.log(item);
    if(!this.hubService.pending && this.hubService.Player.credits >= item.price){
      this.hubService.pending = true;
      this.hubService.Player.credits -= item.price;
      this.hubService.buyItem(item.name);
    }
  }

  openBagDialog(){
    this.filterItems()
    this.openBag = true;
  }

  filterItems(){
    this.balls = this.hubService.Player.items.filter(item => item.type === "ball");
    this.potions = this.hubService.Player.items.filter(item => item.type === "potion");
    this.ailments = this.hubService.Player.items.filter(item => item.type === "ailment");
    this.specials = this.hubService.Player.items.filter(item => item.type === "special");
  }

  oldItem:string = "";
  count:number = 0;
  messageBoxSubscription!: Subscription;


  displayMessage(item: string) {
    if (item === this.oldItem) {
      this.count++;
    } else {
      this.count = 1;
      this.oldItem = item;
    }

    this.currentMessage = "Achat : " + item + " x" + this.count;

    // Annuler l'abonnement existant s'il existe
    if (this.messageBoxSubscription) {
      this.messageBoxSubscription.unsubscribe();
    }

    // Créer un nouvel abonnement
    this.messageBoxSubscription = timer(2000).pipe(take(1)).subscribe(() => {
      this.currentMessage = null;
      this.count = 0;
      this.oldItem = "";  // Réinitialiser oldItem à une chaîne vide
    });
  }

  nextTurn() {
    this.hubService.getNewTurn()
  }
}
