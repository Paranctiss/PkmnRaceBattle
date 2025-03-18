import {Component, EventEmitter, Input, Output, SimpleChanges, OnDestroy} from '@angular/core';
import {
  BagItemModel,
  PlayerModel,
  PokemonTeamModel,
  PokemonTeamMoveModel
} from '../../../../shared/models/player.model';
import {PokemonMovesComponent} from './pokemon-moves/pokemon-moves.component';
import {HpBarComponent} from '../hp-bar/hp-bar.component';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {StatsChangesComponent} from './stats-changes/stats-changes.component';
import {interval, take, timer} from 'rxjs';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';
import {resolve} from '@angular/compiler-cli';
import {BagItemComponent} from './bag-item/bag-item.component';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PokemonMoveBaseModel} from '../../../../shared/models/pokemon-base.model';

@Component({
  selector: 'app-battle-field',
  imports: [
    PokemonMovesComponent,
    HpBarComponent,
    NgIf,
    StatsChangesComponent,
    BagItemComponent,
    NgForOf,
    NgStyle,
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
  waitForReplaceByWildPokemon: boolean = false;
  openLearnMove:boolean = false;
  logs:string[] = [];
  movesToLearn:PokemonMoveBaseModel[][] = [];
  pokemonWantToLearn:PokemonTeamModel[] = [];

  // Add this to keep track of the event names we've subscribed to
  private signalREventNames: string[] = [];

  constructor(public hubService:HubService) {
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
      this.PlayerPokemon = pokemon;
      this.displayMessage(message);
    });
  }

  // Helper method to register SignalR events and track them
  private registerSignalREvent(eventName: string, callback: (...args: any[]) => void): void {
    this.signalREventNames.push(eventName);
    this.hubService.signalRService.connection.on(eventName, callback);
  }

  ngOnDestroy(): void {
    // Remove all SignalR event handlers when component is destroyed
    this.signalREventNames.forEach(eventName => {
      this.hubService.signalRService.connection.off(eventName);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['TurnContext'] && this.TurnContext) {
      console.log("TurnContextChanged !")
      console.log(this.TurnContext)
      this.TurnContext = changes['TurnContext'].currentValue;
      this.startDisplayingPrioMessages()
        .then(() => this.ChangesBoard())
        .then(() => this.startDisplayingPvChanges(this.TurnContext.player.hp, true))
        .then(() => this.startDisplayingPvChanges(this.TurnContext.opponent.hp, false))
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
          console.log(this.currentMessage);
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

  startDisplayingPvChanges(hpChanges:number[], player:boolean): Promise<void> {
    return new Promise((resolve) => {
      const displayNextPvChanges = () => {
        if (hpChanges.length > 0) {
          if(player) {
            if(this.PlayerPokemon.substitute !== null){
              this.PlayerPokemon.substitute.currHp -= hpChanges.shift()!;
            }else{
              this.PlayerPokemon.currHp -= hpChanges.shift()!;
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
      this.hubService.pending = true;
      this.hubService.useMove(this.PlayerPokemon.id, "item:"+item.name, this.Opponent._id, this.OppositePokemon.id, true)
    }else{
      this.displayMessage("T'as plus de " + item.name + " t'es con ou quoi" )
    }
  }

  replacePokemon(pokemon: PokemonTeamModel, index:number) {
    if(!this.waitForReplaceByWildPokemon){
      if(this.hubService.Player.team[0].id !== pokemon.id && pokemon.currHp > 0){
        this.openReplacePokemon = false;
        this.hubService.pending = true;
        this.hubService.replacePokemon(pokemon.id, this.Opponent._id)
      }
    }else{
      this.openReplacePokemon = false;
      this.addPokemonToTeam(this.Opponent, index)
    }
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
}
