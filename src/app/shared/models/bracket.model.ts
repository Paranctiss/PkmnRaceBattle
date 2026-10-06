import {PlayerModel} from './player.model';

export interface BracketModel {
  _id: string;
  nbTurn: number;
  rounds:RoundModel[];
  players:PlayerModel[];
  champion?: string | null;
}

export interface RoundModel {
  roundNumber: number;
  playersInRace:string[];
}
