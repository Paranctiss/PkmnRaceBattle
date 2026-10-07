import { Injectable } from '@angular/core';
import {SignalRService} from '../SignalR/signal-r.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathPoint, PlayerModel, PokemonTeamModel, PokemonTeamMoveModel} from '../../../shared/models/player.model';
import {TurnContextModel} from '../../../shared/models/turn-context.model';
import {PokemonMoveBaseModel} from '../../../shared/models/pokemon-base.model';
import {BracketModel} from '../../../shared/models/bracket.model';

@Injectable({
  providedIn: 'root'
})
export class HubService {

  public gameCode: string = "";
  public userId: string = "";
  public pending:boolean = false;
  // Choix d'une capacité à oublier en attente (LearnMoveComponent) : le joueur ne peut pas agir
  public learningMove:boolean = false;
  public Player:PlayerModel = {
    _id: "",
    team: [],
    roomId: "",
    isHost: false,
    isPlayer: false,
    isTrainer: false,
    name:"",
    sprite:"",
    credits: 0,
    items: [],
    playerPath: {pathPoints: []},
    currentPath: {environmentName:"Plaine", x:1, y:1},
    mapFightCount: 0
  }
  public remainingSeconds: number = 0;
  public timerActive: boolean = false;

  constructor(public signalRService: SignalRService, private http: HttpClient) {
    console.log('HubService instance created', Math.random());
  }

  // Enregistre un écouteur SignalR et renvoie la fonction qui le retire : un composant détruit
  // doit l'appeler (DestroyRef.onDestroy), sinon il continue de réagir aux événements du serveur
  private listen(eventName: string, handler: (...args: any[]) => any): () => void {
    this.signalRService.connection.on(eventName, handler);
    return () => this.signalRService.connection.off(eventName, handler);
  }

  joinGame(userName: string, starterId:number, trainerSprite:string, roomCode: string) {
    this.signalRService.connection.invoke('JoinGame', userName, starterId, trainerSprite, roomCode).catch(err => console.error(err));
  }

  createGame(userName: string, starterId:number, trainerSprite:string) {
    this.signalRService.connection.invoke('CreateGame', userName, starterId, trainerSprite).catch(err => console.error(err));
  }

  onGameCreated(callback: (gameCode: string, userId:string) => void) {
    return this.listen('GameCreated', callback);
  }

  leaveGame(groupName: string, userName: string) {
    this.signalRService.connection.invoke('LeaveGame', groupName, userName).catch(err => console.error(err));
  }

  onUserJoined(callback: (userName: string) => void) {
    return this.listen('UserJoined', callback);
  }

  onJoinSuccess(callback: (gameCode: string, userId:string) => void) {
    return this.listen('JoinSuccess', callback);
  }

  onUserLeft(callback: (userName: string) => void) {
    return this.listen('UserLeft', callback);
  }

  getAllUsersByRoomID(roomId: string) {
    this.signalRService.connection.invoke('GetPlayersInRoom', roomId).catch(err => console.error(err));
  }
  getCurrentUser(){
    this.signalRService.connection.invoke('GetPlayer', this.userId).catch(err => console.error(err));
  }

  onGetPlayerResponse(callback: (response:PlayerModel) => void) {
    return this.listen('GetPlayerResponse', callback);
  }
  onResponsePlayersInRoom(callback: (responsePlayers: PlayerModel[]) => void) {
    return this.listen('ResponsePlayersInRoom', callback);
  }

  // multiXp / xpMultiplier : réglages d'XP de la partie (Multi Exp, XP normale / x2 / x5)
  startGame(gameCode: string, checkedTimer:boolean, timerTime:number, multiXp:boolean = true, xpMultiplier:number = 1) {
    this.signalRService.connection.invoke('StartGame', gameCode, checkedTimer, timerTime, multiXp, xpMultiplier).catch(err => console.error(err));
  }
  onStartedGame(callback:(gameCode:string) => void) {
    return this.listen('GameStarted', callback);
  }

  onTimerUpdate(callback: (remainingSeconds: number) => void) {
    return this.listen('TimerUpdate', (seconds: number) => {
      this.remainingSeconds = seconds;
      this.timerActive = true;
      callback(seconds);
    });
  }

  // Écouter la fin du timer
  onTimerEnded(callback: (gameCode: string) => void) {
    return this.listen('TimerEnded', (gameCode: string) => {
      this.timerActive = false;
      this.remainingSeconds = 0;
      callback(gameCode);
    });
  }

