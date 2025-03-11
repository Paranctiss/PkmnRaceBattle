export interface PokemonBaseModel{
  _id: string;
  id:number;
  name:string;
  nameFr:string;
  moves:PokemonMoveBaseModel[];
  baseHappiness:number;
  captureRate:number;
  sprites:PokemonSpritesModel;
  types:PokemonTypeModel[];
}

export interface PokemonMoveBaseModel{
  id:number;
  name:string;
  nameFr:string;
  accuracy:number;
  pp:number;
  power:number;
  priority:number;
  target:string;
  type:string;
  learnedAtLvl:number;
  learnMethod:string;
  statChanges:PokemonStatChangesModel[];
}

export interface PokemonStatChangesModel{
  changes:number;
  name:string;
}

export interface PokemonSpritesModel{
  backDefault:string;
  backFemale:string;
  backShiny:string;
  backShinyFemale:string;
  frontDefault:string;
  frontFemale:string;
  frontShiny:string;
  frontShinyFemale:string;
}

export interface PokemonTypeModel{
  slot:number;
  name:string;
}
