import {
  BagItemModel,
  PathPoint,
  PlayerModel,
  PokemonTeamModel,
  PokemonTeamMoveModel
} from '../app/shared/models/player.model';
import {PokemonChangesTurn, TurnContextModel} from '../app/shared/models/turn-context.model';
import {PokemonBaseModel} from '../app/shared/models/pokemon-base.model';

// Fabriques de données au format envoyé par le serveur (camelCase)

export function makeMove(overrides: Partial<PokemonTeamMoveModel> = {}): PokemonTeamMoveModel {
  return {
    id: 33,
    name: 'tackle',
    nameFr: 'Charge',
    accuracy: 100,
    pp: 35,
    power: 40,
    priority: 0,
    target: 'selected-pokemon',
    type: 'normal',
    damageType: 'physical',
    flavorText: 'Le lanceur charge l’ennemi.',
    statsChanges: [],
    isHovered: false,
    hover: false,
    ...overrides,
  };
}

let pokemonCounter = 0;

export function makePokemon(overrides: Partial<PokemonTeamModel> = {}): PokemonTeamModel {
  pokemonCounter++;
  return {
    id: 'PKMN' + pokemonCounter,
    idDex: 4,
    name: 'charmander',
    nameFr: 'Salamèche',
    level: 5,
    currXP: 135,
    xpForNextLvl: 179,
    xpFromLastLvl: 135,
    baseHp: 20,
    currHp: 20,
    atk: 11,
    atkChanges: 0,
    atkSpe: 12,
    atkSpeChanges: 0,
    def: 10,
    defChanges: 0,
    defSpe: 11,
    defSpeChanges: 0,
    speed: 13,
    speedChanges: 0,
    isShiny: false,
    frontSprite: 'front.png',
    backSprite: 'back.png',
    isSleeping: 0,
    isConfused: false,
    isBurning: false,
    isFrozen: false,
    isParalyzed: false,
    isPoisoned: false,
    types: [{slot: 1, name: 'fire'}],
    moves: [makeMove(), makeMove({id: 45, nameFr: 'Rugissement', power: 0, damageType: 'status'})],
    cantUseMoves: [],
    substitute: null as unknown as PokemonTeamModel,
    evolutionDetails: [{pokemonName: 'charmeleon', minLevel: 16, evolutionTrigger: 'level-up'}],
    ...overrides,
  };
}

export function defaultItems(): BagItemModel[] {
  return [
    {name: 'Pokeball', number: 15, type: 'ball'},
    {name: 'Superball', number: 10, type: 'ball'},
    {name: 'Hyperball', number: 5, type: 'ball'},
    {name: 'Masterball', number: 0, type: 'ball'},
    {name: 'Potion', number: 10, type: 'potion'},
    {name: 'Super Potion', number: 10, type: 'potion'},
    {name: 'Rappel', number: 1, type: 'potion'},
    {name: 'Antidote', number: 1, type: 'ailment'},
    {name: 'Pierre Feu', number: 1, type: 'special'},
    {name: 'Pierre Eau', number: 0, type: 'special'},
    {name: 'Super Bonbon', number: 0, type: 'special'},
  ];
}

export function makePath(): PathPoint[] {
  return [
    {x: 1, y: 1, environmentName: 'Plaine'},
    {x: 2, y: 1, environmentName: 'Foret'},
    {x: 3, y: 1, environmentName: 'Volcan'},
    {x: 3, y: 2, environmentName: 'Eau'},
    {x: 4, y: 1, environmentName: 'Centre'},
  ];
}

export function makePlayer(overrides: Partial<PlayerModel> = {}): PlayerModel {
  const path = makePath();
  return {
    _id: 'player-1',
    name: 'Sacha',
    sprite: 'red',
    roomId: 'ABC123',
    isHost: true,
    isPlayer: true,
    isTrainer: true,
    credits: 3000,
    team: [makePokemon()],
    items: defaultItems(),
    playerPath: {pathPoints: path},
    currentPath: path[0],
    mapFightCount: 0,
    ...overrides,
  };
}

export function makeWildOpponent(pokemon: Partial<PokemonTeamModel> = {}): PlayerModel {
  return makePlayer({
    _id: 'wild-1',
    name: 'Sauvage',
    sprite: '',
    roomId: '',
    isHost: false,
    isPlayer: false,
    isTrainer: false,
    items: [],
    team: [makePokemon({id: 'WILD1', idDex: 19, nameFr: 'Rattata', types: [{slot: 1, name: 'normal'}], ...pokemon})],
  });
}

export function makeTrainer(team: Partial<PokemonTeamModel>[] = [{}, {}, {}]): PlayerModel {
  return makePlayer({
    _id: 'trainer-1',
    name: 'Pierre',
    sprite: 'brock',
    isHost: false,
    isPlayer: false,
    isTrainer: true,
    items: [],
    team: team.map((p, i) => makePokemon({id: 'TR' + i, nameFr: 'Racaillou', ...p})),
  });
}

export function changes(overrides: Partial<PokemonChangesTurn> = {}): PokemonChangesTurn {
  return {hp: [], atk: 0, atkSpe: 0, def: 0, defSpe: 0, speed: 0, index: 0, ...overrides};
}

export function makeTurnContext(overrides: Partial<TurnContextModel> = {}): TurnContextModel {
  return {
    actionName: '',
    opponent: changes(),
    player: changes(),
    messages: [],
    prioMessages: [],
    ...overrides,
  };
}

export function makeStarter(id: number, nameFr: string, type: string): PokemonBaseModel {
  return {
    _id: 'base-' + id,
    id,
    name: nameFr.toLowerCase(),
    nameFr,
    moves: [],
    baseHappiness: 70,
    captureRate: 45,
    sprites: {
      backDefault: '', backFemale: '', backShiny: '', backShinyFemale: '',
      frontDefault: `front-${id}.png`, frontFemale: '', frontShiny: '', frontShinyFemale: '',
    },
    types: [{slot: 1, name: type}],
  };
}
