import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {routeAnimations} from './shared/animations/route.animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'PkmnRaceBattle';
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
