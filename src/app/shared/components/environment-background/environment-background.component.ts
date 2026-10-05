import {Component, effect} from '@angular/core';
import {EnvironmentService} from '../../../core/services/Environment/environment.service';

@Component({
  selector: 'app-environment-background',
  imports: [],
  // Styles globaux : src/styles/environment.css
  templateUrl: './environment-background.component.html'
})
export class EnvironmentBackgroundComponent {
  constructor(public environmentService: EnvironmentService) {
    // Expose l'environnement sur <html> : les plateformes de combat et autres décors suivent la même palette
    effect(() => {
      document.documentElement.dataset['env'] = this.environmentService.environment();
    });
  }
}
