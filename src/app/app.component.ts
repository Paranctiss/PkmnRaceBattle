import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {routeAnimations} from './shared/animations/route.animations';
import {ImageConfigService} from './core/services/ImageConfigService/image-config.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'PkmnRaceBattle';
  environment: string = "plains";

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  constructor(private imageConfigService: ImageConfigService) {}

  ngOnInit() {
    this.imageConfigService.disableDragForAllImages();
  }

  changeEnvironment(environment: string) {
    this.environment = environment;
  }


}
