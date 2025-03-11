import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {StarterSelectionComponent} from './features/starter-selection/starter-selection.component';
import {WaitingRoomComponent} from './features/waiting-room/waiting-room.component';
import {GameComponent} from './features/game/game.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
  { path: 'starter', component: StarterSelectionComponent, data: { animation: 'StarterSelectionPage' } },
  { path: 'room', component: WaitingRoomComponent, data: { animation: 'WaitingRoomPage' } },
  { path: 'game', component: GameComponent, data: { animation: 'GamePage' } },
  { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
