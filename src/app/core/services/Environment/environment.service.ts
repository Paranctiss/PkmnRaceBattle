import {Injectable, signal} from '@angular/core';

export const ENVIRONMENTS = ['Plaine', 'Foret', 'Volcan', 'Centrale', 'Grotte', 'Eau'] as const;
export type EnvironmentName = typeof ENVIRONMENTS[number];

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly _environment = signal<EnvironmentName>('Plaine');
  readonly environment = this._environment.asReadonly();

  setEnvironment(environment: string) {
    // Le serveur peut envoyer des noms accentués ("Forêt") : on normalise pour matcher les classes CSS
    const normalized = environment.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const match = ENVIRONMENTS.find(e => e.toLowerCase() === normalized.toLowerCase());
    if (match && match !== this._environment()) {
      this._environment.set(match);
    }
  }
}
