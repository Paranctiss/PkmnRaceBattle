import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {EnvironmentService} from '../../core/services/Environment/environment.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router:Router, environmentService: EnvironmentService) {
    // Retour à l'écran titre : on revient au décor de départ
    environmentService.setEnvironment('Plaine');
  }
  host() {
    this.router.navigate(['/starter'], { queryParams: { host: true } });
  }
  join(){
    this.router.navigate(['/starter'], { queryParams: { host: false } });
  }
}