  // Formater le temps restant pour l'affichage (MM:SS)
  formatRemainingTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = Math.floor(this.remainingSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getNewTurn() {
    this.signalRService.connection.invoke('GetNewTurn', this.userId).catch(err => console.error(err));
  }

  onChooseNextPath(callback:(options:PathPoint[]) => void) {
    return this.listen('chooseNextPath', callback);
  }

  chooseNextPath(x:number, y:number) {
    this.signalRService.connection.invoke('ChooseNextPath', this.userId, x, y).catch(err => console.error(err));
  }

  getWildFight() {
    this.signalRService.connection.invoke('GetNewTurn', this.userId).catch(err => console.error(err));
  }

  getPvpFight() {
    this.signalRService.connection.invoke('GetPvpFight', this.gameCode, this.userId).catch(err => console.error(err));
  }

  buildTournament() {
    this.signalRService.connection.invoke('BuildTournament', this.gameCode).catch(err => console.error(err));
  }

  // Fin du tournoi : remet la salle à zéro côté serveur ; le joueur la rejoint ensuite avec un nouveau starter
  replayGame(): Promise<void> {
    this.pending = false;
    this.timerActive = false;
    this.remainingSeconds = 0;
    return this.signalRService.connection.invoke('ReplayGame', this.gameCode, this.userId).catch(err => console.error(err));
  }

  launchTournament() {
    this.signalRService.connection.invoke('LaunchTournament', this.gameCode).catch(err => console.error(err));
  }

  onTriggerTournament(callback:() => void) {
    return this.listen('triggerTournament', callback);
  }

  onBracketCreated(callback:(bracket:BracketModel)=> void){
    return this.listen('bracketCreated', callback);
  }

  onTrainerSwitchPokemon(callback:(responseTrainer:PlayerModel) => void) {
    return this.listen('onTrainerSwitchPokemon', callback);
  }

  responseWildFight(callback:(responsePokemon:PlayerModel, responsePlayer:PlayerModel) => void) {
    return this.listen('responseWildFight', callback);
  }

  responseTrainerFight(callback:(responsePokemon:PlayerModel) => void) {
    return this.listen('responseTrainerFight', callback);
  }

  responsePvpFight(callback:(responsePokemon:PlayerModel) => void) {
    return this.listen('responsePvpFight', callback);
  }

  responsePokeCenter(callback:(responsePokemon:PlayerModel) => void) {
    return this.listen('responsePokeCenter', callback);
  }

  responsePokeShop(callback:() => void) {
    return this.listen('responsePokeShop', callback);
  }

  healedPokeCenter(callback:(responsePokemon:PlayerModel) => void) {
    return this.listen('healedPokeCenter', callback);
  }

  usePokeCenter(){
    this.signalRService.connection.invoke('UsePokeCenter', this.userId).catch(err => console.error(err));
  }

  buyItem(itemName:string){
    this.signalRService.connection.invoke('BuyItem', this.userId, itemName).catch(err => console.error(err));
  }

  onBuyItemResponse(callback:(message:string, player:PlayerModel) => void) {
    return this.listen('onBuyItemResponse', callback);
  }

  useMove(playerPokemonId:string, usedMoveName:string, wildOpponentId:string, wildPokemonId:string, isAttacking:boolean, isPvp:boolean,  index:number = 0, skipTurn=false) {
    this.signalRService.connection.invoke('HandleMove', this.userId, playerPokemonId, usedMoveName, wildOpponentId, wildPokemonId, isAttacking, isPvp, index, skipTurn).catch(err => console.error(err));
  }

  onWaitingOpponent(callback:() => void) {
    return this.listen('waitingOpponent', callback);
  }

  onUseMoveResponse(callback:(turnContext:TurnContextModel) => void) {
    return this.listen('useMoveResult', callback);
  }
  onUseItemResponse(callback: (turnContext: TurnContextModel, index:number) => void) {
    return this.listen('useItemResult', callback);
  }

  onTurnFinished(callback: (updatedPlayer:PlayerModel, wildOpponent:PlayerModel) => void) {
    console.log("onTurnFinished");
    return this.listen('turnFinished', callback);
  }

  onLaunchBall(callback:(pokeballName:string, turnContext:TurnContextModel) => void) {
    return this.listen('launchBall', callback);
  }

  onCatchResult(callback:(catchValue:number) => void) {
    return this.listen('catchResult', callback);
  }

  onCaughtPokemon(callback:(opponent:PlayerModel) => void) {
    return this.listen('caughtPokemon', callback);
  }

  addPokemonToTeam(opponentId:string, index:number = 0){
    this.signalRService.connection.invoke('AddPokemonToTeam', this.userId, opponentId, index).catch(err => console.error(err));
  }

  onPlayerPokemonDeath(callback:(message:string) => void) {
    return this.listen('playerPokemonDeath', callback)
  }

  onPlayerLooseFight(callback:(message:string)=>void){
    return this.listen('playerLooseFight', callback)
  }

  onPokemonLevelUp(callback:(message:string, pokemon:PokemonTeamModel, movesToLearn:PokemonMoveBaseModel[]) => void) {
    return this.listen('pokemonLevelUp', callback);
  }

  replacePokemon(pokemonId:string, wildOpponentId:string, pvp:boolean){
    this.signalRService.connection.invoke('ReplacePokemon', this.userId, pokemonId, wildOpponentId, pvp).catch(err => console.error(err));
  }

  onReplacePokemon(callback:(pokemon:PokemonTeamModel, message:string) => void) {
    return this.listen('swapPokemon', callback);
  }

  learnMove(oldMoveId:number, newMoveId:number, pokemonId:string){
    this.signalRService.connection.invoke('LearnMove', oldMoveId, newMoveId, pokemonId, this.userId).catch(err => console.error(err));
  }

  onLearnedMove(callback:(player:PlayerModel) => void){
    return this.listen('moveLearned', callback);
  }

  deleteMove(moveId:number){
    this.signalRService.connection.invoke('DeleteMove', this.userId, moveId).catch(err => console.error(err));
  }

}
