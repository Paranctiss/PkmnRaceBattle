// Durées du jeu (ms). Le serveur attend la fin de ces animations (GameDelay / TurnContext.CalculateDelay
// dans PkmnRaceBattle.API) : modifier les deux ensemble.
export const MESSAGE_DELAY = 700;            // un message de combat
export const HP_CHANGE_DELAY = 300;          // une variation de PV
export const BALL_SHAKE_DELAY = 600;         // une secousse de Poké Ball
export const STANDALONE_MESSAGE_DELAY = 1400; // message isolé (changement de Pokémon, capture, achat…)
