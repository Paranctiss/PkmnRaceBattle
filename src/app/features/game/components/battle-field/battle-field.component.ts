import {Component, EventEmitter, Input, Output, SimpleChanges, OnDestroy} from '@angular/core';
import {
  BagItemModel, EvolutionDetailModel,
  PlayerModel,
  PokemonTeamModel,
  PokemonTeamMoveModel
} from '../../../../shared/models/player.model';
import {PokemonMovesComponent} from './pokemon-moves/pokemon-moves.component';
import {NgForOf, NgIf} from '@angular/common';
import {take, timer} from 'rxjs';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PokemonMoveBaseModel} from '../../../../shared/models/pokemon-base.model';
import {MapComponent} from './map/map.component';
import {GameModalComponent} from '../../../../shared/components/game-modal/game-modal.component';
import {BagComponent} from '../bag/bag.component';
import {PokemonSlotComponent} from '../../../../shared/components/pokemon-slot/pokemon-slot.component';
import {PokemonTypeService} from '../../../../core/services/PokemonType/pokemon-type.service';
import {GroundedSpriteDirective} from '../../../../shared/directives/grounded-sprite.directive';
import {BattleHudComponent} from './battle-hud/battle-hud.component';

@Component({
  selector: 'app-battle-field',
  imports: [
    PokemonMovesComponent,
    NgIf,
    NgForOf,
    MapComponent,
    GameModalComponent,
    BagComponent,
    PokemonSlotComponent,
    GroundedSpriteDirective,
    BattleHudComponent,
  ],
  templateUrl: './battle-field.component.html',
  styleUrl: './battle-field.component.css'
})
export class BattleFieldComponent implements OnDestroy {
  @Input() OppositePokemon!: PokemonTeamModel;
  @Input() Opponent!:PlayerModel;
  @Input() PlayerPokemon!: PokemonTeamModel;
  @Input() TurnContext!: TurnContextModel;
  @Output() UsingMove: EventEmitter<PokemonTeamMoveModel> = new EventEmitter();
  @Output() PkmnPlayerChanged = new EventEmitter<PokemonTeamModel>();

  currentMessage: string | null = null;
  firstCall: boolean = true;
  catchingBall="";
  catchValue: number | null = null;
  isAnimating:boolean = false;
  openReplacePokemon: boolean = false;
  itemToUse?: BagItemModel;
  openBag: boolean = false;
  showLog: boolean = false;
  waitForReplaceByWildPokemon: boolean = false;
  openLearnMove:boolean = false;
  waitingOpponent: boolean = false;
  logs:string[] = [];
  openMap: boolean = false;
  movesToLearn:PokemonMoveBaseModel[][] = [];
  pokemonWantToLearn:PokemonTeamModel[] = [];

  // Add this to keep track of the event names we've subscribed to
  private signalREventHandlers: [string, (...args: any[]) => void][] = [];


  constructor(public hubService:HubService, private typeService: PokemonTypeService) {
  }

  // Le clone (Clonage) prend la place du Pokémon du joueur tant qu'il existe
  get allyBattler(): PokemonTeamModel {
    return this.PlayerPokemon.substitute ?? this.PlayerPokemon;
  }

  // Pokémon caché pendant une attaque en deux tours (Vol, Tunnel…)
  get allyVisible(): boolean {
    return this.PlayerPokemon.substitute != null || this.PlayerPokemon.untargetable == null;
  }

  get canAct(): boolean {
    return !this.hubService.pending && !this.openLearnMove && !this.openReplacePokemon && this.PlayerPokemon.waitingMove == null;
  }

  get hasCommandPanel(): boolean {
    return this.canAct || (this.PlayerPokemon.waitingMove != null && !this.hubService.pending);
  }

  get dialogText(): string {
    if (this.currentMessage) return this.currentMessage;
    if (this.waitingOpponent) return 'En attente de l’adversaire…';
    if (this.canAct) return `Que doit faire ${this.allyBattler.nameFr} ?`;
    return '…';
  }

  get replaceTitle(): string {
    if (this.waitForReplaceByWildPokemon) return 'Équipe complète';
    if (this.itemToUse) return this.itemToUse.name;
    return 'Changer de Pokémon';
  }

  get replaceHint(): string {
    if (this.waitForReplaceByWildPokemon) return `Quel Pokémon remplacer par ${this.OppositePokemon.nameFr} ?`;
    if (this.itemToUse) return `Sur quel Pokémon utiliser ${this.itemToUse.name} ?`;
    return 'Quel Pokémon envoyer au combat ?';
  }

