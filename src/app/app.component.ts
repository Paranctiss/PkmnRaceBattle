import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {routeAnimations} from './shared/animations/route.animations';
import {ImageConfigService} from './core/services/ImageConfigService/image-config.service';
import {EnvironmentBackgroundComponent} from './shared/components/environment-background/environment-background.component';
import {HubService} from './core/services/Hub/hub.service';
import {PlayerModel} from './shared/models/player.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EnvironmentBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations]
})
export class AppComponent implements OnInit {
  title = 'PkmnRaceBattle';

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  constructor(private imageConfigService: ImageConfigService, private hubService:HubService) {}

  ngOnInit() {
    this.imageConfigService.disableDragForAllImages();
  }

}
