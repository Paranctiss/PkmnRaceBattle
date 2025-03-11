import { TestBed } from '@angular/core/testing';

import { PokemonBaseService } from './pokemon-base.service';

describe('PokemonBaseService', () => {
  let service: PokemonBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
