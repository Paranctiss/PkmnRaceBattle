import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PokemonBaseModel} from '../../../shared/models/pokemon-base.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonBaseService {
  private baseUrl = 'https://localhost:7165/Pokemon/';
  constructor(private http: HttpClient) {}

  getPokemonById(id: number): Observable<PokemonBaseModel> {
    const url = `${this.baseUrl}${id}`; // Construit l'URL avec l'ID
    return this.http.get<PokemonBaseModel>(url); // Effectue la requête GET
  }
}
