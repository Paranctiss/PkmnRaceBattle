export interface TurnContextModel{
  actionName: string;
  opponent:PokemonChangesTurn;
  player:PokemonChangesTurn;
  messages:string[];
  prioMessages:string[];
}

export interface PokemonChangesTurn{
  hp: number[];
  atk: number;
  atkSpe: number;
  def: number;
  defSpe: number;
  speed:number;
}