  typeColor(type: string): string {
    return this.typeService.getColorByType(type);
  }

  typeText(type: string): string {
    return this.typeService.getTextColorByType(type);
  }

  ngOnInit(){
    // Register event handlers but track them so we can remove them later
    this.registerSignalREvent('launchBall', (pokeballName, turnContext) => {
      this.TurnContext = turnContext;
      this.catchingBall = pokeballName;
    });

    this.registerSignalREvent('catchResult', (catchValue:number) => {
      this.catchValue = catchValue;
      this.startBallAnimation();
    });

    this.registerSignalREvent('pokemonLevelUp', (message, pokemon, movesToLearn) => {
      if(message.includes("|")){
        var messages = message.split("|");
        // Peut arriver avant le premier résultat de tour (ex. Super Bonbon au premier tour)
        if (!this.TurnContext) {
          this.TurnContext = {actionName: '', messages: [], prioMessages: [],
            player: {hp: [], atk: 0, atkSpe: 0, def: 0, defSpe: 0, speed: 0, index: 0},
            opponent: {hp: [], atk: 0, atkSpe: 0, def: 0, defSpe: 0, speed: 0, index: 0}};
        }
        this.TurnContext.messages = messages;
        this.startDisplayingMessages();
      }else{
        this.displayMessage(message);
      }
      if(movesToLearn.length > 0){
        this.pokemonWantToLearn.push(pokemon);
        this.movesToLearn.push(movesToLearn);
        this.openLearnMove = true;
        this.hubService.pending = true;
      }
    });

    this.registerSignalREvent('moveLearned', player => {
      this.hubService.Player = player;
      this.PlayerPokemon = player.team[0]
      this.DismissLearn();
    });

    this.registerSignalREvent('caughtPokemon', caughtPokemon => {
      if(this.hubService.Player.team.length < 6){
        this.addPokemonToTeam(caughtPokemon);
      }else{
        this.openReplacePokemon = true;
        this.waitForReplaceByWildPokemon = true;
      }
    });

    this.registerSignalREvent('playerPokemonDeath', message => {
      this.hubService.pending = true;
      this.displayMessage(message)
      timer(1000).pipe(take(1)).subscribe(() => {
        this.openReplacePokemon = true;
      });
    });

    this.registerSignalREvent('playerLooseFight', message => {
      this.hubService.pending = true;
      this.displayMessage(message);
    });

    this.registerSignalREvent('swapPokemon', (pokemon, message) => {
      this.waitingOpponent = false;
      this.PlayerPokemon = pokemon;
      this.displayMessage(message);
    });

    this.registerSignalREvent('foeSwapPokemon', (pokemon, message) => {
      this.waitingOpponent = false;
      this.OppositePokemon = pokemon;
      this.displayMessage(message);
    })

    this.registerSignalREvent('waitingOpponent', () => {
      this.waitingOpponent = true;
      this.hubService.pending = true;
    });
    this.registerSignalREvent('useMoveResult', (turnContext:TurnContextModel) => {
      this.waitingOpponent = false;
    });
  }

  // Helper method to register SignalR events and track them
  private registerSignalREvent(eventName: string, callback: (...args: any[]) => void): void {
    this.signalREventHandlers.push([eventName, callback]);
    this.hubService.signalRService.connection.on(eventName, callback);
  }

