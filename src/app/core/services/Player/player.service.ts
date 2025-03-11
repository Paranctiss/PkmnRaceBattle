import { Injectable } from '@angular/core';
import {HubService} from '../Hub/hub.service';
import {PlayerModel} from '../../../shared/models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private hubService:HubService) {

  }
}
