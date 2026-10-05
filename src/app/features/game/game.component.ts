import {Component, isDevMode} from '@angular/core';
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
import {PixelIconComponent} from '../../shared/components/pixel-icon/pixel-icon.component';
import {EnvironmentInfo, getEnvironmentInfo, isFightEnvironment} from '../../shared/utils/environment';

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
    PixelIconComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  TrainerContinue: boolean = false;

  constructor(public hubService:HubService, public environmentService:EnvironmentService) {
  }

  turnType:string="";
  opponent!:PlayerModel;
  bracket!:BracketModel;
  pathOptions:PathPoint[] = [];

  readonly devMode = isDevMode();
  readonly environments = ENVIRONMENTS;
  readonly wildFightsPerMap = WILD_FIGHTS_PER_MAP;
  readonly wildPips = Array.from({length: WILD_FIGHTS_PER_MAP}, (_, i) => i);

  ngOnInit() {
    this.hubService.onTurnFinished((updatedPlayer:PlayerModel, updatedOpponent:PlayerModel) => {
    })
    this.hubService.onGetPlayerResponse((response:PlayerModel) => {
      this.hubService.Player = response;
    })
    this.hubService.getCurrentUser()
    this.hubService.responseWildFight((wildOpponent, responsePlayer) => {
      if(this.turnType !== "") this.hubService.Player = responsePlayer;
      this.turnType = "WildFight";
      this.opponent = wildOpponent;
      this.CheckEnvironment();
      this.hubService.pending = false;
    });
    this.hubService.responseTrainerFight((trainerOpponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.TrainerContinue = false;
      this.turnType = "TrainerFight";
      this.opponent = trainerOpponent;
      this.TrainerContinue = false;
      this.CheckEnvironment();
      this.hubService.pending = false;
    });
    this.hubService.responsePokeCenter((player) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeCenter";
      this.hubService.pending = false;
    });
    this.hubService.responsePokeShop(() => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PokeShop";
      this.hubService.pending = false;
    });
    this.hubService.onChooseNextPath((options) => {
      this.pathOptions = options;
      this.hubService.pending = true;
    });
    this.hubService.onTimerEnded((gameCode: string) => {
      this.pathOptions = [];
      this.turnType = "Finito";
    });
    this.hubService.responsePvpFight((opponent) => {
      if(this.turnType !== "") this.hubService.getCurrentUser()
      this.turnType = "PvpFight";
      this.opponent = opponent;
      this.hubService.pending = false;
    });
    this.hubService.onBracketCreated((bracket) => {
      this.turnType = "Bracket";
      this.bracket = bracket;
    })
    this.hubService.onTriggerTournament(() => {
      this.hubService.getPvpFight();
    })
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
      && this.turnType !== 'Bracket';
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
