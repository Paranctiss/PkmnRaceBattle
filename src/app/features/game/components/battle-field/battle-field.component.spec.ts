import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {BattleFieldComponent} from './battle-field.component';
import {FakeSignalRService, provideTestingDefaults} from '../../../../../testing/fake-signalr';
import {changes, makeMove, makePlayer, makePokemon, makeTrainer, makeTurnContext, makeWildOpponent} from '../../../../../testing/test-data';
import {HubService} from '../../../../core/services/Hub/hub.service';
import {PlayerModel, PokemonTeamModel} from '../../../../shared/models/player.model';
import {TurnContextModel} from '../../../../shared/models/turn-context.model';

describe('BattleFieldComponent (écran de combat)', () => {
  let fixture: ComponentFixture<BattleFieldComponent>;
  let component: BattleFieldComponent;
  let fake: FakeSignalRService;
  let hub: HubService;
  let mine: PokemonTeamModel;
  let foe: PlayerModel;

  function create(opponent: PlayerModel = makeWildOpponent({currHp: 20, baseHp: 20}), team: PokemonTeamModel[] = []) {
    fake = new FakeSignalRService();
    TestBed.configureTestingModule({imports: [BattleFieldComponent], providers: provideTestingDefaults(fake)});
    hub = TestBed.inject(HubService);
    hub.userId = 'player-1';
    mine = makePokemon({id: 'MINE', nameFr: 'Salamèche', baseHp: 40, currHp: 40});
    hub.Player = makePlayer({team: [mine, ...team]});
    foe = opponent;
    fixture = TestBed.createComponent(BattleFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('PlayerPokemon', mine);
    fixture.componentRef.setInput('OppositePokemon', foe.team[0]);
    fixture.componentRef.setInput('Opponent', foe);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const dialog = () => el().querySelector('.dialog__text')?.textContent?.trim();

  function play(ctx: TurnContextModel) {
    fixture.componentRef.setInput('TurnContext', ctx);
    fixture.detectChanges();
  }

  describe('déroulé d’un tour', () => {
    it('messages prioritaires, puis barre de vie, puis messages', fakeAsync(() => {
      create();
      play(makeTurnContext({prioMessages: ['Salamèche lance Griffe'], opponent: changes({hp: [6]}), messages: ['Coup critique !']}));

      expect(dialog()).toBe('Salamèche lance Griffe');
      expect(foe.team[0].currHp).toBe(20);

      tick(1000);
      fixture.detectChanges();
      expect(foe.team[0].currHp).toBe(14);

      tick(500);
      fixture.detectChanges();
      expect(dialog()).toBe('Coup critique !');

      tick(1000);
      fixture.detectChanges();
      expect(component.logs).toEqual(['Coup critique !', 'Salamèche lance Griffe']);
    }));

    it('plusieurs coups : la barre de vie descend coup par coup', fakeAsync(() => {
      create();
      play(makeTurnContext({opponent: changes({hp: [3, 4, 5]})}));
      tick();
      expect(foe.team[0].currHp).toBe(17);
      tick(500);
      expect(foe.team[0].currHp).toBe(13);
      tick(500);
      expect(foe.team[0].currHp).toBe(8);
      flush();
    }));

    it('dégâts subis par le joueur', fakeAsync(() => {
      create();
      play(makeTurnContext({player: changes({hp: [12]})}));
      tick();
      expect(mine.currHp).toBe(28);
      flush();
    }));

    it('un soin est envoyé en valeur négative et fait remonter la barre', fakeAsync(() => {
      create();
      mine.currHp = 10;
      play(makeTurnContext({player: changes({hp: [-20]})}));
      tick();
      expect(mine.currHp).toBe(30);
      flush();
    }));

    it('objet utilisé sur un autre Pokémon de l’équipe (index)', fakeAsync(() => {
      const benched = makePokemon({id: 'BENCH', currHp: 5, baseHp: 30});
      create(undefined, [makePokemon(), benched]);
      play(makeTurnContext({player: changes({hp: [-20], index: 2})}));
      tick();
      expect(hub.Player.team[2].currHp).toBe(25);
      expect(mine.currHp).toBe(40);
      flush();
    }));

    it('le clone encaisse à la place du Pokémon', fakeAsync(() => {
      create();
      mine.substitute = makePokemon({nameFr: 'Salamèche (Clone)', currHp: 10, baseHp: 10});
      play(makeTurnContext({player: changes({hp: [4]})}));
      tick();
      expect(mine.substitute.currHp).toBe(6);
      expect(mine.currHp).toBe(40);
      flush();
    }));

    it('affiche le clone à la place du Pokémon', () => {
      create();
      mine.substitute = makePokemon({nameFr: 'Salamèche (Clone)', backSprite: '/assets/substituteback.png'});
      fixture.detectChanges();
      expect(el().querySelector('.sprite--ally')?.getAttribute('src')).toBe('/assets/substituteback.png');
    });

    it('applique les changements de stats aux deux Pokémon', fakeAsync(() => {
      create();
      play(makeTurnContext({player: changes({atk: 2, speed: -1}), opponent: changes({def: -1, atkSpe: 1})}));
      tick();
      expect(mine.atkChanges).toBe(2);
      expect(mine.speedChanges).toBe(-1);
      expect(foe.team[0].defChanges).toBe(-1);
      expect(foe.team[0].atkSpeChanges).toBe(1);
      flush();
    }));
  });

  describe('commandes', () => {
    it('invite le joueur à choisir une action', () => {
      create();
      expect(dialog()).toBe('Que doit faire Salamèche ?');
      expect(el().querySelectorAll('.move').length).toBe(2);
    });

    it('choisir une capacité émet UsingMove', () => {
      create();
      const spy = spyOn(component.UsingMove, 'emit');
      (el().querySelector('.move') as HTMLButtonElement).click();
      expect(spy).toHaveBeenCalledWith(mine.moves[0]);
    });

    it('commandes masquées pendant qu’une action est en cours', () => {
      create();
      hub.pending = true;
      fixture.detectChanges();
      expect(el().querySelector('.command-panel')).toBeNull();
    });

    it('attaque en deux tours : bouton « Continuer » qui rejoue la même capacité', () => {
      create();
      mine.waitingMove = makeMove({nameFr: 'Vol'});
      fixture.detectChanges();
      expect(el().querySelector('app-pokemon-moves')).toBeNull();
      const spy = spyOn(component.UsingMove, 'emit');
      const button = el().querySelector('.command-panel--single button') as HTMLButtonElement;
      expect(button.textContent).toContain('Continuer : Vol');
      button.click();
      expect(spy).toHaveBeenCalledWith(mine.waitingMove);
    });

    it('Pokémon intouchable (Vol / Tunnel) : sprite masqué', () => {
      create();
      mine.untargetable = 'Vol';
      foe.team[0].untargetable = 'Tunnel';
      fixture.detectChanges();
      expect(el().querySelector('.sprite--ally')).toBeNull();
      expect(el().querySelector('.sprite--foe')).toBeNull();
    });

    it('ouvre la carte', () => {
      create();
      component.OpenMap();
      fixture.detectChanges();
      expect(el().querySelector('app-map')).not.toBeNull();
    });
  });

  describe('PvP : attente de l’adversaire', () => {
    it('affiche l’attente puis repart au résultat du tour', () => {
      create(makePlayer({_id: 'blue', name: 'Blue', isPlayer: true}));
      fake.connection.emit('waitingOpponent');
      fixture.detectChanges();
      expect(dialog()).toBe('En attente de l’adversaire…');
      expect(hub.pending).toBeTrue();
      expect(el().querySelector('.command-panel')).toBeNull();

      fake.connection.emit('useMoveResult', makeTurnContext());
      fixture.detectChanges();
      expect(component.waitingOpponent).toBeFalse();
    });

    it('l’adversaire change de Pokémon', () => {
      create(makePlayer({_id: 'blue', isPlayer: true}));
      const newFoe = makePokemon({nameFr: 'Racaillou'});
      fake.connection.emit('foeSwapPokemon', newFoe, 'Blue change de Pokémon');
      fixture.detectChanges();
      expect(component.OppositePokemon).toBe(newFoe);
      expect(dialog()).toBe('Blue change de Pokémon');
    });
  });

  describe('sac', () => {
    const item = (name: string) => hub.Player.items.find(i => i.name === name)!;

    it('Pokéball : lancée directement sur l’adversaire', () => {
      create();
      component.itemClicked(item('Pokeball'));
      expect(fake.connection.lastInvocation('HandleMove')?.args).toEqual(['player-1', 'MINE', 'item:Pokeball:ball', 'wild-1', 'WILD1', true, false, 0, false]);
      expect(hub.pending).toBeTrue();
    });

    it('Potion : choix du Pokémon puis utilisation sur celui-ci', () => {
      create(undefined, [makePokemon({id: 'P2', currHp: 1})]);
      component.itemClicked(item('Potion'));
      fixture.detectChanges();
      expect(el().querySelector('app-game-modal')?.textContent).toContain('Sur quel Pokémon utiliser Potion ?');

      (el().querySelectorAll('.party-pick')[1] as HTMLButtonElement).click();

      expect(fake.connection.lastInvocation('HandleMove')?.args).toEqual(['player-1', 'MINE', 'item:Potion:potion', 'wild-1', 'WILD1', true, false, 1, false]);
    });

    it('objet épuisé : message et rien n’est envoyé', fakeAsync(() => {
      create();
      component.itemClicked(item('Masterball'));
      fixture.detectChanges();
      expect(fake.connection.invoked('HandleMove').length).toBe(0);
      expect(component.currentMessage).toContain('Masterball');
      flush();
    }));

    it('pierre d’évolution refusée sur un Pokémon incompatible', () => {
      create();
      component.itemClicked(item('Pierre Feu'));
      component.replacePokemon(mine, 0);
      expect(fake.connection.invoked('HandleMove').length).toBe(0);
    });

    it('pierre d’évolution sur un Pokémon compatible (sans tour pour l’adversaire)', () => {
      const vulpix = makePokemon({id: 'VULPIX', nameFr: 'Goupix', evolutionDetails: [{pokemonName: 'ninetales', evolutionTrigger: 'use-item', item: 'fire-stone'}]});
      create(undefined, [vulpix]);
      component.itemClicked(item('Pierre Feu'));
      component.replacePokemon(vulpix, 1);
      expect(fake.connection.lastInvocation('HandleMove')?.args).toEqual(['player-1', 'MINE', 'item:Pierre Feu:special', 'wild-1', 'WILD1', true, false, 1, true]);
    });

    it('compatibilité des pierres et du Super Bonbon', () => {
      create();
      const eevee = makePokemon({evolutionDetails: [
        {pokemonName: 'vaporeon', evolutionTrigger: 'use-item', item: 'water-stone'},
        {pokemonName: 'jolteon', evolutionTrigger: 'use-item', item: 'thunder-stone'},
        {pokemonName: 'flareon', evolutionTrigger: 'use-item', item: 'fire-stone'},
      ]});
      const stone = (name: string) => ({name, number: 1, type: 'special'});
      expect(component.canEvolveWithItem(eevee, stone('Pierre Eau'))).toBeTrue();
      expect(component.canEvolveWithItem(eevee, stone('Pierre Foudre'))).toBeTrue();
      expect(component.canEvolveWithItem(eevee, stone('Pierre Lune'))).toBeFalse();
      expect(component.canEvolveWithItem(mine, stone('Pierre Feu'))).toBeFalse();
      expect(component.canEvolveWithItem(mine, stone('Super Bonbon'))).toBeTrue();
      expect(component.canEvolveWithItem(mine, {name: 'Potion', number: 1, type: 'potion'})).toBeTrue();
    });
  });

  describe('changement de Pokémon', () => {
    it('envoie le Pokémon choisi au combat', () => {
      create(undefined, [makePokemon({id: 'P2', nameFr: 'Carapuce'})]);
      component.openReplacePokemon = true;
      fixture.detectChanges();
      (el().querySelectorAll('.party-pick')[1] as HTMLButtonElement).click();
      expect(fake.connection.lastInvocation('ReplacePokemon')?.args).toEqual(['player-1', 'P2', 'wild-1', false]);
      expect(component.openReplacePokemon).toBeFalse();
    });

    it('impossible d’envoyer le Pokémon déjà au combat ou un Pokémon K.O.', () => {
      create(undefined, [makePokemon({id: 'KO', currHp: 0})]);
      component.replacePokemon(hub.Player.team[0], 0);
      component.replacePokemon(hub.Player.team[1], 1);
      expect(fake.connection.invoked('ReplacePokemon').length).toBe(0);
    });

    it('le serveur confirme le changement', fakeAsync(() => {
      create();
      const water = makePokemon({nameFr: 'Carapuce'});
      fake.connection.emit('swapPokemon', water, 'Sacha change de Pokémon');
      fixture.detectChanges();
      expect(component.PlayerPokemon).toBe(water);
      expect(dialog()).toBe('Sacha change de Pokémon');
      flush();
    }));

    it('Pokémon K.O. : message puis ouverture du choix du remplaçant', fakeAsync(() => {
      create(undefined, [makePokemon()]);
      fake.connection.emit('playerPokemonDeath', 'Salamèche est K.O');
      fixture.detectChanges();
      expect(dialog()).toBe('Salamèche est K.O');
      expect(hub.pending).toBeTrue();
      tick(1000);
      fixture.detectChanges();
      expect(component.openReplacePokemon).toBeTrue();
      flush();
    }));

    it('changement forcé (K.O. ou Cyclone) : fenêtre non fermable, le Pokémon au combat est refusé', fakeAsync(() => {
      const other = makePokemon({id: 'OTHER', nameFr: 'Carapuce', currHp: 20});
      create(undefined, [other]);
      fake.connection.emit('playerPokemonDeath', 'Changez de Pokémon');
      tick(1000);
      fixture.detectChanges();
      expect(component.openReplacePokemon).toBeTrue();

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      fixture.detectChanges();
      expect(component.openReplacePokemon).toBeTrue();

      (el().querySelectorAll('.party-pick')[0] as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.openReplacePokemon).toBeTrue();
      expect(fake.connection.invoked('ReplacePokemon').length).toBe(0);
      expect(dialog()).toBe('Salamèche est déjà au combat');

      (el().querySelectorAll('.party-pick')[1] as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(fake.connection.lastInvocation('ReplacePokemon')?.args).toEqual(['player-1', 'OTHER', 'wild-1', false]);
      expect(component.openReplacePokemon).toBeFalse();
      flush();
    }));

    it('défaite : message et plus aucune action', fakeAsync(() => {
      create();
      fake.connection.emit('playerLooseFight', 'Vous n\'avez plus de pokémon en forme');
      fixture.detectChanges();
      expect(dialog()).toContain('plus de pokémon en forme');
      expect(hub.pending).toBeTrue();
      flush();
    }));
  });

  describe('capture', () => {
    it('lancer : la Poké Ball remplace le sprite adverse', () => {
      create();
      fake.connection.emit('launchBall', 'Superball', makeTurnContext());
      fixture.detectChanges();
      expect(el().querySelector('.ballImg')?.getAttribute('src')).toBe('/assets/balls-sprites/Superball.webp');
      expect(el().querySelector('.sprite--foe')).toBeNull();
    });

    it('échec après 2 secousses : le Pokémon s’échappe', fakeAsync(() => {
      create();
      fake.connection.emit('launchBall', 'Pokeball', makeTurnContext());
      fake.connection.emit('catchResult', 2);
      tick(2000);
      fixture.detectChanges();
      expect(component.catchingBall).toBe('');
      expect(component.currentMessage).toContain('s\'est échappé');
      flush();
    }));

    it('réussite : message de capture', fakeAsync(() => {
      create();
      fake.connection.emit('launchBall', 'Pokeball', makeTurnContext());
      fake.connection.emit('catchResult', -1);
      tick(3000);
      expect(component.currentMessage).toContain('Tu as capturé Rattata');
      flush();
    }));

    it('Pokémon capturé avec une place libre : ajouté à la fin de l’équipe', fakeAsync(() => {
      create();
      fake.connection.emit('caughtPokemon', foe);
      expect(fake.connection.lastInvocation('AddPokemonToTeam')?.args).toEqual(['player-1', 'wild-1', -1]);
      expect(component.currentMessage).toContain('Rattata a été ajouté à l\'équipe');
      flush();
    }));

    it('équipe pleine : le joueur choisit qui remplacer', fakeAsync(() => {
      create(undefined, [makePokemon(), makePokemon(), makePokemon(), makePokemon(), makePokemon()]);
      fake.connection.emit('caughtPokemon', foe);
      fixture.detectChanges();
      expect(fake.connection.invoked('AddPokemonToTeam').length).toBe(0);
      expect(el().querySelector('app-game-modal')?.textContent).toContain('Équipe complète');

      (el().querySelectorAll('.party-pick')[3] as HTMLButtonElement).click();
      expect(fake.connection.lastInvocation('AddPokemonToTeam')?.args).toEqual(['player-1', 'wild-1', 3]);
      flush();
    }));

    it('équipe pleine : la fenêtre ne se ferme pas sans choix, le joueur peut relâcher le Pokémon', fakeAsync(() => {
      create(undefined, [makePokemon(), makePokemon(), makePokemon(), makePokemon(), makePokemon()]);
      fake.connection.emit('caughtPokemon', foe);
      fixture.detectChanges();

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      fixture.detectChanges();
      expect(component.openReplacePokemon).toBeTrue();
      expect(fake.connection.invoked('AddPokemonToTeam').length).toBe(0);

      (Array.from(el().querySelectorAll('app-game-modal button')).find(b => b.textContent?.includes('Relâcher')) as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(fake.connection.lastInvocation('AddPokemonToTeam')?.args).toEqual(['player-1', 'wild-1', -1]);
      expect(component.openReplacePokemon).toBeFalse();
      expect(component.currentMessage).toContain('a été relâché');
      flush();
    }));
  });

  describe('montée de niveau', () => {
    it('affiche les messages séparés par « | » les uns après les autres', fakeAsync(() => {
      create();
      fake.connection.emit('pokemonLevelUp', 'Salamèche monte niveau 16|Salamèche a évolué en Reptincel', mine, []);
      fixture.detectChanges();
      expect(dialog()).toBe('Salamèche monte niveau 16');
      tick(1000);
      fixture.detectChanges();
      expect(dialog()).toBe('Salamèche a évolué en Reptincel');
      flush();
    }));
  });

  describe('dresseur adverse', () => {
    it('affiche le dresseur et ses Poké Balls (grisées pour les Pokémon K.O.)', () => {
      create(makeTrainer([{currHp: 0}, {}, {}]));
      expect(el().querySelector('.foe-trainer')?.getAttribute('src')).toBe('assets/trainers-sprites/brock.png');
      const balls = el().querySelectorAll('.hud__balls img');
      expect(balls.length).toBe(3);
      expect(balls[0].classList).toContain('is-out');
    });
  });

  it('se désabonne des événements du serveur à la destruction', () => {
    create();
    expect(fake.connection.listens('playerPokemonDeath')).toBeTrue();
    fixture.destroy();
    ['launchBall', 'catchResult', 'pokemonLevelUp', 'caughtPokemon', 'playerPokemonDeath', 'swapPokemon', 'waitingOpponent']
      .forEach(e => expect(fake.connection.listens(e)).toBeFalse());
  });
});
