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

  private apiUrl = "https://localhost:7165/gameHub";
  public gameCode: string = "";
  public userId: string = "";
  public pending:boolean = false;
  public Player:PlayerModel = {
    _id: "",
    team: [],
    roomId: "",
    isHost: false,
    name:"",
    sprite:"",
    credits: 0,
    items: []
  }

  constructor(private signalRService: SignalRService, private http: HttpClient) {}

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

  startGame(gameCode: string) {
    this.signalRService.connection.invoke('StartGame', gameCode).catch(err => console.error(err));
  }
  onStartedGame(callback:(gameCode:string) => void) {
    this.signalRService.connection.on('GameStarted', callback);
  }

  getNewTurn(userId:string) {
    this.signalRService.connection.invoke('GetNewTurn', userId).catch(err => console.error(err));
  }

  onNewTurn(callback:(turnType:string) => void) {
    this.signalRService.connection.on('NewTurn', callback);
  }

  getWildFight() {
    this.signalRService.connection.invoke('GetWildFight', this.userId).catch(err => console.error(err));
  }

  responseWildFight(callback:(responsePokemon:PokemonTeamModel) => void) {
    this.signalRService.connection.on('responseWildFight', callback);
  }

  useMove(playerPokemonId:string, usedMoveName:string, wildPokemonId:string, isAttacking:boolean) {
    this.signalRService.connection.invoke('UseMove', this.userId, playerPokemonId, usedMoveName, wildPokemonId, isAttacking).catch(err => console.error(err));
  }

  onUseMoveResponse(callback:(turnContext:TurnContextModel) => void) {
    this.signalRService.connection.on('useMoveResult', callback);
  }

  onTurnFinished(callback: (updatedPlayer:PlayerModel, wildPokemon:PokemonTeamModel) => void) {
    this.signalRService.connection.on('turnFinished', callback);
  }

  onLaunchBall(callback:(pokeballName:string, turnContext:TurnContextModel) => void) {
    this.signalRService.connection.on('launchBall', callback);
  }

  onCatchResult(callback:(catchValue:number) => void) {
    this.signalRService.connection.on('catchResult', callback);
  }

  onCaughtPokemon(callback:(pokemon:PokemonTeamModel) => void) {
    this.signalRService.connection.on('caughtPokemon', callback);
  }

  addPokemonToTeam(wildPokemonId:string, index:number = 0){
    this.signalRService.connection.invoke('AddPokemonToTeam', this.userId, wildPokemonId, index).catch(err => console.error(err));
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

  replacePokemon(pokemonId:string, wildPokemonId:string){
    this.signalRService.connection.invoke('ReplacePokemon', this.userId, pokemonId, wildPokemonId).catch(err => console.error(err));
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
