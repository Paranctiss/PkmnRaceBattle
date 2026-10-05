// Icônes en pixel art (grilles 12x12). Chaque caractère est un pixel, '.' = transparent.

export interface PixelIconDefinition {
  palette: Record<string, string>;
  rows: string[];
}

const INK = '#1d2236';

export const PIXEL_ICONS: Record<string, PixelIconDefinition> = {
  // Hautes herbes
  Plaine: {
    palette: { k: INK, g: '#9be070', G: '#58a83e', d: '#2f6b2a' },
    rows: [
      '............',
      '..k.....k...',
      '.kgk...kgk..',
      '.kgk.k.kgk.k',
      'kgGkkgkkgGkg',
      'kgGkgGkkgGkG',
      'kgGkgGkgGGkG',
      'kGGGgGGgGGGk',
      'kGGGGGGGGGGk',
      'kdGdGdGdGdGk',
      '.kkkkkkkkkk.',
      '............',
    ],
  },
  // Sapin
  Foret: {
    palette: { k: INK, g: '#7ccf55', G: '#3f8f38', d: '#255c2a', b: '#8a5a2b' },
    rows: [
      '.....kk.....',
      '....kggk....',
      '....kgGk....',
      '...kggGGk...',
      '...kgGGdk...',
      '..kggGGGdk..',
      '..kgGGGddk..',
      '.kggGGGGGdk.',
      '.kgGGGGGddk.',
      'kkkkkbbkkkkk',
      '....kbbk....',
      '....kkkk....',
    ],
  },
  // Volcan en éruption
  Volcan: {
    palette: { k: INK, y: '#ffd23f', r: '#ff6a2b', m: '#8a5240', M: '#563126' },
    rows: [
      '..y...r..y..',
      '....r.y.r...',
      '.....rr.....',
      '....krrk....',
      '....kmrk....',
      '...kmmrMk...',
      '...kmmmMk...',
      '..kmmmmMMk..',
      '..kmmmmmMk..',
      '.kmmmmmmMMk.',
      'kmmmmmmmmMMk',
      'kkkkkkkkkkkk',
    ],
  },
  // Entrée de grotte
  Grotte: {
    palette: { k: INK, l: '#c9b8a2', s: '#9a8672', S: '#66564a', h: '#2a2320' },
    rows: [
      '............',
      '....kkkkk...',
      '..kkllsssk..',
      '.kllsssssSk.',
      '.klsskkkSSk.',
      'klsskhhhkSSk',
      'klskhhhhhkSk',
      'ksskhhhhhkSk',
      'ksskhhhhhkSk',
      'ksskhhhhhkSk',
      'kSSkhhhhhkSk',
      'kkkkkkkkkkkk',
    ],
  },
  // Éclair
  Centrale: {
    palette: { k: INK, y: '#ffd84a', Y: '#e0a400' },
    rows: [
      '......kkkkk.',
      '.....kyyyk..',
      '....kyyyk...',
      '...kyyyk....',
      '..kyyyykkkk.',
      '.kyyyyyyyyk.',
      '.kkkkkyyYk..',
      '....kyyYk...',
      '...kyyYk....',
      '..kyYk......',
      '..kyk.......',
      '..kk........',
    ],
  },
  // Goutte d'eau
  Eau: {
    palette: { k: INK, b: '#4aa6ec', B: '#1f6cb5', l: '#d2efff' },
    rows: [
      '.....kk.....',
      '....kbbk....',
      '....kbbk....',
      '...kbbbbk...',
      '...kbbbbk...',
      '..kblbbbbk..',
      '..klbbbbbk..',
      '.kblbbbbBBk.',
      '.kblbbbbbBk.',
      '.kbbbbbbBBk.',
      '..kbbbBBBk..',
      '...kkkkkk...',
    ],
  },
  // Boutique (auvent rayé)
  Shop: {
    palette: { k: INK, B: '#3d7fd6', b: '#cfe3ff', w: '#fbf6e8', d: '#e3d6b4', g: '#9fd0ff' },
    rows: [
      '............',
      '.kkkkkkkkkk.',
      'kBbBbBbBbBbk',
      'kBbBbBbBbBbk',
      '.kkkkkkkkkk.',
      '.kwwwwwwwwk.',
      '.kwkkwwkkwk.',
      '.kwkgwwkgwk.',
      '.kwwwkkwwwk.',
      '.kwwwkdkwwk.',
      '.kdddkdkddk.',
      '.kkkkkkkkkk.',
    ],
  },
  // Cœur (Centre Pokémon)
  Centre: {
    palette: { k: INK, p: '#f06c8f', P: '#b8405f', w: '#ffe3ea' },
    rows: [
      '............',
      '.kkk...kkk..',
      'kpppk.kpppk.',
      'kpwppkpppPk.',
      'kpwpppppppk.',
      'kpppppppPPk.',
      '.kpppppPPk..',
      '..kpppPPk...',
      '...kpPPk....',
      '....kPk.....',
      '.....k......',
      '............',
    ],
  },
  // Poké Ball (action "Pokémon")
  Ball: {
    palette: { k: INK, r: '#e3350d', R: '#a3260a', w: '#ffffff', g: '#c9c9d4' },
    rows: [
      '....kkkk....',
      '..kkrrrrkk..',
      '.krwwrrrrRk.',
      '.krwrrrrrRk.',
      'krrrrkkrrrRk',
      'kkkkkwwkkkkk',
      'kkkkkwwkkkkk',
      'kwwwwkkwwwgk',
      '.kwwwwwwwggk',
      '.kwwwwwwggk.',
      '..kkwwwwkk..',
      '....kkkk....',
    ],
  },
  // Porte de sortie
  Exit: {
    palette: { k: INK, d: '#7a4a24', b: '#c58b4f', y: '#ffcb05' },
    rows: [
      'kkkkkk......',
      'kddddk......',
      'kdbbdk......',
      'kdbbdk.k....',
      'kdbbdk.kk...',
      'kdbkkkkkyk..',
      'kdbkyyyyyyk.',
      'kdbkkkkkyk..',
      'kdbbdk.kk...',
      'kdbbdk.k....',
      'kddddk......',
      'kkkkkk......',
    ],
  },
  // Point de départ / inconnu
  Default: {
    palette: { k: INK, w: '#fbf6e8', y: '#ffcb05' },
    rows: [
      '............',
      '.....kk.....',
      '....kyyk....',
      '....kyyk....',
      '.kkkkyykkkk.',
      '.kyyyyyyyyk.',
      '..kyyyyyyk..',
      '...kyyyyk...',
      '..kyykkyyk..',
      '..kyk..kyk..',
      '..kk....kk..',
      '............',
    ],
  },
};
