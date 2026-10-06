import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {PokemonBaseService} from './PokemonBase/pokemon-base.service';
import {PokemonTypeService} from './PokemonType/pokemon-type.service';
import {ENVIRONMENTS, EnvironmentService} from './Environment/environment.service';
import {provideTestingDefaults} from '../../../testing/fake-signalr';
import {getEnvironmentInfo, isFightEnvironment, normalizeEnvironmentName} from '../../shared/utils/environment';
import {getItemDescription, getItemSprite, ITEM_CATALOG, ITEM_POCKETS} from '../../shared/utils/items';

describe('PokemonBaseService', () => {
  it('charge un Pokémon par son numéro (seul appel REST du client)', () => {
    TestBed.configureTestingModule({providers: provideTestingDefaults()});
    const service = TestBed.inject(PokemonBaseService);
    const http = TestBed.inject(HttpTestingController);
    let result: any;

    service.getPokemonById(7).subscribe(r => result = r);

    const request = http.expectOne(r => r.url.endsWith('/Pokemon/7'));
    expect(request.request.method).toBe('GET');
    request.flush({id: 7, nameFr: 'Carapuce'});
    expect(result.nameFr).toBe('Carapuce');
    http.verify();
  });
});

describe('PokemonTypeService', () => {
  const service = new PokemonTypeService();
  const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  it('a une couleur et un libellé français pour chaque type présent dans les données', () => {
    types.forEach(type => {
      expect(service.getColorByType(type)).toMatch(/^#[0-9a-f]{6}$/);
      expect(service.getLabelByType(type)).not.toBe('???');
    });
  });

  it('libellés français', () => {
    expect(service.getLabelByType('fire')).toBe('Feu');
    expect(service.getLabelByType('electric')).toBe('Électrik');
    expect(service.getLabelByType('ghost')).toBe('Spectre');
  });

  it('ignore la casse et gère les types inconnus', () => {
    expect(service.getColorByType('FIRE')).toBe(service.getColorByType('fire'));
    expect(service.getLabelByType('inconnu')).toBe('???');
    expect(service.getLabelByType(undefined as unknown as string)).toBe('???');
  });

  it('texte foncé sur les types clairs, blanc sur les types sombres', () => {
    expect(service.getTextColorByType('electric')).toBe('#1d2236');
    expect(service.getTextColorByType('ghost')).toBe('#ffffff');
  });
});

describe('EnvironmentService (fond de la zone)', () => {
  let service: EnvironmentService;
  beforeEach(() => service = new EnvironmentService());

  it('Plaine par défaut', () => {
    expect(service.environment()).toBe('Plaine');
  });

  it('accepte chaque environnement de combat envoyé par le serveur', () => {
    ENVIRONMENTS.forEach(env => {
      service.setEnvironment(env);
      expect(service.environment()).toBe(env);
    });
  });

  it('normalise les accents et la casse', () => {
    service.setEnvironment('Forêt');
    expect(service.environment()).toBe('Foret');
    service.setEnvironment('grotte');
    expect(service.environment()).toBe('Grotte');
  });

  it('garde le décor précédent pour une halte ou un nom inconnu', () => {
    service.setEnvironment('Volcan');
    service.setEnvironment('Shop');
    service.setEnvironment('Centre');
    service.setEnvironment('Default');
    expect(service.environment()).toBe('Volcan');
  });
});

describe('Utilitaires des environnements (carte)', () => {
  it('infos d’affichage de chaque map', () => {
    expect(getEnvironmentInfo('Foret').label).toBe('Forêt');
    expect(getEnvironmentInfo('Centre').label).toBe('Centre Pokémon');
    expect(getEnvironmentInfo('Shop').label).toBe('Boutique');
    expect(getEnvironmentInfo('Default').label).toBe('Départ');
  });

  it('normalise les variantes', () => {
    expect(normalizeEnvironmentName('Forêt')).toBe('Foret');
    expect(normalizeEnvironmentName('center')).toBe('Centre');
    expect(normalizeEnvironmentName('EAU')).toBe('Eau');
  });

  it('distingue les maps de combat des haltes', () => {
    ['Plaine', 'Foret', 'Volcan', 'Grotte', 'Centrale', 'Eau'].forEach(env => expect(isFightEnvironment(env)).toBeTrue());
    ['Shop', 'Centre', 'Default', 'Inconnu'].forEach(env => expect(isFightEnvironment(env)).toBeFalse());
  });
});

describe('Catalogue des objets', () => {
  it('chaque objet est rangé dans une poche existante', () => {
    const pockets = ITEM_POCKETS.map(p => p.key);
    ITEM_CATALOG.forEach(item => expect(pockets).toContain(item.pocket));
  });

  it('chaque objet a un prix et une description', () => {
    ITEM_CATALOG.forEach(item => {
      expect(item.price).toBeGreaterThan(0);
      expect(getItemDescription(item.name)).not.toBe('');
    });
  });

  it('chemin du sprite sans espaces', () => {
    expect(getItemSprite('Super Potion')).toBe('assets/items-sprites/Super_Potion.png');
  });
});
