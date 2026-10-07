export interface PlayerModel {
  _id:string;
  name:string;
  sprite:string;
  roomId:string;
  isHost:boolean;
  isPlayer:boolean;
  isTrainer:boolean;
  credits:number;
  team:PokemonTeamModel[];
  items:BagItemModel[];
  currentPath:PathPoint;
  playerPath:PlayerPath;
  mapFightCount:number;
  // Tours supplémentaires de la dernière map une fois le chemin terminé
  pathLoopCount?:number;
}

export interface PokemonTeamModel{
  id:string;
  idDex:number;
  name:string;
  nameFr:string;
  level:number;
  currXP:number;
  xpForNextLvl:number;
  xpFromLastLvl:number;
  baseHp:number;
  currHp:number;
  atk:number;
  atkChanges:number;
  atkSpe:number;
  atkSpeChanges:number;
  def:number;
  defChanges:number;
  defSpe:number;
  defSpeChanges:number;
  speed:number;
  speedChanges:number;
  isShiny:boolean;
  frontSprite:string;
  backSprite:string;
  isSleeping:number;
  isConfused:boolean;
  isBurning:boolean;
  isFrozen:boolean;
  isParalyzed:boolean;
  isPoisoned:boolean;
  untargetable?:string;
  waitingMoveTurns?:number;
  waitingMove?: PokemonTeamMoveModel;
  multiTurnsCount?:number;
  multiTurnsMove?: PokemonTeamMoveModel;
  types:PokemonTypeModel[];
  moves:PokemonTeamMoveModel[];
  cantUseMoves:string[];
  substitute:PokemonTeamModel;
  evolutionDetails:EvolutionDetailModel[];
}

export interface BagItemModel {
  name:string;
  number:number;
  type:string;
}

export interface PokemonTeamMoveModel {
  id:number;
  name:string;
  nameFr:string;
  accuracy:number;
  pp:number;
  // PP max (absent ou 0 pour une capacité enregistrée avant l'ajout du champ côté serveur)
  maxPp?:number;
  power:number;
  priority:number;
  target:string;
  type:string;
  damageType:string;
  flavorText:string;
  statsChanges:MoveStatsChangeModel[]
  isHovered:boolean;
  hover:boolean;
}

export interface MoveStatsChangeModel {
  changes:number;
  name:string;
}

export interface PokemonTypeModel{
  slot:number;
  name:string;
}

export interface EvolutionDetailModel{
  pokemonName?:string;
  minLevel?:number;
  evolutionTrigger?:string;
  item?:string;
}

export interface PlayerPath {
  pathPoints:PathPoint[];
}

export interface PathPoint {
  x:number;
  y:number;
  environmentName:string;
  isSkipped?:boolean;
  // Map de combat : niveau du premier sauvage et du Pokémon le plus fort du dresseur
  minLevel?:number|null;
  maxLevel?:number|null;
}