  ngOnDestroy(): void {
    // Remove all SignalR event handlers when component is destroyed
    // Seulement les écouteurs de ce composant : le parent (wild-fight) écoute aussi useMoveResult
    this.signalREventHandlers.forEach(([eventName, callback]) => {
      this.hubService.signalRService.connection.off(eventName, callback);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['TurnContext'] && this.TurnContext) {
      this.TurnContext = changes['TurnContext'].currentValue;
      this.startDisplayingPrioMessages()
        .then(() => this.ChangesBoard())
        .then(() => this.startDisplayingPvChanges(this.TurnContext.player.hp, true, this.TurnContext.player.index))
        .then(() => this.startDisplayingPvChanges(this.TurnContext.opponent.hp, false, this.TurnContext.opponent.index))
        .then(() => this.startDisplayingMessages())
        .catch(error => console.error('Une erreur est survenue:', error));
    }
  }

  startDisplayingPrioMessages(): Promise<void> {
    return new Promise((resolve) => {
      const displayNextPrioMessage = () => {
        if (this.TurnContext.prioMessages.length > 0) {
          this.currentMessage = this.TurnContext.prioMessages.shift()!;
          this.logs.unshift(this.currentMessage)
          timer(1000).pipe(take(1)).subscribe(() => {
            this.currentMessage = null;
            displayNextPrioMessage();
          });
        } else {
          resolve();
        }
      };

      displayNextPrioMessage();
    });
  }

  startDisplayingMessages(): Promise<void> {
    return new Promise((resolve) => {
      const displayNextMessage = () => {
        if (this.TurnContext.messages.length > 0) {
          this.currentMessage = this.TurnContext.messages.shift()!;
          this.logs.unshift(this.currentMessage)
          timer(1000).pipe(take(1)).subscribe(() => {
            this.currentMessage = null;
            displayNextMessage();
          });
        } else {
          resolve();
        }
      };

      displayNextMessage();
    });
  }

  startDisplayingPvChanges(hpChanges:number[], player:boolean, index:number): Promise<void> {
    return new Promise((resolve) => {
      const displayNextPvChanges = () => {
        if (hpChanges.length > 0) {
          if(player) {
            if(index !== 0){
              this.hubService.Player.team[index].currHp -= hpChanges.shift()!;
            }else{
              if(this.PlayerPokemon.substitute !== null){
                this.PlayerPokemon.substitute.currHp -= hpChanges.shift()!;
              }else{
                this.PlayerPokemon.currHp -= hpChanges.shift()!;
              }
            }
          }else{
            if(this.OppositePokemon.substitute !== null){
              this.OppositePokemon.substitute.currHp -= hpChanges.shift()!;
            }else{
              this.OppositePokemon.currHp -= hpChanges.shift()!;
            }
          }
          timer(500).pipe(take(1)).subscribe(() => {
            displayNextPvChanges();
          });
        } else {
          resolve();
        }
      };
      displayNextPvChanges();
    });
  }

  private ChangesBoard(): Promise<void> {
    return new Promise((resolve) => {
      if(this.PlayerPokemon.substitute !== null){
        this.PlayerPokemon.substitute.atkChanges += this.TurnContext.player.atk;
        this.PlayerPokemon.substitute.atkSpeChanges += this.TurnContext.player.atkSpe;
        this.PlayerPokemon.substitute.defChanges += this.TurnContext.player.def;
        this.PlayerPokemon.substitute.defSpeChanges += this.TurnContext.player.defSpe;
        this.PlayerPokemon.substitute.speedChanges += this.TurnContext.player.speed;
      }else{
        this.PlayerPokemon.atkChanges += this.TurnContext.player.atk;
        this.PlayerPokemon.atkSpeChanges += this.TurnContext.player.atkSpe;
        this.PlayerPokemon.defChanges += this.TurnContext.player.def;
        this.PlayerPokemon.defSpeChanges += this.TurnContext.player.defSpe;
        this.PlayerPokemon.speedChanges += this.TurnContext.player.speed;
      }


      this.OppositePokemon.atkChanges += this.TurnContext.opponent.atk;
      this.OppositePokemon.atkSpeChanges += this.TurnContext.opponent.atkSpe;
      this.OppositePokemon.defChanges += this.TurnContext.opponent.def;
      this.OppositePokemon.defSpeChanges += this.TurnContext.opponent.defSpe;
      this.OppositePokemon.speedChanges += this.TurnContext.opponent.speed;

      resolve();
    });
  }


  startBallAnimation(): void {
    if(this.catchValue === null) return;
    let nbTilt:number = 0;
    if(this.catchValue >= 0){
      nbTilt = this.catchValue;
    }else{
      nbTilt = 3;
    }
    this.isAnimating = true;
    const delayBetweenShakes = 1000;
    for (let i = 0; i < nbTilt; i++) {
      setTimeout(() => {
        this.applyTiltAnimation(i % 2 === 0 ? 'left' : 'right');
      }, i * delayBetweenShakes);
    }
    if(this.catchValue !== -1){
      setTimeout(() => {
        this.catchingBall = "";
        this.catchValue = 0;
        this.isAnimating = false;
        this.displayMessage("Zebiiiiii " + this.OppositePokemon.nameFr + " s'est échappé !")
      }, this.catchValue * delayBetweenShakes);
    }else{
      setTimeout(() => {
        this.isAnimating = false;
        this.displayMessage("Tu as capturé " + this.OppositePokemon.nameFr + " !")
      }, 3 * delayBetweenShakes);
    }
  }

  displayMessage(message:string){
    this.currentMessage = message;
    this.logs.unshift(this.currentMessage)
    timer(2000).pipe(take(1)).subscribe(() => {
      this.currentMessage = null;
    });
  }

  applyTiltAnimation(direction: 'left' | 'right') {
    const pokeballElement = document.querySelector('.ballImg') as HTMLElement;
    if (pokeballElement) {
      pokeballElement.classList.remove('pokeball-tilt-left', 'pokeball-tilt-right');
      void pokeballElement.offsetWidth;
      pokeballElement.classList.add(direction === 'left' ? 'pokeball-tilt-left' : 'pokeball-tilt-right');
    }
  }

  addPokemonToTeam(opponent:PlayerModel, index:number = -1){
    this.hubService.addPokemonToTeam(opponent._id, index)
    this.displayMessage(opponent.team[0].nameFr + " a été ajouté à l'équipe !")
    this.catchValue = 0;
    this.catchingBall = "";
  }

  useMove($event: PokemonTeamMoveModel) {
    this.UsingMove.emit($event);
  }

  itemClicked(item:BagItemModel) {
    if(item.number > 0){
      this.openBag = false;
      this.hubService.pending = true;
      if(item.type !== "ball"){
        this.openReplacePokemon = true;
        this.itemToUse = item
      }else{
        this.hubService.useMove(this.PlayerPokemon.id, "item:"+item.name+":"+item.type, this.Opponent._id, this.OppositePokemon.id, true, this.Opponent.isPlayer)
      }

    }else{
      this.displayMessage("T'as pas de " + item.name + " t'es con ou quoi" )
    }
  }

  replacePokemon(pokemon: PokemonTeamModel, index:number) {
    if(!this.waitForReplaceByWildPokemon){
      if(this.itemToUse !== undefined){
        if(this.itemToUse.type === "special" && this.itemToUse.name !== "Super Bonbon" && !this.canEvolveWithItem(pokemon, this.itemToUse)) return
        let skip:boolean = false;
        if(this.itemToUse.type === "special") skip = true;
        this.hubService.useMove(this.PlayerPokemon.id, "item:"+this.itemToUse.name+":"+this.itemToUse.type, this.Opponent._id, this.OppositePokemon.id, true, this.Opponent.isPlayer, index, skip)
      }else{
        if(this.hubService.Player.team[0].id !== pokemon.id && pokemon.currHp > 0){
          this.hubService.replacePokemon(pokemon.id, this.Opponent._id, this.Opponent.isPlayer)
        }else{
          return;
        }
      }
    }else{
      this.waitForReplaceByWildPokemon = false;
      this.addPokemonToTeam(this.Opponent, index)
    }
    this.CloseReplacePokemon()
    this.hubService.pending = true;
  }

  ReplaceMoveBy(oldMoveId:number, newMoveId: number, pokemonId:string) {
    this.hubService.learnMove(oldMoveId, newMoveId, pokemonId);
  }

  DismissLearn() {
    this.movesToLearn[0].shift()
    if(this.movesToLearn[0].length === 0){
      this.movesToLearn.shift()
      this.pokemonWantToLearn.shift()
      if(this.movesToLearn.length === 0){
        this.openLearnMove = false;
        this.hubService.pending = false;
      }
    }
  }

  openBagDialog(){
    this.openBag = true;
  }

  CloseReplacePokemon() {
    this.itemToUse = undefined;
    this.openReplacePokemon = false;
    this.hubService.pending = false;
  }

  CloseMap() {
      this.openMap = false;
  }

  canEvolveWithItem(pokemon: any, item: BagItemModel | undefined): boolean {
    let itemName = item?.name;
    if(!itemName || itemName === "Super Bonbon" || item?.type !== "special") {
      return true;
    }
    if (!pokemon.evolutionDetails) {
      return false;
    }
    let stoneLabel = this.getStoneLabel(itemName);
    // Vérifier si au moins une évolution utilise cet item
    return pokemon.evolutionDetails.some(
      (evolution: EvolutionDetailModel) =>
        evolution.item === stoneLabel && evolution.evolutionTrigger === 'use-item'
    );
  }

  getStoneLabel(stoneName: string): string {
    switch(stoneName) {
      case "Pierre Feu":
        return "fire-stone";
      case "Pierre Eau":
        return "water-stone";
      case "Pierre Foudre":
        return "thunder-stone";
      case "Pierre Plante":
        return "leaf-stone";
      case "Pierre Lune":
        return "moon-stone";
    }
    return "coin";
  }

  OpenMap() {
    this.openMap = true;
  }

}
