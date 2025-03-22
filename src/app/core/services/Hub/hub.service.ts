import { Injectable } from '@angular/core';
import {SignalRService} from '../SignalR/signal-r.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PlayerModel, PokemonTeamModel, PokemonTeamMoveModel} from '../../../shared/models/player.model';
import {TurnContextModel} from '../../../shared/models/turn-context.model';
import {PokemonMoveBaseModel} from '../../../shared/models/pokemon-base.model';

@Injectable({
  providedIn: 'root'
})
export class HubService {

  public gameCode: string = "";
  public userId: string = "";
  public pending:boolean = false;
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
    items: []
  }
  public remainingSeconds: number = 0;
  public timerActive: boolean = false;

  constructor(public signalRService: SignalRService, private http: HttpClient) {}

  joinGame(userName: string, starterId:number, trainerSprite:string, roomCode: string) {
    this.signalRService.connection.invoke('JoinGame', userName, starterId, trainerSprite, roomCode).catch(err => console.error(err));
  }

  createGame(userName: string, starterId:number, trainerSprite:string) {
    this.signalRService.connection.invoke('CreateGame', userName, starterId, trainerSprite).catch(err => console.error(err));
  }

  onGameCreated(callback: (gameCode: string, userId:string) => void) {
    this.signalRService.connection.on('GameCreated', callback);
  }

  leaveGame(groupName: string, userName: string) {
    this.signalRService.connection.invoke('LeaveGame', groupName, userName).catch(err => console.error(err));
  }

  onUserJoined(callback: (userName: string) => void) {
    this.signalRService.connection.on('UserJoined', callback);
  }

  onJoinSuccess(callback: (gameCode: string, userId:string) => void) {
    this.signalRService.connection.on('JoinSuccess', callback);
  }

  onUserLeft(callback: (userName: string) => void) {
    this.signalRService.connection.on('UserLeft', callback);
  }

  getAllUsersByRoomID(roomId: string) {
    this.signalRService.connection.invoke('GetPlayersInRoom', roomId).catch(err => console.error(err));
  }
  getCurrentUser(){
    this.signalRService.connection.invoke('GetPlayer', this.userId).catch(err => console.error(err));
  }

  onGetPlayerResponse(callback: (response:PlayerModel) => void) {
    this.signalRService.connection.on('GetPlayerResponse', callback);
  }
  onResponsePlayersInRoom(callback: (responsePlayers: PlayerModel[]) => void) {
    this.signalRService.connection.on('ResponsePlayersInRoom', callback);
  }

  startGame(gameCode: string, checkedTimer:boolean) {
    this.signalRService.connection.invoke('StartGame', gameCode, checkedTimer).catch(err => console.error(err));
  }
  onStartedGame(callback:(gameCode:string) => void) {
    this.signalRService.connection.on('GameStarted', callback);
  }

  onTimerUpdate(callback: (remainingSeconds: number) => void) {
    this.signalRService.connection.on('TimerUpdate', (seconds: number) => {
      this.remainingSeconds = seconds;
      this.timerActive = true;
      callback(seconds);
    });
  }

  // Écouter la fin du timer
  onTimerEnded(callback: (gameCode: string) => void) {
    this.signalRService.connection.on('TimerEnded', (gameCode: string) => {
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

  onNewTurn(callback:(turnType:string) => void) {
    this.signalRService.connection.on('NewTurn', callback);
  }

  getWildFight() {
    this.signalRService.connection.invoke('GetNewTurn', this.userId).catch(err => console.error(err));
  }

  onTrainerSwitchPokemon(callback:(responseTrainer:PlayerModel) => void) {
    this.signalRService.connection.on('onTrainerSwitchPokemon', callback);
  }

  responseWildFight(callback:(responsePokemon:PlayerModel) => void) {
    this.signalRService.connection.on('responseWildFight', callback);
  }

  responseTrainerFight(callback:(responsePokemon:PlayerModel) => void) {
    this.signalRService.connection.on('responseTrainerFight', callback);
  }

  responsePokeCenter(callback:(responsePokemon:PlayerModel) => void) {
    this.signalRService.connection.on('responsePokeCenter', callback);
  }

  responsePokeShop(callback:() => void) {
    this.signalRService.connection.on('responsePokeShop', callback);
  }

  healedPokeCenter(callback:(responsePokemon:PlayerModel) => void) {
    this.signalRService.connection.on('healedPokeCenter', callback);
  }

  usePokeCenter(){
    this.signalRService.connection.invoke('UsePokeCenter', this.userId).catch(err => console.error(err));
  }

  buyItem(itemName:string){
    this.signalRService.connection.invoke('BuyItem', this.userId, itemName).catch(err => console.error(err));
  }

  onBuyItemResponse(callback:(message:string, player:PlayerModel) => void) {
    this.signalRService.connection.on('onBuyItemResponse', callback);
  }

  useMove(playerPokemonId:string, usedMoveName:string, wildOpponentId:string, wildPokemonId:string, isAttacking:boolean, index:number = 0, skipTurn=false) {
    this.signalRService.connection.invoke('UseMove', this.userId, playerPokemonId, usedMoveName, wildOpponentId, wildPokemonId, isAttacking, index, skipTurn).catch(err => console.error(err));
  }

  onUseMoveResponse(callback:(turnContext:TurnContextModel) => void) {
    this.signalRService.connection.on('useMoveResult', callback);
  }
  onUseItemResponse(callback: (turnContext: TurnContextModel, index:number) => void) {
    this.signalRService.connection.on('useItemResult', callback);
  }

  onTurnFinished(callback: (updatedPlayer:PlayerModel, wildOpponent:PlayerModel) => void) {
    this.signalRService.connection.on('turnFinished', callback);
  }

  onLaunchBall(callback:(pokeballName:string, turnContext:TurnContextModel) => void) {
    this.signalRService.connection.on('launchBall', callback);
  }

  onCatchResult(callback:(catchValue:number) => void) {
    this.signalRService.connection.on('catchResult', callback);
  }

  onCaughtPokemon(callback:(opponent:PlayerModel) => void) {
    this.signalRService.connection.on('caughtPokemon', callback);
  }

  addPokemonToTeam(opponentId:string, index:number = 0){
    this.signalRService.connection.invoke('AddPokemonToTeam', this.userId, opponentId, index).catch(err => console.error(err));
  }

  finishFight(wildPokemonId:string){
    this.signalRService.connection.invoke('FinishFight', this.userId, wildPokemonId).catch(err => console.error(err));
  }

  onPlayerPokemonDeath(callback:(message:string) => void) {
    this.signalRService.connection.on('playerPokemonDeath', callback)
  }

  onPlayerLooseFight(callback:(message:string)=>void){
    this.signalRService.connection.on('playerLooseFight', callback)
  }

  onPokemonLevelUp(callback:(message:string, pokemon:PokemonTeamModel, movesToLearn:PokemonMoveBaseModel[]) => void) {
    this.signalRService.connection.on('pokemonLevelUp', callback);
  }

  replacePokemon(pokemonId:string, wildOpponentId:string){
    this.signalRService.connection.invoke('ReplacePokemon', this.userId, pokemonId, wildOpponentId).catch(err => console.error(err));
  }

  onReplacePokemon(callback:(pokemon:PokemonTeamModel, message:string) => void) {
    this.signalRService.connection.on('swapPokemon', callback);
  }

  learnMove(oldMoveId:number, newMoveId:number, pokemonId:string){
    this.signalRService.connection.invoke('LearnMove', oldMoveId, newMoveId, pokemonId, this.userId).catch(err => console.error(err));
  }

  onLearnedMove(callback:(player:PlayerModel) => void){
    this.signalRService.connection.on('moveLearned', callback);
  }

  deleteMove(moveId:number){
    this.signalRService.connection.invoke('DeleteMove', this.userId, moveId).catch(err => console.error(err));
  }

}
