import {Component, isDevMode, DestroyRef, inject} from '@angular/core';
import {HubService} from '../../core/services/Hub/hub.service';
import {NgForOf, NgIf} from '@angular/common';
import {WildFightComponent} from './components/wild-fight/wild-fight.component';
import {PathPoint, PlayerModel} from '../../shared/models/player.model';
import {MyTeamComponent} from './components/my-team/my-team.component';
import {TrainerFightComponent} from './components/trainer-fight/trainer-fight.component';
import {PokeCenterComponent} from './components/poke-center/poke-center.component';
import {PokeShopComponent} from './components/poke-shop/poke-shop.component';
import {TimerComponent} from './components/timer/timer.component';
import {RouterLink} from '@angular/router';
import {BracketComponent} from './components/bracket/bracket.component';
import {BracketModel} from '../../shared/models/bracket.model';
import {ENVIRONMENTS, EnvironmentService} from '../../core/services/Environment/environment.service';
import {PathChoiceComponent} from './components/path-choice/path-choice.component';
import {LearnMoveComponent} from './components/learn-move/learn-move.component';
import {PixelIconComponent} from '../../shared/components/pixel-icon/pixel-icon.component';
import {EnvironmentInfo, getEnvironmentInfo, isFightEnvironment} from '../../shared/utils/environment';
import {levelRangeLabel} from '../../shared/utils/level-range';

// Nombre de combats sauvages par map avant le combat de dresseur (PlayerPathHelper.WildFightsPerMap côté serveur)
const WILD_FIGHTS_PER_MAP = 5;

@Component({
  selector: 'app-game',
  imports: [
    NgIf,
    WildFightComponent,
    MyTeamComponent,
    TrainerFightComponent,
    PokeCenterComponent,
    PokeShopComponent,
    TimerComponent,
    NgForOf,
    RouterLink,
    BracketComponent,
    PathChoiceComponent,
    LearnMoveComponent,
    PixelIconComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  private readonly destroyRef = inject(DestroyRef);
  TrainerContinue: boolean = false;

  constructor(public hubService:HubService, public environmentService:EnvironmentService) {
  }

  turnType:string="";
  opponent!:PlayerModel;
  bracket!:BracketModel;
  pathOptions:PathPoint[] = [];
  // Minuteur écoulé : les réponses de tour arrivées après (combat commencé avant la fin) sont ignorées,
  // seuls le tableau et les combats du tournoi peuvent encore changer l'écran
  raceOver = false;

  readonly devMode = isDevMode();
  readonly environments = ENVIRONMENTS;
  readonly wildFightsPerMap = WILD_FIGHTS_PER_MAP;
  readonly wildPips = Array.from({length: WILD_FIGHTS_PER_MAP}, (_, i) => i);

  ngOnInit() {
    this.destroyRef.onDestroy(this.hubService.onTurnFinished((updatedPlayer:PlayerModel, updatedOpponent:PlayerModel) => {
    }))
    this.destroyRef.onDestroy(this.hubService.onGetPlayerResponse((response:PlayerModel) => {
      this.hubService.Player = response;
    }))
    this.hubService.getCurrentUser()
    this.destroyRef.onDestroy(this.hubService.responseWildFight((wildOpponent, responsePlayer) => {
      if (this.raceOver) return;
      // Le serveur renvoie le joueur à jour (position sur la carte), y compris au premier combat
      this.hubService.Player = responsePlayer;
      this.turnType = "WildFight";
      this.opponent = wildOpponent;
      this.CheckEnvironment();
      this.hubService.pending = false;
    }));
    this.destroyRef.onDestroy(this.hubService.responseTrainerFight((trainerOpponent) => {
      if (this.raceOver) return;
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.TrainerContinue = false;
      this.turnType = "TrainerFight";
      this.opponent = trainerOpponent;
      this.TrainerContinue = false;
      this.CheckEnvironment();
      this.hubService.pending = false;
    }));
    this.destroyRef.onDestroy(this.hubService.responsePokeCenter((player) => {
      if (this.raceOver) return;
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeCenter";
      this.hubService.pending = false;
    }));
    this.destroyRef.onDestroy(this.hubService.responsePokeShop(() => {
      if (this.raceOver) return;
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeShop";
      this.hubService.pending = false;
    }));
    this.destroyRef.onDestroy(this.hubService.onChooseNextPath((options) => {
      if (this.raceOver) return;
      this.pathOptions = options;
      this.hubService.pending = true;
    }));
    this.destroyRef.onDestroy(this.hubService.onTimerEnded((gameCode: string) => {
      // Renvoyé aussi par le serveur quand un combat commencé avant la fin se termine :
      // on ne revient pas sur l'écran de fin si le tournoi a déjà commencé
      if (this.raceOver) return;
      this.raceOver = true;
      this.pathOptions = [];
      this.turnType = "Finito";
      // Équipe soignée par le serveur pour le tournoi
      this.hubService.getCurrentUser();
    }));
    this.destroyRef.onDestroy(this.hubService.responsePvpFight((opponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PvpFight";
      this.opponent = opponent;
      this.hubService.pending = false;
    }));
    this.destroyRef.onDestroy(this.hubService.onBracketCreated((bracket) => {
      this.turnType = "Bracket";
      this.bracket = bracket;
      // Après un duel, le serveur a soigné les deux équipes : afficher l'équipe à jour
      this.hubService.getCurrentUser();
    }))
    this.destroyRef.onDestroy(this.hubService.onTriggerTournament(() => {
      this.hubService.getPvpFight();
    }))
    this.hubService.getWildFight();
  }

  ChoosePath(option:PathPoint) {
    this.pathOptions = [];
    this.hubService.chooseNextPath(option.x, option.y);
  }

  get routeEnvironment(): string {
    return this.hubService.Player.currentPath?.environmentName ?? 'Default';
  }

  get routeInfo(): EnvironmentInfo {
    return getEnvironmentInfo(this.routeEnvironment);
  }

  get isFightMap(): boolean {
    return isFightEnvironment(this.routeEnvironment);
  }

  get fightCount(): number {
    return this.hubService.Player.mapFightCount ?? 0;
  }

  get showRoute(): boolean {
    return !!this.hubService.Player._id
      && this.routeEnvironment !== 'Default'
      && this.turnType !== 'Finito'
      && this.turnType !== 'Bracket'
      && this.turnType !== 'PvpFight';
  }

  // Palier de niveaux de la map courante
  get routeLevels(): string {
    return this.isFightMap ? levelRangeLabel(this.hubService.Player.currentPath) : '';
  }

  // Progression sur la map courante (miroir de PlayerPathHelper côté serveur)
  get routeStepLabel(): string {
    if (!this.isFightMap) return 'Halte';
    if (this.fightCount >= WILD_FIGHTS_PER_MAP) return 'Combat de dresseur';
    return `Combat sauvage ${this.fightCount + 1} / ${WILD_FIGHTS_PER_MAP}`;
  }

  // Écrans affichés au centre de la zone de jeu (hors combat)
  get isCenteredScreen(): boolean {
    return ['PokeCenter', 'PokeShop', 'Finito', 'Bracket', ''].includes(this.turnType)
      || (this.turnType === 'TrainerFight' && !this.TrainerContinue);
  }

  CheckEnvironment(){
    this.environmentService.setEnvironment(this.hubService.Player.currentPath.environmentName);
  }
}
