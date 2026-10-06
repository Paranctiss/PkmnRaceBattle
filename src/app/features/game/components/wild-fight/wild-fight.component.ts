import {Component, Input, OnChanges, SimpleChanges, DestroyRef, inject} from '@angular/core';
import {PlayerModel, PokemonTeamModel, PokemonTeamMoveModel} from '../../../../shared/models/player.model';
import {BattleFieldComponent} from '../battle-field/battle-field.component';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';

@Component({
  selector: 'app-wild-fight',
  imports: [
    BattleFieldComponent
  ],
  templateUrl: './wild-fight.component.html',
  styleUrl: './wild-fight.component.css'
})
export class WildFightComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  @Input() Foe!: PlayerModel;
  TurnContext!:TurnContextModel;
  OnBoardPokemon!:PokemonTeamModel;
  constructor(private hubService: HubService) {
  }

  // Nouvel adversaire envoyé par le serveur (combat suivant) : le composant reste affiché
  // d'un combat à l'autre, on reprend donc le Pokémon du joueur tel que le serveur l'a
  // remis à zéro en fin de combat (attaque en deux tours, variations de stats…)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Foe'] && !changes['Foe'].firstChange) {
      this.OnBoardPokemon = this.hubService.Player.team[0];
    }
  }

  ngOnInit() {
    this.OnBoardPokemon = this.hubService.Player.team[0]
    this.destroyRef.onDestroy(this.hubService.onGetPlayerResponse(response => {
      this.OnBoardPokemon = response.team[0]
    }))
    this.destroyRef.onDestroy(this.hubService.onUseMoveResponse((turnContext:TurnContextModel) => {
      this.TurnContext = turnContext;
      this.TurnContext.player.index = 0;
    }));
    this.destroyRef.onDestroy(this.hubService.onUseItemResponse((turnContext:TurnContextModel, index) => {
      this.TurnContext = turnContext;
      this.TurnContext.player.index = index;
    }));
    this.destroyRef.onDestroy(this.hubService.onTurnFinished((updatedPlayer:PlayerModel, updatedOpponent:PlayerModel) => {
      this.hubService.Player = updatedPlayer;
      this.OnBoardPokemon = updatedPlayer.team[0]
      this.Foe = updatedOpponent;
      if(updatedOpponent.team[0].currHp > 0){
        this.hubService.pending=false;
      }
    }))
    this.destroyRef.onDestroy(this.hubService.onTrainerSwitchPokemon(response => {
      this.Foe = response;
      this.hubService.pending = false;
      // Le serveur a clos le combat contre le Pokémon K.O. (FinishFight) : on récupère
      // l'état remis à zéro du Pokémon du joueur (onGetPlayerResponse met à jour OnBoardPokemon)
      this.hubService.getCurrentUser();
    }))
  }

  onPkmnChanged(newValue:PokemonTeamModel) {
    this.hubService.Player.team[0] = newValue;
    this.OnBoardPokemon = newValue;
  }

  useMove(move: PokemonTeamMoveModel) {
    this.hubService.pending = true;
    this.hubService.useMove(this.OnBoardPokemon.id, move.nameFr, this.Foe._id, this.Foe.team[0].id, true, this.Foe.isPlayer)
  }

}
